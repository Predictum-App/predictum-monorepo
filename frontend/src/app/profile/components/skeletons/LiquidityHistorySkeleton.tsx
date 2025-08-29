export function LiquidityHistorySkeleton() {
  return (
    <div className="bg-dark-800/50 border border-dark-700/50 rounded-2xl p-6 backdrop-blur-sm animate-pulse">
      <div className="h-6 bg-dark-700/50 rounded w-1/3 mb-6"></div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-dark-700/30 border border-dark-600/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-dark-700/50 rounded"></div>
                <div className="h-4 bg-dark-700/50 rounded w-16"></div>
              </div>
              <div className="h-3 bg-dark-700/50 rounded w-16"></div>
            </div>
            <div className="space-y-1">
              <div className="h-4 bg-dark-700/50 rounded w-full"></div>
              <div className="flex items-center justify-between">
                <div className="h-3 bg-dark-700/50 rounded w-20"></div>
                <div className="h-3 bg-dark-700/50 rounded w-16"></div>
              </div>
              <div className="h-3 bg-dark-700/50 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
