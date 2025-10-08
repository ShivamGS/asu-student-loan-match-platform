import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  subtitle: string;
  bgGradient: string;
}

export default function User_Dashboard_MetricCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  bgGradient 
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Icon with gradient background */}
      <div className={`w-12 h-12 rounded-lg ${bgGradient} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-gray-600 mb-1">
        {title}
      </h3>

      {/* Main Value */}
      <p className="text-3xl font-bold text-gray-900 mb-1">
        {value}
      </p>

      {/* Subtitle */}
      <p className="text-xs text-gray-500">
        {subtitle}
      </p>
    </div>
  );
}
