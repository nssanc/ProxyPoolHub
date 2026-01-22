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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Proxy List</h2>
        <button
          onClick={handleValidate}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Validate All</span>
        </button>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Response Time</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Success/Fail</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Check</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {proxies.map((proxy) => (
                <tr key={proxy.id} className="hover:bg-gray-900/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      proxy.status === 'active' ? 'bg-green-900/50 text-green-400' :
                      proxy.status === 'checking' ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      {proxy.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white font-mono">
                    {proxy.address}:{proxy.port}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {proxy.type.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    {proxy.response_time}ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                    <span className="text-green-400">{proxy.success_count}</span> / <span className="text-red-400">{proxy.fail_count}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                    {new Date(proxy.last_check).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(proxy.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
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
