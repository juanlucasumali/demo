import { Clock, Edit, Eye, Share } from "lucide-react";
import { SubHeader } from "../page/sub-header";
import { Card, CardContent } from "../ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { useDataStore } from "@renderer/stores/items-store";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import macosFolderIcon from "src/renderer/assets/macos-folder.png";
import macosSongIcon from "src/renderer/assets/macos-song.png";

export function Recents() {
  const data = useDataStore((state) => state.data);

  // Sort the data by the more recent of `lastOpened` or `lastModified`
  const sortedData = [...data].sort((a, b) =>
    Math.max(new Date(b.lastOpened).getTime(), new Date(b.lastModified).getTime()) -
    Math.max(new Date(a.lastOpened).getTime(), new Date(a.lastModified).getTime())
  );

  // Limit to the first 10 items
  const recentItems = sortedData.slice(0, 10);

  return (
    <div className="pb-8 lg:col-span-3 content-center mt-4">
      <div>
        <SubHeader icon={Clock} subHeader="Recents" />
      </div>
      <div className="flex justify-center">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-5/6"
        >
          <CarouselContent>
            {recentItems.map((item) => (
              <CarouselItem
                key={item.id}
                className="basis-1/3 sm:basis-1/3 md:basis-1/3 lg:basis-1/5"
              >
                <div className="p-1">
                  <Tooltip>
                    <TooltipContent>
                      <div className="flex bottom flex-row gap-2">
                        <Eye size={20} /> <Edit size={20} /> <Share size={20} />
                      </div>
                    </TooltipContent>
                    <TooltipTrigger asChild>
                      <Card className="border-none shadow-none">
                        <CardContent className="flex flex-col items-center justify-center p-4">
                          {item.type === "folder" ? (
                            <img
                              src={macosFolderIcon}
                              alt="Folder"
                              className="h-10 w-10"
                            />
                          ) : (
                            <img
                              src={macosSongIcon}
                              alt="Song"
                              className="h-10 w-10"
                            />
                          )}
                          <span
                            className="mt-2 text-xs text-center font-light truncate text-ellipsis overflow-hidden"
                            style={{ maxWidth: "calc(100% + 3rem)" }}
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
          <CarouselPrevious className="-left-8" />
          <CarouselNext className="-right-9" />
        </Carousel>
      </div>
    </div>
  );
}
