import { Edit, Eye, Share } from "lucide-react";
import { SubHeader } from "../page-layout/sub-header";
import { Card, CardContent } from "../ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import folderImage from "../../assets/macos-folder.png";
import fileImage from "../../assets/macos-song.png";
import { useItems } from "@renderer/hooks/use-items";

export function Recents() {
  const { filesAndFolders } = useItems();

  // Sort the data by the more recent of `lastOpened` or `lastModified`
  const sortedData = [...filesAndFolders].sort((a, b) =>
    Math.max(new Date(b.lastOpened).getTime(), new Date(b.lastModified).getTime()) -
    Math.max(new Date(a.lastOpened).getTime(), new Date(a.lastModified).getTime())
  );

  return (
    <div className="pb-8 lg:col-span-3 content-center mt-4">
      <div>
        <SubHeader subHeader="Recents" />
      </div>
      <div className="flex justify-center">
        {sortedData.length < 10 ? (
          <Card className="w-full shadow-none h-40 flex items-center justify-center">
            <div className="text-muted-foreground">
              Add more files to see your recent activity here
            </div>
          </Card>
        ) : (
          <Carousel opts={{ align: "start" }} className="w-5/6">
            <CarouselContent>
              {sortedData.slice(0, 10).map((item) => (
                <CarouselItem
                  key={item.id}
                  className="basis-1/3 md:basis-1/5 lg:basis-1/5"
                >
                  <div className="p-1">
                    <Tooltip>
                      <TooltipContent>
                        <div className="flex bottom flex-row gap-2">
                          <Eye size={20}/> <Edit size={20}/> <Share size={20}/>
                        </div>
                      </TooltipContent>
                      <TooltipTrigger asChild>
                        <Card className="border-none shadow-none min-w-30">
                          <CardContent className="flex flex-col items-center justify-center p-0 min-h-full">
                            <img
                              src={item.type === "folder" ? folderImage : fileImage}
                              alt={item.type === "folder" ? "Folder" : "File"}
                              className="h-15 w-15"
                            />
                            <span 
                              className="mt-2 text-xs text-center font-light truncate text-ellipsis overflow-hidden"
                              style={{maxWidth: "calc(100% + 20px)"}}
                            >
                              {item.name}
                            </span>
                          </CardContent>
                        </Card>
                      </TooltipTrigger>
                    </Tooltip>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-8"/>
            <CarouselNext className="-right-9"/>
          </Carousel>
        )}
      </div>
    </div>
  );
}