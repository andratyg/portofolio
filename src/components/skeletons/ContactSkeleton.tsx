
import { Skeleton } from '@/components/ui/skeleton';

export const ContactSkeleton = () => (
  <section id="contact" className="container py-12 md:py-24">
    <div className="mb-12 flex flex-col items-center text-center">
      <Skeleton className="mb-4 h-8 w-48" />
      <Skeleton className="h-5 w-full max-w-xl" />
    </div>
    <div className="mx-auto max-w-2xl">
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-48" />
      </div>
    </div>
  </section>
);
