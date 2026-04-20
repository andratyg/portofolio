
import { Skeleton } from '@/components/ui/skeleton';

export const AboutSkeleton = () => (
  <section id="about" className="container py-12 md:py-24">
    <div className="grid gap-8 md:grid-cols-2 md:gap-16">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-5 w-full" />
      </div>
    </div>
  </section>
);
