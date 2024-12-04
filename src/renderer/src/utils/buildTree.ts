import { FileTreeItem } from '../types/files';

export function buildTree(items: any[]): FileTreeItem[] {
  const itemMap: { [key: string]: FileTreeItem } = {};
  const tree: FileTreeItem[] = [];

  // Initialize all items with an empty children array
  items.forEach((item) => {
    itemMap[item.id] = { 
      ...item, 
      children: [] // Always initialize children as an empty array
    };
  });

  items.forEach((item) => {
    if (item.parent_id) {
      const parent = itemMap[item.parent_id];
      if (parent && parent.children) { // Add a check for parent.children
        parent.children.push(itemMap[item.id]);
      }
    } else {
      tree.push(itemMap[item.id]);
    }
  });

  return tree;
}
