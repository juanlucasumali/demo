import React from "react";
import { Card, CardContent } from "../ui/card";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";

interface FavoriteSongsProps {
}

export function FavoriteSongs({ }: FavoriteSongsProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)
 
  React.useEffect(() => {
    if (!api) {
      return
    }
 
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

    return (
      <Carousel className="bg-muted/50 px-4 pt-4 pb-2 rounded-xl md:pb-4 sm:pb-4">
          <div className="text-center pb-2 text-xs text-muted-foreground">
          Favorite Songs
          </div>
          {/* Implement horizontal scrolling to get through */}
      <CarouselContent className="-ml-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className="pl-1">
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-2xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
              {/* <div className="pt-2 text-center text-xs text-muted-foreground">
                Card Title
                </div> */}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
    )
}