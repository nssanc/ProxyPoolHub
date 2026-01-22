import { useState } from 'react';
import { Plus, Upload, FileUp } from 'lucide-react';
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
  const [file, setFile] = useState<File | null>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const text = await uploadedFile.text();
    setBulkText(text);
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
      setFile(null);
      onSuccess();
    } catch (error) {
      console.error('Failed to import proxies:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold gradient-text">添加代理</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 单个添加 */}
        <div className="card rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-teal-400" />
            单个添加
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">地址</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-teal-500/30 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-all"
                placeholder="192.168.1.1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">端口</label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-teal-500/30 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-all"
                placeholder="8080"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">类型</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ProxyType })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-teal-500/30 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-all"
              >
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
                <option value="socks5">SOCKS5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">用户名（可选）</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-teal-500/30 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">密码（可选）</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-teal-500/30 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-purple-600 rounded-xl text-white font-semibold glow-teal"
            >
              添加代理
            </button>
          </form>
        </div>

        {/* 批量导入 */}
        <div className="card rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-purple-400" />
            批量导入
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">
                上传文件或粘贴代理（每行一个：地址:端口:用户名:密码）
              </label>

              {/* 文件上传按钮 */}
              <div className="mb-4">
                <label className="flex items-center justify-center w-full px-4 py-3 bg-slate-900/50 border-2 border-dashed border-purple-500/30 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-500/5 transition-all group/upload">
                  <FileUp className="w-5 h-5 mr-2 text-purple-400 group-hover/upload:animate-bounce" />
                  <span className="text-white font-semibold">
                    {file ? file.name : '点击选择文件'}
                  </span>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full h-64 px-4 py-3 bg-slate-900/50 border border-purple-500/30 rounded-xl text-purple-300 font-mono text-sm focus:outline-none focus:border-purple-500 transition-all"
                placeholder="192.168.1.1:8080&#10;192.168.1.2:8080:user:pass"
              />
            </div>
            <button
              onClick={handleBulkImport}
              disabled={!bulkText.trim()}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white font-semibold glow-purple disabled:opacity-50 disabled:cursor-not-allowed"
            >
              导入代理
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
