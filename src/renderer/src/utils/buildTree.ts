import { FileTreeItem, DatabaseItem } from '../types/files';


export function buildTree(items: DatabaseItem[]): FileTreeItem[] {
  // Create a map for quick lookup of items by their ID
  const itemMap = new Map<string, FileTreeItem>();
  
  // First pass: create all nodes and store them in the map
  items.forEach(item => {
    itemMap.set(item.id, {
      ...item,
      children: []
    });
  });

  // Second pass: build the tree structure
  const rootItems: FileTreeItem[] = [];

  items.forEach(item => {
    const node = itemMap.get(item.id);
    if (!node) return;

    if (item.parentId === null) {
      // This is a root level item
      rootItems.push(node);
    } else {
      // This item has a parent
      const parent = itemMap.get(item.parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
      } else {
        // If parent is not found, treat as root item
        rootItems.push(node);
      }
    }
  });

  // Optional: Sort children arrays (if you want alphabetical order)
  const sortTree = (items: FileTreeItem[]): FileTreeItem[] => {
    return items.map(item => ({
      ...item,
      children: item.children ? sortTree(item.children).sort((a, b) => a.name.localeCompare(b.name)) : []
    }));
  };

  return sortTree(rootItems).sort((a, b) => a.name.localeCompare(b.name));
}