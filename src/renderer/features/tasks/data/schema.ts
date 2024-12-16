// schemas.ts
import { z } from 'zod'

// Full schema for ProjectItem
export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['file', 'folder']),
  isStarred: z.boolean().default(false),
  description: z.string(),
  fileFormat: z.string().nullable(),
  size: z.number().nullable(),
  duration: z.number().nullable(),
  lastModified: z.date().nullable(),
  createdAt: z.date().nullable(),
  ownerId: z.string(), // Made optional
  tags: z.array(z.string()),
  projectId: z.string(), // Made optional
  parentFolderId: z.string().nullable(),
  filePath: z.string().nullable(),
})

// Specific schema for row actions
export const rowActionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['file', 'folder']),
  isStarred: z.boolean().optional().default(false),
  parentFolderId: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable(),
  ownerId: z.string(), // Made optional
  createdAt: z.string(),
  fileFormat: z.string().nullable(),
  size: z.number().nullable(),
})

export type ProjectItem = z.infer<typeof projectItemSchema>
export type RowActionItem = z.infer<typeof rowActionSchema>
