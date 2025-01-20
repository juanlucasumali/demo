import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useDebounce } from 'use-debounce';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
}

interface SelectSongDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (track: SpotifyTrack | null) => void;
}

export function SelectSongDialog({ open, onOpenChange, onSelect }: SelectSongDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (!debouncedSearch) {
      setResults([]);
      return;
    }

    const searchSpotify = async () => {
      setIsLoading(true);
      try {
        // Replace with your actual Spotify API call
        const response = await fetch(`/api/spotify/search?q=${debouncedSearch}`);
        const data = await response.json();
        setResults(data.tracks.items);
      } catch (error) {
        console.error("Failed to search Spotify:", error);
      } finally {
        setIsLoading(false);
      }
    };

    searchSpotify();
  }, [debouncedSearch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select a Song</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for a song..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {results.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                  onClick={() => {
                    onSelect(track);
                    onOpenChange(false);
                  }}
                >
                  <img
                    src={track.album.images[2]?.url}
                    alt={track.album.name}
                    className="w-12 h-12 rounded-md"
                  />
                  <div>
                    <div className="font-medium">{track.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {track.artists.map(a => a.name).join(", ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 