import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState } from "react";

interface FavoritesData {
  movie: string | null;
  song: string | null;
  place: string | null;
}

interface EditFavoritesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: FavoritesData;
  onSave: (data: FavoritesData) => void;
}

export function EditFavoritesDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
}: EditFavoritesDialogProps) {
  const [formData, setFormData] = useState<FavoritesData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Favorites</DialogTitle>
          <DialogDescription>
            Update your favorite movie, song, and place
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="movie">Favorite Movie</Label>
            <Input
              id="movie"
              value={formData.movie || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, movie: e.target.value || null }))}
              placeholder="Enter your favorite movie"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="song">Favorite Song</Label>
            <Input
              id="song"
              value={formData.song || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, song: e.target.value || null }))}
              placeholder="Enter your favorite song"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="place">Favorite Place</Label>
            <Input
              id="place"
              value={formData.place || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, place: e.target.value || null }))}
              placeholder="Enter your favorite place"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 