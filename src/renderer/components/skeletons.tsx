import { Skeleton } from "./ui/skeleton"


export const ProjectCardSkeleton = () => {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  )
}

export const ProjectListSkeleton = () => {
  return (
    <ul className='faded-bottom no-scrollbar grid gap-4 overflow-auto pb-16 pt-4 md:grid-cols-2 lg:grid-cols-3'>
      {[...Array(6)].map((_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </ul>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <div className="size-10 animate-pulse rounded-xl bg-muted" />
      <div className="flex flex-col gap-2">
        <div className="h-7 w-[200px] animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-[300px] animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  )
}
