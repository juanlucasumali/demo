import { z } from 'zod'

export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['file', 'folder']),
  starred: z.boolean(),
  fileFormat: z.string().nullable(),
  size: z.number().nullable(),
  duration: z.number().nullable(),
  lastModified: z.date(),
  dateCreated: z.date(),
  owner: z.string(),
  tags: z.array(z.string()).nullable(),
})

export type ProjectItem = z.infer<typeof projectItemSchema>
