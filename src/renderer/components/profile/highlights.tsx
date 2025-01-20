import React from "react";
import { Card, CardContent } from "../ui/card";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "../ui/carousel";
import { Button } from "../ui/button";
import { Plus, X } from "lucide-react";
import { SelectFilesDialog } from "../dialogs/select-files";
import { DemoItem } from "@renderer/types/items";
import { useToast } from "@renderer/hooks/use-toast";
import { useUserStore } from "@renderer/stores/user-store";
import folderImage from "../../assets/macos-folder.png";
import fileImage from "../../assets/macos-song.png";

interface HighlightsProps {}

export function Highlights({}: HighlightsProps) {
  const { toast } = useToast();
  const { highlights, updateHighlights, fetchHighlights } = useUserStore();
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [chooseFiles, setChooseFiles] = React.useState(false);

  React.useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleConfirmSelection = async (items: DemoItem[]) => {
    if (items.length > 3) {
      toast({
        title: "Selection limit exceeded",
        description: "You can only select up to 3 files for highlights",
        variant: "destructive",
      });
      return;
    }
    try {
      await updateHighlights(items);
      setChooseFiles(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update highlights",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    try {
      const newHighlights = highlights.filter(file => file.id !== fileId);
      await updateHighlights(newHighlights);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove highlight",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-muted/50 rounded-xl">
      <div className="text-center text-xs text-muted-foreground pt-3 pb-5">
        Highlights
      </div>
      <div className="content-center">
        {highlights.length === 0 ? (
          <div className="flex justify-center pb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChooseFiles(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Highlights
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Carousel className="w-full px-4 md:pb-4 sm:pb-4">
              <CarouselContent className="-ml-1">
                {highlights.map((file) => (
                  <CarouselItem
                    key={file.id}
                    className="pl-1 md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="p-1">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full z-10"
                          onClick={() => handleRemoveFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Card>
                          <CardContent className="flex flex-col items-center justify-center p-6">
                            <img
                              src={file.type === "folder" ? folderImage : fileImage}
                              alt={file.type === "folder" ? "Folder" : "File"}
                              className="h-15 w-15"
                            />
                          </CardContent>
                        </Card>
                      </div>
                      <div className="text-center text-xs text-muted-foreground pt-3 pb-5">
                        {file.name}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
                {highlights.length < 3 && (
                  <CarouselItem className="pl-1 md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 flex items-center justify-center" style={{ minHeight: "200px" }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setChooseFiles(true)}
                        className="h-12 w-12 rounded-full"
                      >
                        <Plus className="h-6 w-6" />
                      </Button>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
            </Carousel>
          </div>
        )}
      </div>

      <SelectFilesDialog
        open={chooseFiles}
        onOpenChange={setChooseFiles}
        onConfirm={handleConfirmSelection}
        initialSelections={highlights}
        location="home"
      />
    </div>
  );
}