import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  href?: string;
}

export default function StatCard({ title, value, icon: Icon, color, href }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-primary-light',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    cyan: 'bg-cyan-500',
    violet: 'bg-violet-500',
    teal: 'bg-teal-500',
    orange: 'bg-orange-500'
  };

  const bgColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  const content = (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all ${href ? 'cursor-pointer hover:border-blue-300' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link to={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
