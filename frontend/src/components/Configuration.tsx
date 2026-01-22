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
      <h2 className="text-2xl font-['Orbitron'] font-bold text-[var(--cyber-cyan)] flex items-center">
        <Settings className="w-6 h-6 mr-3 text-[var(--cyber-cyan)]" />
        <span className="mr-3">系统配置</span>
        <div className="h-px flex-1 max-w-xs bg-gradient-to-r from-[var(--cyber-cyan)] to-transparent"></div>
      </h2>

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--cyber-cyan)]/10 to-[var(--cyber-magenta)]/10 rounded-lg blur-xl opacity-50"></div>
        <div className="relative bg-[var(--cyber-surface)]/80 backdrop-blur-xl border border-[var(--cyber-cyan)]/30 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-['Rajdhani'] font-semibold text-[var(--cyber-cyan)]/80 mb-2">轮换模式</label>
                <select
                  value={formData.rotation_mode}
                  onChange={(e) => setFormData({ ...formData, rotation_mode: e.target.value as RotationMode })}
                  className="w-full px-4 py-3 bg-[var(--cyber-bg)]/50 border border-[var(--cyber-cyan)]/30 rounded-lg text-white font-['Rajdhani'] focus:outline-none focus:border-[var(--cyber-cyan)] focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
                >
                  <option value="sequential">顺序</option>
                  <option value="random">随机</option>
                  <option value="least_used">最少使用</option>
                </select>
              </div>

            <div>
              <label className="block text-sm font-['Rajdhani'] font-semibold text-[var(--cyber-cyan)]/80 mb-2">健康检查URL</label>
              <input
                type="text"
                value={formData.health_check_url}
                onChange={(e) => setFormData({ ...formData, health_check_url: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--cyber-bg)]/50 border border-[var(--cyber-cyan)]/30 rounded-lg text-white font-['Rajdhani'] focus:outline-none focus:border-[var(--cyber-cyan)] focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-['Rajdhani'] font-semibold text-[var(--cyber-cyan)]/80 mb-2">检查间隔（秒）</label>
              <input
                type="number"
                value={formData.check_interval}
                onChange={(e) => setFormData({ ...formData, check_interval: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-[var(--cyber-bg)]/50 border border-[var(--cyber-cyan)]/30 rounded-lg text-white font-['Rajdhani'] focus:outline-none focus:border-[var(--cyber-cyan)] focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-['Rajdhani'] font-semibold text-[var(--cyber-cyan)]/80 mb-2">超时时间（秒）</label>
              <input
                type="number"
                value={formData.timeout}
                onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-[var(--cyber-bg)]/50 border border-[var(--cyber-cyan)]/30 rounded-lg text-white font-['Rajdhani'] focus:outline-none focus:border-[var(--cyber-cyan)] focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-['Rajdhani'] font-semibold text-[var(--cyber-cyan)]/80 mb-2">最大失败次数</label>
              <input
                type="number"
                value={formData.max_fail_count}
                onChange={(e) => setFormData({ ...formData, max_fail_count: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-[var(--cyber-bg)]/50 border border-[var(--cyber-cyan)]/30 rounded-lg text-white font-['Rajdhani'] focus:outline-none focus:border-[var(--cyber-cyan)] focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-['Rajdhani'] font-semibold text-[var(--cyber-cyan)]/80 mb-2">刷新间隔（秒）</label>
              <input
                type="number"
                value={formData.refresh_interval}
                onChange={(e) => setFormData({ ...formData, refresh_interval: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-[var(--cyber-bg)]/50 border border-[var(--cyber-cyan)]/30 rounded-lg text-white font-['Rajdhani'] focus:outline-none focus:border-[var(--cyber-cyan)] focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto_refresh"
                checked={formData.auto_refresh}
                onChange={(e) => setFormData({ ...formData, auto_refresh: e.target.checked })}
                className="w-4 h-4 text-[var(--cyber-cyan)] bg-[var(--cyber-bg)] border-[var(--cyber-cyan)]/30 rounded focus:ring-[var(--cyber-cyan)]"
              />
              <label htmlFor="auto_refresh" className="ml-2 text-sm font-['Rajdhani'] text-white">
                启用自动刷新
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enable_auth"
                checked={formData.enable_auth}
                onChange={(e) => setFormData({ ...formData, enable_auth: e.target.checked })}
                className="w-4 h-4 text-[var(--cyber-cyan)] bg-[var(--cyber-bg)] border-[var(--cyber-cyan)]/30 rounded focus:ring-[var(--cyber-cyan)]"
              />
              <label htmlFor="enable_auth" className="ml-2 text-sm font-['Rajdhani'] text-white">
                启用认证
              </label>
            </div>
          </div>

          {formData.enable_auth && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-['Rajdhani'] font-semibold text-[var(--cyber-cyan)]/80 mb-2">认证用户名</label>
                <input
                  type="text"
                  value={formData.auth_username}
                  onChange={(e) => setFormData({ ...formData, auth_username: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--cyber-bg)]/50 border border-[var(--cyber-cyan)]/30 rounded-lg text-white font-['Rajdhani'] focus:outline-none focus:border-[var(--cyber-cyan)] focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-['Rajdhani'] font-semibold text-[var(--cyber-cyan)]/80 mb-2">认证密码</label>
                <input
                  type="password"
                  value={formData.auth_password}
                  onChange={(e) => setFormData({ ...formData, auth_password: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--cyber-bg)]/50 border border-[var(--cyber-cyan)]/30 rounded-lg text-white font-['Rajdhani'] focus:outline-none focus:border-[var(--cyber-cyan)] focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[var(--cyber-cyan)] to-[var(--cyber-purple)] rounded-lg text-white font-['Rajdhani'] font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all"
          >
            <Save className="w-4 h-4" />
            <span>保存配置</span>
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
