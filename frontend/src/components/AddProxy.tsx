import { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { proxyApi } from '../api';
import type { ProxyType } from '../types';

interface AddProxyProps {
  onSuccess: () => void;
}

export default function AddProxy({ onSuccess }: AddProxyProps) {
  const [formData, setFormData] = useState({
    address: '',
    port: '',
    type: 'http' as ProxyType,
    username: '',
    password: '',
  });

  const [bulkText, setBulkText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await proxyApi.addProxy({
        address: formData.address,
        port: parseInt(formData.port),
        type: formData.type,
        username: formData.username || undefined,
        password: formData.password || undefined,
      });
      setFormData({ address: '', port: '', type: 'http', username: '', password: '' });
      onSuccess();
    } catch (error) {
      console.error('Failed to add proxy:', error);
    }
  };

  const handleBulkImport = async () => {
    const lines = bulkText.split('\n').filter(line => line.trim());
    const proxies = lines.map(line => {
      const parts = line.trim().split(':');
      if (parts.length >= 2) {
        return {
          address: parts[0],
          port: parseInt(parts[1]),
          type: 'http' as ProxyType,
          username: parts[2] || undefined,
          password: parts[3] || undefined,
        };
      }
      return null;
    }).filter(p => p !== null);

    try {
      await proxyApi.importProxies(proxies);
      setBulkText('');
      onSuccess();
    } catch (error) {
      console.error('Failed to import proxies:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Add Proxy</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add Single Proxy
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
                placeholder="192.168.1.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Port</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
                placeholder="8080"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ProxyType })}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
              >
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
                <option value="socks5">SOCKS5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username (Optional)</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password (Optional)</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            >
              Add Proxy
            </button>
          </form>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Bulk Import
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Paste proxies (one per line: address:port:username:password)
              </label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full h-64 px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-neon-blue transition-colors"
                placeholder="192.168.1.1:8080&#10;192.168.1.2:8080:user:pass"
              />
            </div>
            <button
              onClick={handleBulkImport}
              className="w-full px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            >
              Import Proxies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
