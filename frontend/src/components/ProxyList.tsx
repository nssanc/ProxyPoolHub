import { Trash2, RefreshCw } from 'lucide-react';
import type { Proxy } from '../types';
import { proxyApi } from '../api';

interface ProxyListProps {
  proxies: Proxy[];
  onRefresh: () => void;
}

export default function ProxyList({ proxies, onRefresh }: ProxyListProps) {
  const handleDelete = async (id: string) => {
    try {
      await proxyApi.deleteProxy(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete proxy:', error);
    }
  };

  const handleValidate = async () => {
    try {
      await proxyApi.validateProxies();
      setTimeout(onRefresh, 2000);
    } catch (error) {
      console.error('Failed to validate proxies:', error);
    }
  };

  const statusMap = {
    active: { label: '活跃', color: 'bg-[var(--cyber-cyan)]' },
    checking: { label: '检测中', color: 'bg-[var(--cyber-yellow)]' },
    inactive: { label: '离线', color: 'bg-[var(--cyber-magenta)]' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-['Orbitron'] font-bold text-[var(--cyber-cyan)] flex items-center">
          <span className="mr-3">代理列表</span>
          <div className="h-px flex-1 max-w-xs bg-gradient-to-r from-[var(--cyber-cyan)] to-transparent"></div>
        </h2>
        <button
          onClick={handleValidate}
          className="relative group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[var(--cyber-cyan)] to-[var(--cyber-purple)] rounded-lg text-white font-['Rajdhani'] font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>验证全部</span>
        </button>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--cyber-cyan)]/10 to-[var(--cyber-magenta)]/10 rounded-lg blur-xl opacity-50"></div>
        <div className="relative bg-[var(--cyber-surface)]/80 backdrop-blur-xl border border-[var(--cyber-cyan)]/30 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--cyber-bg)]/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-['Rajdhani'] font-bold text-[var(--cyber-cyan)] uppercase tracking-wider">状态</th>
                  <th className="px-6 py-4 text-left text-xs font-['Rajdhani'] font-bold text-[var(--cyber-cyan)] uppercase tracking-wider">地址</th>
                  <th className="px-6 py-4 text-left text-xs font-['Rajdhani'] font-bold text-[var(--cyber-cyan)] uppercase tracking-wider">类型</th>
                  <th className="px-6 py-4 text-left text-xs font-['Rajdhani'] font-bold text-[var(--cyber-cyan)] uppercase tracking-wider">响应时间</th>
                  <th className="px-6 py-4 text-left text-xs font-['Rajdhani'] font-bold text-[var(--cyber-cyan)] uppercase tracking-wider">成功/失败</th>
                  <th className="px-6 py-4 text-left text-xs font-['Rajdhani'] font-bold text-[var(--cyber-cyan)] uppercase tracking-wider">最后检测</th>
                  <th className="px-6 py-4 text-left text-xs font-['Rajdhani'] font-bold text-[var(--cyber-cyan)] uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--cyber-cyan)]/10">
                {proxies.map((proxy) => (
                  <tr key={proxy.id} className="hover:bg-[var(--cyber-cyan)]/5 transition-colors group/row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${statusMap[proxy.status as keyof typeof statusMap]?.color || 'bg-gray-500'} animate-pulse`}></div>
                        <span className="text-sm font-['Rajdhani'] font-semibold text-white">
                          {statusMap[proxy.status as keyof typeof statusMap]?.label || proxy.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white font-['Rajdhani'] font-semibold">
                      {proxy.address}:{proxy.port}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--cyber-cyan)] font-['Rajdhani'] font-bold">
                      {proxy.type.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white font-['Rajdhani']">
                      {proxy.response_time}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-['Rajdhani']">
                      <span className="text-[var(--cyber-cyan)]">{proxy.success_count}</span> / <span className="text-[var(--cyber-magenta)]">{proxy.fail_count}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm font-['Rajdhani']">
                      {new Date(proxy.last_check).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(proxy.id)}
                        className="text-[var(--cyber-magenta)] hover:text-[var(--cyber-magenta)]/80 transition-colors hover:scale-110 transform"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
