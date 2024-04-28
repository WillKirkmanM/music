import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="grid grid-cols-5 gap-4">
      {Array(20).fill(0).map((_, index) => {
        const randomWidthTitle = Math.floor(Math.random() * (200 - 150 + 1)) + 150;
        const randomWidthArtist = Math.floor(Math.random() * (200 - 150 + 1)) + 150;

        return (
          <div key={index} className="flex flex-col items-center p-14 w-64">
            <div className="w-36 h-36">
              <Skeleton className="rounded h-[175px]" style={{ width: `${randomWidthTitle}px` }} />
              <div className="flex flex-col text-left mt-3 space-y-2">
                <Skeleton className="font-bold text-white overflow-hidden overflow-ellipsis whitespace-nowrap h-4" style={{ width: `${randomWidthTitle}px` }} />
                <Skeleton className="text-gray-400 h-4" style={{ width: `${randomWidthArtist}px` }} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}