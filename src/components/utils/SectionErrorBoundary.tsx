"use client"

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[SectionErrorBoundary] Error in ${this.props.sectionName || 'unknown section'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="py-12 text-center">
          <div className="glass-card max-w-md mx-auto p-8 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
              <span className="text-destructive text-xl">⚠️</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {this.props.sectionName 
                ? `Gagal memuat bagian ${this.props.sectionName}.`
                : 'Terjadi kesalahan saat memuat konten ini.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="text-xs font-bold text-primary hover:underline"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
