export function ProfileStatsSkeleton() {
  return (
    <div className="bg-dark-800/50 border border-dark-700/50 rounded-2xl p-6 backdrop-blur-sm animate-pulse">
      <div className="h-6 bg-dark-700/50 rounded w-1/3 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-dark-700/30 border border-dark-600/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-5 w-5 bg-dark-700/50 rounded"></div>
              <div className="h-4 bg-dark-700/50 rounded w-16"></div>
            </div>
            <div className="space-y-1">
              <div className="h-8 bg-dark-700/50 rounded w-20"></div>
              <div className="h-4 bg-dark-700/50 rounded w-24"></div>
              <div className="h-3 bg-dark-700/50 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
