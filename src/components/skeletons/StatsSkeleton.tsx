
import { Skeleton } from '@/components/ui/skeleton';

export const StatsSkeleton = () => (
  <section className="container py-12">
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  </section>
);
