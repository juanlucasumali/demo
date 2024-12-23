import { Card, CardContent } from "../ui/card";
import { Carousel, CarouselContent } from "../ui/carousel";

interface FavoritesProps {
}

export function Favorites({ }: FavoritesProps) {

    return (
      <Carousel className="bg-muted/50 px-4 pt-4 pb-2 rounded-xl">
          <div className="text-center pb-2 text-xs text-muted-foreground">
          Favorites
          </div>
          {/* Implement horizontal scrolling to get through */}
      <CarouselContent className="-ml-1">
        <div className="p-1">
          <Card className="bg-transparent border-none shadow-none">
            <CardContent className="flex aspect-square justify-center">
                <div>
                <p className="text-sm font-sm">Movie: <span className="font-normal">{"Interstellar"}</span></p>
                <p className="text-sm font-sm">Song: <span className="font-normal">{"Comedown"}</span></p>
                <p className="text-sm font-sm">Place: <span className="font-normal">{"SF"}</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </CarouselContent>
    </Carousel>
    )
}