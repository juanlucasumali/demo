import { supabase } from "@renderer/lib/supabase"
import { UserProfile } from "@renderer/types/users"
import { b2Service } from "./b2-service"
import { DemoItem } from "@renderer/types/items"

// Cache for avatar URLs to prevent multiple blob URL creations
const avatarUrlCache = new Map<string, string>()

export async function createProfile(data: UserProfile, avatarInfo?: { b2FileId: string, fileName: string }) {
  const { error } = await supabase
    .from('users')
    .insert({
      ...data,
      avatar: avatarInfo?.b2FileId || null
    })
  
  if (error) {
    // If profile creation fails and we have avatar info, clean up the uploaded avatar
    if (avatarInfo) {
      try {
        await b2Service.removeFile(avatarInfo.b2FileId, avatarInfo.fileName)
        console.log('Cleaned up avatar file after profile creation failure')
      } catch (cleanupError) {
        console.error('Failed to clean up avatar file:', cleanupError)
      }
    }
    console.error('Profile creation failed:', error)
    throw error
  }
  return { error: null }
}

export async function uploadAvatar(userId: string, file: File): Promise<{b2FileId: string, fileName: string}> {
  try {
    // Convert File to ArrayBuffer
    const buffer = await file.arrayBuffer()
    
    // Generate a unique storage path for the avatar
    const fileExt = file.name.split('.').pop()
    const fileName = `avatars/${userId}-${Date.now()}.${fileExt}`
    
    // Upload to B2
    const b2FileId = await b2Service.storeAvatar(
      userId,
      'avatar',
      fileName,
      buffer
    )
    
    return { b2FileId, fileName }
  } catch (error) {
    console.error('Avatar upload failed:', error)
    throw error
  }
}

export async function getProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error

  const profile = data as UserProfile

  // If profile has an avatar, get its URL
  if (profile.avatar) {
    try {
      profile.avatar = await getAvatarUrl(profile.avatar)
    } catch (error) {
      console.error('Failed to load avatar:', error)
      profile.avatar = null
    }
  }

  return profile
}

export async function checkHasProfile(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single()
  
  return !!data && !error
}

export async function getAvatar(b2FileId: string): Promise<ArrayBuffer> {
  try {
    return await b2Service.retrieveFile(b2FileId)
  } catch (error) {
    console.error('Failed to get avatar:', error)
    throw error
  }
}

export async function getAvatarUrl(b2FileId: string): Promise<string> {
  // Check cache first
  if (avatarUrlCache.has(b2FileId)) {
    return avatarUrlCache.get(b2FileId)!
  }

  try {
    const avatarData = await b2Service.retrieveFile(b2FileId)
    const blob = new Blob([avatarData])
    const url = URL.createObjectURL(blob)
    
    // Store in cache
    avatarUrlCache.set(b2FileId, url)
    
    return url
  } catch (error) {
    console.error('Failed to get avatar URL:', error)
    throw error
  }
}

export async function updateHighlights(userId: string, items: DemoItem[]) {
  // First delete existing highlights
  const { error: deleteError } = await supabase
    .from('highlights')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    console.error('Failed to delete existing highlights:', deleteError)
    throw deleteError
  }

  // If there are no items to add, we're done
  if (items.length === 0) return

  // Insert new highlights with positions
  const highlights = items.map((item, index) => ({
    user_id: userId,
    file_id: item.id,
    position: index
  }))

  const { error } = await supabase
    .from('highlights')
    .upsert(highlights, {
      onConflict: 'user_id,position',
      ignoreDuplicates: false
    })

  if (error) {
    console.error('Failed to update highlights:', error)
    throw error
  }
}

export async function getHighlights(userId: string): Promise<DemoItem[]> {
  const { data, error } = await supabase
    .from('highlights')
    .select(`
      position,
      file:file_id (*)
    `)
    .eq('user_id', userId)
    .order('position')

  if (error) {
    console.error('Failed to get highlights:', error)
    throw error
  }
  return data.map(h => h.file) as unknown as DemoItem[]
}

export async function updateFavorites(userId: string, favorites: {
  movie: string | null,
  song: string | null,
  place: string | null
}) {
  const { error } = await supabase
    .from('favorites')
    .upsert({
      user_id: userId,
      ...favorites
    }, {
      onConflict: 'user_id',
      ignoreDuplicates: false
    })

  if (error) {
    console.error('Failed to update favorites:', error)
    throw error
  }
}

export async function getFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to get favorites:', error)
    throw error // Ignore not found error
  }
  return data || { movie: null, song: null, place: null }
}

export async function updateProfile(profile: UserProfile) {
  // If the avatar is a URL, we need to get the original b2FileId
  const avatarId = profile.avatar && avatarUrlCache.has(profile.avatar) 
    ? Array.from(avatarUrlCache.entries())
        .find(([_, url]) => url === profile.avatar)?.[0] 
    : profile.avatar

  const { error } = await supabase
    .from('users')
    .update({
      avatar: avatarId,
      name: profile.name,
      username: profile.username,
      description: profile.description
    })
    .eq('id', profile.id)

  if (error) {
    console.error('Failed to update profile:', error)
    throw error
  }
}

// Add a cleanup function to revoke object URLs
export function cleanupAvatarUrls(): void {
  avatarUrlCache.forEach(url => URL.revokeObjectURL(url))
  avatarUrlCache.clear()
}