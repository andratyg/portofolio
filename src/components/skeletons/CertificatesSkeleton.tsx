
import { Skeleton } from '@/components/ui/skeleton';

export const CertificatesSkeleton = () => (
  <section id="certificates" className="container py-12 md:py-24">
    <div className="mb-12 flex flex-col items-center text-center">
      <Skeleton className="mb-4 h-8 w-48" />
      <Skeleton className="h-5 w-full max-w-xl" />
    </div>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-lg border p-4">
          <Skeleton className="mb-4 h-8 w-8" />
          <Skeleton className="mb-2 h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  </section>
);
