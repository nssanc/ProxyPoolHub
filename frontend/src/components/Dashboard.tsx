import { Activity, Server, CheckCircle, TrendingUp } from 'lucide-react';
import type { Stats, Proxy } from '../types';

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
      title: '总代理数',
      value: stats?.total_proxies || 0,
      icon: Server,
      gradient: 'from-[var(--cyber-cyan)] to-[var(--cyber-purple)]',
    },
    {
      title: '活跃代理',
      value: stats?.active_proxies || 0,
      icon: CheckCircle,
      gradient: 'from-[var(--cyber-purple)] to-[var(--cyber-magenta)]',
    },
    {
      title: '总请求数',
      value: stats?.total_requests || 0,
      icon: Activity,
      gradient: 'from-[var(--cyber-magenta)] to-[var(--cyber-yellow)]',
    },
    {
      title: '成功率',
      value: `${successRate}%`,
      icon: TrendingUp,
      gradient: 'from-[var(--cyber-yellow)] to-[var(--cyber-cyan)]',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="relative group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* 发光边框 */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--cyber-cyan)]/20 to-[var(--cyber-magenta)]/20 rounded-lg blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

            {/* 卡片内容 */}
            <div className="relative bg-[var(--cyber-surface)]/80 backdrop-blur-xl border border-[var(--cyber-cyan)]/30 rounded-lg p-6 hover:border-[var(--cyber-cyan)] transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${card.gradient} shadow-[0_0_20px_rgba(0,240,255,0.3)]`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-[var(--cyber-cyan)]/60 text-sm font-['Rajdhani'] font-medium mb-1 tracking-wide">{card.title}</h3>
              <p className="text-4xl font-['Orbitron'] font-bold text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 最近代理列表 */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--cyber-cyan)]/10 to-[var(--cyber-magenta)]/10 rounded-lg blur-xl opacity-50"></div>
        <div className="relative bg-[var(--cyber-surface)]/80 backdrop-blur-xl border border-[var(--cyber-cyan)]/30 rounded-lg p-6">
          <h2 className="text-2xl font-['Orbitron'] font-bold text-[var(--cyber-cyan)] mb-6 flex items-center">
            <span className="mr-3">最近代理</span>
            <div className="h-px flex-1 bg-gradient-to-r from-[var(--cyber-cyan)] to-transparent"></div>
          </h2>
          <div className="space-y-3">
            {proxies.slice(0, 5).map((proxy, index) => (
              <div
                key={proxy.id}
                className="flex items-center justify-between p-4 bg-[var(--cyber-bg)]/50 rounded-lg border border-[var(--cyber-cyan)]/20 hover:border-[var(--cyber-cyan)]/50 transition-all group/item"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full ${
                      proxy.status === 'active' ? 'bg-[var(--cyber-cyan)]' :
                      proxy.status === 'checking' ? 'bg-[var(--cyber-yellow)]' :
                      'bg-[var(--cyber-magenta)]'
                    }`} />
                    <div className={`absolute inset-0 w-3 h-3 rounded-full animate-ping ${
                      proxy.status === 'active' ? 'bg-[var(--cyber-cyan)]' :
                      proxy.status === 'checking' ? 'bg-[var(--cyber-yellow)]' :
                      'bg-[var(--cyber-magenta)]'
                    }`} />
                  </div>
                  <div>
                    <p className="text-white font-['Rajdhani'] font-semibold text-lg">{proxy.address}:{proxy.port}</p>
                    <p className="text-[var(--cyber-cyan)]/60 text-sm font-['Rajdhani']">{proxy.type.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[var(--cyber-cyan)] font-['Rajdhani'] font-bold text-lg">{proxy.response_time}ms</p>
                  <p className="text-gray-400 text-sm font-['Rajdhani']">
                    成功 {proxy.success_count} / 失败 {proxy.fail_count}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
