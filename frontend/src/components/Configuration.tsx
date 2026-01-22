import { useState } from 'react';
import { Save, Settings } from 'lucide-react';
import type { Config, RotationMode } from '../types';
import { proxyApi } from '../api';

interface ConfigurationProps {
  config: Config;
  onUpdate: () => void;
}

export default function Configuration({ config, onUpdate }: ConfigurationProps) {
  const [formData, setFormData] = useState<Config>(config);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await proxyApi.updateConfig(formData);
      onUpdate();
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold gradient-text flex items-center">
        <Settings className="w-7 h-7 mr-3" />
        <span>系统配置</span>
      </h2>

      <div className="card rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">轮换模式</label>
              <select
                value={formData.rotation_mode}
                onChange={(e) => setFormData({ ...formData, rotation_mode: e.target.value as RotationMode })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-teal-500/30 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-all"
              >
                <option value="sequential">顺序</option>
                <option value="random">随机</option>
                <option value="least_used">最少使用</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">健康检查URL</label>
              <input
                type="text"
                value={formData.health_check_url}
                onChange={(e) => setFormData({ ...formData, health_check_url: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-teal-500/30 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">检查间隔（秒）</label>
              <input
                type="number"
                value={formData.check_interval}
                onChange={(e) => setFormData({ ...formData, check_interval: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-teal-500/30 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">超时时间（秒）</label>
              <input
                type="number"
                value={formData.timeout}
                onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-teal-500/30 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">最大失败次数</label>
              <input
                type="number"
                value={formData.max_fail_count}
                onChange={(e) => setFormData({ ...formData, max_fail_count: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-teal-500/30 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2">刷新间隔（秒）</label>
              <input
                type="number"
                value={formData.refresh_interval}
                onChange={(e) => setFormData({ ...formData, refresh_interval: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-teal-500/30 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-4 p-6 card rounded-xl">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto_refresh"
                checked={formData.auto_refresh}
                onChange={(e) => setFormData({ ...formData, auto_refresh: e.target.checked })}
                className="w-5 h-5 text-teal-500 bg-slate-900 border-teal-500/30 rounded focus:ring-teal-500"
              />
              <label htmlFor="auto_refresh" className="ml-3 text-sm text-white font-medium">
                启用自动刷新
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enable_auth"
                checked={formData.enable_auth}
                onChange={(e) => setFormData({ ...formData, enable_auth: e.target.checked })}
                className="w-5 h-5 text-teal-500 bg-slate-900 border-teal-500/30 rounded focus:ring-teal-500"
              />
              <label htmlFor="enable_auth" className="ml-3 text-sm text-white font-medium">
                启用认证
              </label>
            </div>
          </div>

          {formData.enable_auth && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 card rounded-xl">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">认证用户名</label>
                <input
                  type="text"
                  value={formData.auth_username}
                  onChange={(e) => setFormData({ ...formData, auth_username: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-teal-500/30 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">认证密码</label>
                <input
                  type="password"
                  value={formData.auth_password}
                  onChange={(e) => setFormData({ ...formData, auth_password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-teal-500/30 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-purple-600 rounded-xl text-white font-semibold text-lg glow-teal"
          >
            <Save className="w-5 h-5" />
            <span>保存配置</span>
          </button>
        </form>
      </div>
    </div>
  );
}
