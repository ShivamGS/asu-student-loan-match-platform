import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export default function StatCard({ title, value, trend, icon: Icon, iconColor, iconBg }: StatCardProps) {
  return (
    <div className="bg-[#252C3C] border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
          <h3 className="text-white text-3xl font-bold mb-2">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-1">
              <span className={`text-sm font-semibold ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-gray-500 text-xs">vs last month</span>
            </div>
          )}
        </div>

        <div className={`${iconBg} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
