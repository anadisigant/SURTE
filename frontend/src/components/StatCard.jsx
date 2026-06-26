export default function StatCard({ title, value, icon: Icon, color, trend }) {
  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-gray-600 text-xs sm:text-sm mb-1 truncate">
            {title}
          </p>
          <h3
            className="text-2xl sm:text-3xl font-bold truncate"
            style={{ color }}
          >
            {value}
          </h3>
          {trend && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 truncate">
              {trend}
            </p>
          )}
        </div>
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-2"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={20} className="sm:w-6 sm:h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );
}
