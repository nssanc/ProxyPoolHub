import { Activity, Server, CheckCircle, TrendingUp, Clock, Zap } from 'lucide-react';
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
      color: 'from-teal-500 to-cyan-500',
      glow: 'glow-teal',
    },
    {
      title: '活跃代理',
      value: stats?.active_proxies || 0,
      icon: CheckCircle,
      color: 'from-emerald-500 to-green-500',
      glow: 'glow-teal',
    },
    {
      title: '总请求数',
      value: stats?.total_requests || 0,
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
      glow: 'glow-purple',
    },
    {
      title: '成功率',
      value: `${successRate}%`,
      icon: TrendingUp,
      color: 'from-orange-500 to-amber-500',
      glow: 'glow-orange',
    },
  ];

  return (
    <div className="space-y-8">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="card rounded-2xl p-6 hover:border-teal-500/40 transition-all duration-300 animate-slideInRight"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} ${card.glow}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm text-slate-400 mb-2">{card.title}</h3>
            <p className="text-4xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* 最近代理 */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-purple-600 glow-teal">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">最近代理</h2>
          </div>
          <span className="text-sm text-slate-400">显示最近 5 个代理</span>
        </div>

        <div className="space-y-3">
          {proxies.slice(0, 5).map((proxy, index) => (
            <div
              key={proxy.id}
              className="card rounded-xl p-5 hover:border-teal-500/40 transition-all duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    proxy.status === 'active' ? 'bg-teal-400 animate-pulse' : 'bg-orange-400'
                  }`}></div>
                  <div>
                    <p className="font-mono text-white font-medium text-lg">
                      {proxy.address}:{proxy.port}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      类型: <span className="text-teal-400 font-semibold">{proxy.type.toUpperCase()}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">响应时间</p>
                  <p className="text-2xl font-bold text-teal-400">{proxy.response_time}ms</p>
                </div>
              </div>
            </div>
          ))}

          {proxies.length === 0 && (
            <div className="text-center py-16">
              <Zap className="w-20 h-20 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">暂无代理数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
