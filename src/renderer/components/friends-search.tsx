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
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { X } from "lucide-react";

type User = {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
  avatarFallback?: string;
};

interface FriendsSearchProps {
  /** A list of all possible friends to choose from */
  friendsList: User[];

  /** A list of currently selected users */
  selectedUsers: User[];

  /** Setter for selected users */
  setSelectedUsers: React.Dispatch<React.SetStateAction<User[]>>;

  /** Optional prop to enable single-select mode */
  singleSelect?: boolean;
}

/**
 * A reusable component that handles searching for friends and selecting them.
 */
export function FriendsSearch({
  friendsList = [], // ensure default to empty array to avoid "undefined is not iterable"
  selectedUsers = [], // likewise
  setSelectedUsers,
  singleSelect = false, // default to multi-select mode
}: FriendsSearchProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);

  // Filtered suggestions based on search term and exclude already selected users
  const suggestions = React.useMemo(() => {
    if (!Array.isArray(friendsList) || !Array.isArray(selectedUsers)) return [];

    const filteredFriends = friendsList.filter(
      (user) => !selectedUsers.find((u) => u.id === user.id)
    );

    if (!searchTerm) {
      return filteredFriends.slice(0, 5);
    }

    const lower = searchTerm.toLowerCase();
    return filteredFriends
      .filter(
        (user) =>
          user.username.toLowerCase().includes(lower) ||
          user.name.toLowerCase().includes(lower)
      )
      .slice(0, 5);
  }, [friendsList, selectedUsers, searchTerm]);

  // Add user to selected
  const handleSelectUser = (user: User) => {
    if (singleSelect) {
      setSelectedUsers([user]); // Replace the current selection
    } else {
      if (!selectedUsers.find((u) => u.id === user.id)) {
        setSelectedUsers((prev) => [...prev, user]);
      }
    }
    setSearchTerm(""); // Clear search input after selecting
  };

  // Remove user
  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {selectedUsers.map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <div className="cursor-pointer">
                  <Avatar className="h-11 w-11 border-2 border-background">
                    <AvatarImage src={user.avatarUrl || ""} alt={user.username} />
                    <AvatarFallback>
                      {user.avatarFallback ||
                        user.username?.[0]?.toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <div className="flex items-center gap-1">
                  <span>{user.name}</span>
                  <X
                    className="h-4 w-4 cursor-pointer text-red-500"
                    onClick={() => handleRemoveUser(user.id)}
                  />
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      <Command className="border rounded">
        <CommandInput
          placeholder="Search for a friend..."
          value={searchTerm}
          onValueChange={(val) => setSearchTerm(val)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setTimeout(() => {
              setIsFocused(false);
            }, 150);
          }}
        />
        {(isFocused || searchTerm.length > 0) && (
          <CommandList>
            <CommandEmpty>No friends found.</CommandEmpty>
            <CommandGroup>
              {suggestions.map((user) => (
                <CommandItem key={user.id} onSelect={() => handleSelectUser(user)}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {user.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} alt={user.username} />
                      ) : (
                        <AvatarFallback>
                          {user.avatarFallback || "?"}
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