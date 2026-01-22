import { useState } from 'react';
import { Save, Settings } from 'lucide-react';
import { Config, RotationMode } from '../types';
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
      <h2 className="text-2xl font-bold text-white flex items-center">
        <Settings className="w-6 h-6 mr-2" />
        Configuration
      </h2>

      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Rotation Mode</label>
              <select
                value={formData.rotation_mode}
                onChange={(e) => setFormData({ ...formData, rotation_mode: e.target.value as RotationMode })}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
              >
                <option value="sequential">Sequential</option>
                <option value="random">Random</option>
                <option value="least_used">Least Used</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Health Check URL</label>
              <input
                type="text"
                value={formData.health_check_url}
                onChange={(e) => setFormData({ ...formData, health_check_url: e.target.value })}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Check Interval (seconds)</label>
              <input
                type="number"
                value={formData.check_interval}
                onChange={(e) => setFormData({ ...formData, check_interval: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (seconds)</label>
              <input
                type="number"
                value={formData.timeout}
                onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Fail Count</label>
              <input
                type="number"
                value={formData.max_fail_count}
                onChange={(e) => setFormData({ ...formData, max_fail_count: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Refresh Interval (seconds)</label>
              <input
                type="number"
                value={formData.refresh_interval}
                onChange={(e) => setFormData({ ...formData, refresh_interval: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
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
                className="w-4 h-4 text-neon-blue bg-gray-900 border-gray-700 rounded focus:ring-neon-blue"
              />
              <label htmlFor="auto_refresh" className="ml-2 text-sm text-gray-300">
                Enable Auto Refresh
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enable_auth"
                checked={formData.enable_auth}
                onChange={(e) => setFormData({ ...formData, enable_auth: e.target.checked })}
                className="w-4 h-4 text-neon-blue bg-gray-900 border-gray-700 rounded focus:ring-neon-blue"
              />
              <label htmlFor="enable_auth" className="ml-2 text-sm text-gray-300">
                Enable Authentication
              </label>
            </div>
          </div>

          {formData.enable_auth && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Auth Username</label>
                <input
                  type="text"
                  value={formData.auth_username}
                  onChange={(e) => setFormData({ ...formData, auth_username: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Auth Password</label>
                <input
                  type="password"
                  value={formData.auth_password}
                  onChange={(e) => setFormData({ ...formData, auth_password: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </form>
      </div>
    </div>
  );
}
