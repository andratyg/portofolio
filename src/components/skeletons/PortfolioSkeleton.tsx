
import { Skeleton } from '@/components/ui/skeleton';

// Renders a single skeleton card for a portfolio item
const PortfolioCardSkeleton = () => (
  <div className="flex flex-col gap-4 rounded-2xl border p-4 transition-all hover:bg-muted/50">
    {/* Image Placeholder */}
    <Skeleton className="aspect-video w-full rounded-lg" />
    
    {/* Title Placeholder */}
    <Skeleton className="h-6 w-3/4" />
    
    {/* Description Placeholder */}
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />

    {/* Badges Placeholder */}
    <div className="flex flex-wrap gap-2 pt-2">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-12 rounded-full" />
    </div>
  </div>
);

// Renders the full portfolio section skeleton
export const PortfolioSkeleton = () => {
  return (
    <section id="portfolio" className="container py-12 md:py-24">
      {/* Section Header Skeleton */}
      <div className="mb-12 flex flex-col items-center text-center">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="h-5 w-full max-w-2xl" />
        <Skeleton className="mt-2 h-5 w-full max-w-xl" />
      </div>

      {/* Featured Projects Skeleton */}
      <div className="mb-12 grid gap-8 md:grid-cols-2 lg:gap-12">
        <PortfolioCardSkeleton />
        <PortfolioCardSkeleton />
      </div>

      {/* Filter/Search Skeleton */}
      <div className="mb-8 flex justify-center">
        <Skeleton className="h-10 w-full max-w-sm" />
      </div>

      {/* Regular Projects Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <PortfolioCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
};
