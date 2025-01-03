import { supabase } from "@renderer/lib/supabase"
import { UserProfile } from "@renderer/types/users"
import { b2Service } from "./b2-service"

export async function createProfile(data: UserProfile, avatarInfo?: { b2FileId: string, fileName: string }) {
  const { error } = await supabase
    .from('users')
    .insert(data)
  
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
    const b2FileId = await b2Service.storeFile(
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

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data as UserProfile
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
  try {
    const avatarData = await b2Service.retrieveFile(b2FileId)
    const blob = new Blob([avatarData])
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Failed to get avatar URL:', error)
    throw error
  }
}