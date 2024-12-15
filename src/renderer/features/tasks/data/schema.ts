// schemas.ts
import { z } from 'zod'

// Full schema for ProjectItem
export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['file', 'folder']),
  isStarred: z.boolean().optional().default(false),
  description: z.string(),
  fileFormat: z.string().nullable().optional(),
  size: z.number().nullable().optional(),
  duration: z.number().nullable().optional(),
  lastModified: z.date().nullable().optional(),
  createdAt: z.date().nullable().optional(),
  ownerId: z.string().optional(), // Made optional
  tags: z.array(z.string()).nullable().optional(),
  projectId: z.string().optional(), // Made optional
  parentFolderId: z.string().nullable().optional(),
  filePath: z.string().nullable().optional(),
})

// Specific schema for row actions
export const rowActionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['file', 'folder']),
  isStarred: z.boolean().optional().default(false),
  parentFolderId: z.string().nullable().optional(),
})

export type ProjectItem = z.infer<typeof projectItemSchema>
export type RowActionItem = z.infer<typeof rowActionSchema>
