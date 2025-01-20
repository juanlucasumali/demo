import { Card, CardContent } from "../ui/card";
import { Carousel, CarouselContent } from "../ui/carousel";
import { Button } from "../ui/button";
import { Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { EditFavoritesDialog } from "../dialogs/edit-favorites-dialog";
import { useUserStore } from "@renderer/stores/user-store";
import { useToast } from "@renderer/hooks/use-toast";

interface FavoritesProps {}

export function Favorites({}: FavoritesProps) {
  const { toast } = useToast();
  const { favorites, updateFavorites, fetchFavorites } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleSave = async (data: {
    movie: string | null;
    song: string | null;
    place: string | null;
  }) => {
    try {
      await updateFavorites(data);
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Carousel className="bg-muted/50 px-4 pt-4 pb-2 rounded-xl">
        <div className="flex justify-between items-center pb-2">
          <div className="text-xs text-muted-foreground">Favorites</div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
        <CarouselContent className="-ml-1">
          <div className="p-1">
            <Card className="bg-transparent border-none shadow-none">
              <CardContent className="flex aspect-square justify-center">
                <div className="space-y-2">
                  <p className="text-sm font-sm">
                    Movie:{" "}
                    <span className="font-normal">
                      {favorites.movie || "Not set"}
                    </span>
                  </p>
                  <p className="text-sm font-sm">
                    Song:{" "}
                    <span className="font-normal">
                      {favorites.song || "Not set"}
                    </span>
                  </p>
                  <p className="text-sm font-sm">
                    Place:{" "}
                    <span className="font-normal">
                      {favorites.place || "Not set"}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CarouselContent>
      </Carousel>

      <EditFavoritesDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        initialData={favorites}
        onSave={handleSave}
      />
    </>
  );
}