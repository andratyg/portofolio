"use client"

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background flex-col gap-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <button onClick={() => reset()} className="px-4 py-2 bg-primary text-primary-foreground rounded-md">Try again</button>
    </div>
  )
}
