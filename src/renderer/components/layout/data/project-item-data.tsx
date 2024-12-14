import { ProjectItem } from "../types";


export const dummyProjectItems: ProjectItem[] = [
  {
    id: '1',
    name: 'Documentation',
    type: 'folder',
    lastModified: new Date('2024-01-15'),
    createdBy: 'John Doe',
    starred: true,
    tags: ['important', 'docs'],
    size: null
  },
  {
    id: '2',
    name: 'project-spec.pdf',
    type: 'file',
    size: 1024 * 1024 * 2.5, // 2.5MB
    lastModified: new Date('2024-01-16'),
    createdBy: 'Jane Smith',
    starred: false,
    tags: ['specs']
  },
  // Add more items as needed
]
