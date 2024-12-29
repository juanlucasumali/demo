import * as z from "zod"

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const createProfileSchema = z.object({
    username: z.string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must not exceed 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    name: z.string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters"),
    description: z.string().max(200, "Description must not exceed 200 characters").optional(),
    avatar: z.string().optional().nullable(),
  })
  
export type CreateProfileFormData = z.infer<typeof createProfileSchema>
export type SignInFormData = z.infer<typeof signInSchema>
export type SignupFormData = z.infer<typeof signupSchema> 