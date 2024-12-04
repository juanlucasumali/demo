import { FC } from 'react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "../../ui/sidebar";
import { useNavigationData } from '@renderer/hooks/useNavigationData';
import { SidebarItem } from './SidebarItem';

interface NavMainProps {
  setCurrentPage: (item: any) => void;
}

export const NavMain: FC<NavMainProps> = ({ setCurrentPage }) => {
  const { data: items, isLoading, error } = useNavigationData();

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4">Error loading navigation data</div>;
  if (!items) return <div className="p-4">No items found</div>; // Add this check

  return (
    <SidebarGroup className="w-full">
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarMenu className="w-full">
        {items.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            setCurrentPage={setCurrentPage}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};
