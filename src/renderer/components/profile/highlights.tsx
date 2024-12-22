import React from "react";
import { Card, CardContent } from "../ui/card";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";

interface HighlightsProps {
}

export function Highlights({ }: HighlightsProps) {
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
      <div className="bg-muted/50 rounded-xl">
        <div className="text-center text-xs text-muted-foreground pt-3 pb-5">
          Highlights
        </div>
        <div className="content-center">
      <Carousel className="w-full px-4">
          {/* Implement horizontal scrolling to get through */}
      <CarouselContent className="-ml-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
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
    </div>
    </div>
    )
}