"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { UserProfile } from "@renderer/types/users";
import { AvatarGroup } from "./ui/avatar-group";

interface FriendsSearchProps {
  /** Owner that will always appear first and can't be removed */
  owner?: UserProfile;

  /** A list of all possible friends to choose from */
  friendsList: UserProfile[];

  /** A list of currently selected users */
  selectedUsers: UserProfile[];

  /** Setter for selected users */
  setSelectedUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;

  /** Optional prop to enable single-select mode */
  singleSelect?: boolean;
}

/**
 * A reusable component that handles searching for friends and selecting them.
 */
export function FriendsSearch({
  owner,
  friendsList = [],
  selectedUsers = [],
  setSelectedUsers,
  singleSelect = false,
}: FriendsSearchProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);

  // Close the dropdown if clicking outside of container
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // Check if clicking on an interactive element
        const target = e.target as HTMLElement;
        const isButton = target.closest('button');
        const isInput = target.closest('input');
        
        // If clicking on another interactive element, don't close the dropdown
        if (isButton || isInput) {
          return;
        }
        
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered suggestions based on search term, excluding already selected
  const suggestions = React.useMemo(() => {
    // Safety checks to avoid "undefined is not iterable"
    if (!Array.isArray(friendsList) || !Array.isArray(selectedUsers)) return [];

    const filteredFriends = friendsList.filter(
      (user) => !selectedUsers.find((u) => u.id === user.id)
    );

    if (!searchTerm) {
      return filteredFriends.slice(0, 5);
    }

    // Remove @ symbol from search term if present
    const cleanSearchTerm = searchTerm.replace('@', '').toLowerCase();
    
    return filteredFriends
      .filter(
        (user) =>
          user.username.toLowerCase().includes(cleanSearchTerm) ||
          user.name.toLowerCase().includes(cleanSearchTerm)
      )
      .slice(0, 5);
  }, [friendsList, selectedUsers, searchTerm]);

  // Add user to selected
  const handleSelectUser = (user: UserProfile) => {
    if (singleSelect) {
      setSelectedUsers([user]); // Replace the current selection
    } else {
      // Only add if not already selected
      if (!selectedUsers.find((u) => u.id === user.id)) {
        setSelectedUsers((prev) => [...prev, user]);
      }
    }
    // NOTE: We do NOT setSearchTerm("") if you want the list to remain open
    // setSearchTerm("");
  };

  // Remove user
  const handleRemoveUser = (userId: string) => {
    // Don't remove if it's the owner
    if (owner?.id === userId) return;
    
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <div className="space-y-2 !mt-0 !mb-4">
      <AvatarGroup
        owner={owner}
        users={selectedUsers}
        size="lg"
        onRemove={handleRemoveUser}
        showRemove={true}
        limit={10}
      />

      <Command ref={containerRef}className="border rounded">
        <CommandInput
          placeholder="@"
          value={searchTerm}
          onValueChange={setSearchTerm}
          onFocus={() => setIsFocused(true)}
        />
        {isFocused && (
          <CommandList>
            <CommandEmpty>No friends found.</CommandEmpty>
            <CommandGroup>
              {suggestions.map((user) => (
                <CommandItem key={user.id} onSelect={() => handleSelectUser(user)}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.username} />
                      ) : (
                        <AvatarFallback>
                          {user.username[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div>{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        )}
      </Command>
    </div>
  );
}