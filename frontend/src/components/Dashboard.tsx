import { Activity, Server, CheckCircle, XCircle } from 'lucide-react';
import { Stats, Proxy } from '../types';

interface DashboardProps {
  stats: Stats | null;
  proxies: Proxy[];
}

export default function Dashboard({ stats, proxies }: DashboardProps) {
  const successRate = stats && stats.total_requests > 0
    ? ((stats.success_requests / stats.total_requests) * 100).toFixed(1)
    : '0';

  const statCards = [
    {
      title: 'Total Proxies',
      value: stats?.total_proxies || 0,
      icon: Server,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Active Proxies',
      value: stats?.active_proxies || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Total Requests',
      value: stats?.total_requests || 0,
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      icon: CheckCircle,
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6 hover:border-neon-blue transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Proxies</h2>
        <div className="space-y-3">
          {proxies.slice(0, 5).map((proxy) => (
            <div
              key={proxy.id}
              className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  proxy.status === 'active' ? 'bg-green-500 animate-pulse' :
                  proxy.status === 'checking' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`} />
                <div>
                  <p className="text-white font-medium">{proxy.address}:{proxy.port}</p>
                  <p className="text-gray-400 text-sm">{proxy.type.toUpperCase()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white">{proxy.response_time}ms</p>
                <p className="text-gray-400 text-sm">
                  {proxy.success_count} / {proxy.fail_count}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
