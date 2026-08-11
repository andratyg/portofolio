import React from 'react';

export const TechStackSkeleton = () => (
  <section className="py-16 md:py-24 relative overflow-hidden">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="text-center mb-10 md:mb-16 space-y-4">
        <div className="h-7 w-32 bg-muted/50 rounded-full mx-auto animate-pulse" />
        <div className="h-10 w-72 bg-muted/30 rounded-2xl mx-auto animate-pulse" />
        <div className="h-5 w-48 bg-muted/20 rounded-xl mx-auto animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="glass-card p-4 sm:p-5 space-y-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted/30" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-16 bg-muted/30 rounded" />
                <div className="h-2.5 w-12 bg-muted/20 rounded" />
              </div>
            </div>
            <div className="h-1.5 bg-muted/20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </section>
);
