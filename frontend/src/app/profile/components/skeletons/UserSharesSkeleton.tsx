export function UserSharesSkeleton() {
  return (
    <div className="bg-dark-800/50 border border-dark-700/50 rounded-2xl p-6 backdrop-blur-sm animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-dark-700/50 rounded w-1/4"></div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-dark-700/50 rounded"></div>
          <div className="h-4 bg-dark-700/50 rounded w-24"></div>
        </div>
      </div>
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-dark-700/30 border border-dark-600/30 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="h-5 bg-dark-700/50 rounded w-3/4 mb-2"></div>
                <div className="flex items-center space-x-4 mb-2">
                  <div className="h-4 bg-dark-700/50 rounded w-20"></div>
                  <div className="h-4 bg-dark-700/50 rounded w-16"></div>
                  <div className="h-4 bg-dark-700/50 rounded w-16"></div>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <div className="h-4 w-4 bg-dark-700/50 rounded"></div>
                <div className="h-4 bg-dark-700/50 rounded w-12"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-4 bg-dark-700/50 rounded w-24"></div>
                <div className="h-4 bg-dark-700/50 rounded w-20"></div>
              </div>
              <div className="h-4 bg-dark-700/50 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
