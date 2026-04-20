
import { Skeleton } from '@/components/ui/skeleton';

export const TimelineSkeleton = () => (
  <section id="timeline" className="container py-12 md:py-24">
    <div className="mb-12 flex flex-col items-center text-center">
      <Skeleton className="mb-4 h-8 w-48" />
      <Skeleton className="h-5 w-full max-w-xl" />
    </div>
    <div className="relative space-y-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-start">
          <div className="flex h-full flex-col items-center">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-24 w-1 flex-grow" />
          </div>
          <div className="ml-4 flex-grow rounded-lg border p-4">
            <Skeleton className="mb-2 h-5 w-1/4" />
            <Skeleton className="mb-2 h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  </section>
);
