'use client';

import { useState, useRef, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import TagBadge from "@renderer/components/tag-badge";
import { Tag } from "lucide-react";
import { FileTag } from "@renderer/types/items";

interface FileTagsDropdownProps {
  tags: FileTag | null;
  setTags: (fileType: FileTag | null) => void;
}

export function FileTagsDropdown({ tags, setTags }: FileTagsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const removeTag = () => setTags(null);

  return (
    <div className="w-full space-y-2">
      {/* Tag Input Row */}
      <div
        className="flex flex-wrap items-center gap-2 rounded-md bg-background px-3 pb-2"
        onClick={() => dropdownRef.current?.focus()}
      >
        {tags && (
          <TagBadge
            tag={tags}
            onRemove={removeTag}
          />
        )}
      </div>

      {/* Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuContent
          ref={dropdownRef}
          className="max-h-80 w-64 overflow-y-auto space-y-2 p-2"
          align="start"
        >
          <DropdownMenuRadioGroup
            value={tags || ""}
            onValueChange={(value) => setTags(value as FileTag)}
          >
            {Object.values(FileTag).map((type) => (
              <DropdownMenuRadioItem
                key={type}
                value={type}
                onSelect={(e) => e.preventDefault()}
              >
                {type}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-max"><Tag /> Edit Tags</Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    </div>
  );
}

export default FileTagsDropdown;