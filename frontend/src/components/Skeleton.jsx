// Composants Skeleton pour les etats de chargement

// Skeleton de base avec shimmer effect
export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-shimmer rounded ${className}`} />
  )
}

// Skeleton pour une carte de look (carousel horizontal)
export function LookCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-36">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <Skeleton className="w-36 h-44 rounded-none" />
        <div className="p-2">
          <Skeleton className="h-3 w-16 mb-2" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton pour le carousel de looks
export function LooksCarouselSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden px-4">
      <LookCardSkeleton />
      <LookCardSkeleton />
      <LookCardSkeleton />
    </div>
  )
}

// Skeleton pour une carte de croisement
export function CrossingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {/* Image placeholder */}
      <Skeleton className="w-full aspect-[4/5] rounded-none" />
      {/* Stats bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

// Skeleton pour le feed de croisements
export function CrossingsFeedSkeleton() {
  return (
    <div className="space-y-3">
      <CrossingCardSkeleton />
      <CrossingCardSkeleton />
    </div>
  )
}

// Skeleton complet pour la page Home
export function HomeSkeleton() {
  return (
    <div className="min-h-full bg-lookup-cream pb-4">
      {/* Header skeleton */}
      <div className="bg-white px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="w-7 h-7 rounded-full" />
            <Skeleton className="w-20 h-6" />
          </div>
          <Skeleton className="w-9 h-9 rounded-full" />
        </div>
      </div>

      {/* Looks section */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-3 px-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <LooksCarouselSkeleton />
      </div>

      {/* Crossings section */}
      <div className="px-4 pt-6">
        <Skeleton className="h-4 w-40 mb-3" />
        <CrossingsFeedSkeleton />
      </div>
    </div>
  )
}
