import { useState, useEffect } from 'react';
import { Activity, Database, Plus, Settings, Upload } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ProxyList from './components/ProxyList';
import AddProxy from './components/AddProxy';
import Configuration from './components/Configuration';
import { proxyApi } from './api';
import type { Proxy, Config, Stats } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [proxiesData, configData, statsData] = await Promise.all([
        proxyApi.getProxies(),
        proxyApi.getConfig(),
        proxyApi.getStats(),
      ]);
      setProxies(proxiesData.proxies);
      setConfig(configData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const tabs = [
    { id: 'dashboard', label: '仪表板', icon: Activity },
    { id: 'proxies', label: '代理列表', icon: Database },
    { id: 'add', label: '添加代理', icon: Plus },
    { id: 'import', label: '批量导入', icon: Upload },
    { id: 'config', label: '配置', icon: Settings },
  ];

  return (
    <div className="min-h-screen relative z-10">
      {/* 顶部标题栏 */}
      <header className="border-b border-[var(--cyber-cyan)]/20 bg-[var(--cyber-surface)]/80 backdrop-blur-xl relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--cyber-cyan)]/5 via-transparent to-[var(--cyber-magenta)]/5"></div>
        <div className="container mx-auto px-6 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--cyber-cyan)] to-[var(--cyber-magenta)] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.5)]">
                  <span className="text-white font-['Orbitron'] font-bold text-xl">P</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--cyber-cyan)] to-[var(--cyber-magenta)] rounded-lg blur-xl opacity-50 animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-['Orbitron'] font-bold bg-gradient-to-r from-[var(--cyber-cyan)] via-[var(--cyber-purple)] to-[var(--cyber-magenta)] bg-clip-text text-transparent tracking-wider">
                  代理池管理系统
                </h1>
                <p className="text-sm text-[var(--cyber-cyan)]/60 font-['Rajdhani'] tracking-wide">PROXY POOL MANAGEMENT SYSTEM</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs font-['Rajdhani'] text-[var(--cyber-cyan)]">
              <div className="w-2 h-2 bg-[var(--cyber-cyan)] rounded-full animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.8)]"></div>
              <span>SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      {/* 导航栏 */}
      <nav className="border-b border-[var(--cyber-cyan)]/10 bg-[var(--cyber-surface)]/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 font-['Rajdhani'] font-semibold text-base transition-all relative group ${
                    activeTab === tab.id
                      ? 'text-[var(--cyber-cyan)]'
                      : 'text-gray-400 hover:text-[var(--cyber-cyan)]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {activeTab === tab.id && (
                    <>
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--cyber-cyan)] to-transparent shadow-[0_0_10px_rgba(0,240,255,0.8)]"></div>
                      <div className="absolute inset-0 bg-[var(--cyber-cyan)]/5 rounded-t-lg"></div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-[var(--cyber-cyan)]/0 group-hover:bg-[var(--cyber-cyan)]/5 transition-colors rounded-t-lg"></div>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === 'dashboard' && <Dashboard stats={stats} proxies={proxies} />}
        {activeTab === 'proxies' && <ProxyList proxies={proxies} onRefresh={loadData} />}
        {activeTab === 'add' && <AddProxy onSuccess={loadData} />}
        {activeTab === 'import' && <div className="text-center text-gray-400 py-20">批量导入功能开发中...</div>}
        {activeTab === 'config' && config && <Configuration config={config} onUpdate={loadData} />}
      </main>
    </div>
  );
}

export default App;
