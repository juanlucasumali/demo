import { supabase } from "@renderer/lib/supabase"
import { UserProfile } from "@renderer/types/users"

export async function createProfile(data: UserProfile) {
  const { error } = await supabase
    .from('users')
    .insert(data)
  
  if (error) throw error
  return { error: null }
}

export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Math.random()}.${fileExt}`
  
//   const { error: uploadError } = await supabase.storage
//     .from('avatars')
//     .upload(fileName, file)

//   if (uploadError) throw uploadError

//   const { data: { publicUrl } } = supabase.storage
//     .from('avatars')
//     .getPublicUrl(fileName)

  return ""
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