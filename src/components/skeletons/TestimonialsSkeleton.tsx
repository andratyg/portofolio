
import { Skeleton } from '@/components/ui/skeleton';

export const TestimonialsSkeleton = () => (
  <section id="testimonials" className="container py-12 md:py-24">
    <div className="mb-12 flex flex-col items-center text-center">
      <Skeleton className="mb-4 h-8 w-48" />
      <Skeleton className="h-5 w-full max-w-xl" />
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6 text-card-foreground">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  </section>
);
