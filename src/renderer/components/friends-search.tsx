"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";
import { UserProfile } from "@renderer/types/users";
import { AvatarGroup } from "./ui/avatar-group";
import { cn } from "@renderer/lib/utils";

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

  /** Callback function to handle search term changes */
  onSearch?: (term: string) => void;

  /** Optional prop to indicate loading state */
  isLoading?: boolean;
}

export function FriendsSearch({
  owner,
  friendsList = [],
  selectedUsers = [],
  setSelectedUsers,
  singleSelect = false,
  onSearch,
  isLoading = false,
}: FriendsSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Handle search term changes
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    onSearch?.(term);
  };

  // Filtered suggestions based on search term, excluding already selected
  const suggestions = React.useMemo(() => {
    if (!Array.isArray(friendsList) || !Array.isArray(selectedUsers)) return [];

    const filteredFriends = friendsList.filter(
      (user) => !selectedUsers.find((u) => u.id === user.id)
    );

    if (!searchTerm) {
      return filteredFriends.slice(0, 5);
    }

    const cleanSearchTerm = searchTerm.replace('@', '').toLowerCase();
    
    return filteredFriends
      .filter(
        (user) =>
          user.username.toLowerCase().includes(cleanSearchTerm) ||
          user.name.toLowerCase().includes(cleanSearchTerm)
      )
      .slice(0, 5);
  }, [friendsList, selectedUsers, searchTerm]);

  // Handle user selection
  const handleSelectUser = (user: UserProfile) => {
    if (singleSelect) {
      setSelectedUsers([user]);
    } else {
      if (!selectedUsers.find((u) => u.id === user.id)) {
        setSelectedUsers((prev) => [...prev, user]);
      }
    }
    // Reset search term instead of closing popover
    setSearchTerm("");
    onSearch?.("");
  };

  // Remove user
  const handleRemoveUser = (userId: string) => {
    if (owner?.id === userId) return;
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <div className="space-y-2">
      <AvatarGroup
        owner={owner}
        users={selectedUsers}
        size="lg"
        onRemove={handleRemoveUser}
        showRemove={true}
        limit={10}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="text-muted-foreground">
              {selectedUsers.length > 0 
                ? `${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} selected`
                : "@"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput 
              placeholder="@" 
              value={searchTerm}
              onValueChange={handleSearch}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Searching..." : "No users found."}
              </CommandEmpty>
              <CommandGroup>
                {suggestions.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.username}
                    onSelect={() => handleSelectUser(user)}
                  >
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
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedUsers.find((u) => u.id === user.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}