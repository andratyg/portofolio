"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <li className="flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-primary transition-colors"
            title="Beranda"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:inline-block">Beranda</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
              {isLast || !item.href ? (
                <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-[350px]">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-primary transition-colors truncate max-w-[150px] sm:max-w-[200px]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
