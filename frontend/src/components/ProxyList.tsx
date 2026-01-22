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
    active: { label: '活跃', color: 'bg-teal-400' },
    checking: { label: '检测中', color: 'bg-orange-400' },
    inactive: { label: '离线', color: 'bg-red-400' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold gradient-text">代理列表</h2>
        <button
          onClick={handleValidate}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-600 rounded-xl text-white font-semibold glow-teal"
        >
          <RefreshCw className="w-4 h-4" />
          <span>验证全部</span>
        </button>
      </div>

      <div className="card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-teal-500/20 to-purple-500/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-teal-400 uppercase tracking-wider">状态</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-teal-400 uppercase tracking-wider">地址</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-teal-400 uppercase tracking-wider">类型</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-teal-400 uppercase tracking-wider">响应时间</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-teal-400 uppercase tracking-wider">成功/失败</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-teal-400 uppercase tracking-wider">最后检测</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-teal-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-teal-500/10">
              {proxies.map((proxy) => (
                <tr key={proxy.id} className="hover:bg-teal-500/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${statusMap[proxy.status as keyof typeof statusMap]?.color || 'bg-gray-500'} animate-pulse`}></div>
                      <span className="text-sm font-semibold text-white">
                        {statusMap[proxy.status as keyof typeof statusMap]?.label || proxy.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white font-mono font-medium">
                    {proxy.address}:{proxy.port}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-teal-400 font-semibold">
                    {proxy.type.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {proxy.response_time}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-teal-400">{proxy.success_count}</span> / <span className="text-orange-400">{proxy.fail_count}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm">
                    {new Date(proxy.last_check).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(proxy.id)}
                      className="text-orange-400 hover:text-orange-300 transition-colors hover:scale-110 transform"
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
  );
}
