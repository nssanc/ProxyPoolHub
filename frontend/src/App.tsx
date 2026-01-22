import { useState, useEffect } from 'react';
import { Activity, Database, Plus, Settings, Upload, Zap } from 'lucide-react';
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
    { id: 'config', label: '系统配置', icon: Settings },
  ];

  return (
    <div className="min-h-screen">
      {/* 顶部导航栏 */}
      <header className="card sticky top-0 z-50 border-b border-teal-500/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center animate-pulse-glow">
                  <Zap className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">ProxyPool Hub</h1>
                <p className="text-xs text-slate-400 mt-0.5">智能代理池管理系统</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 px-4 py-2 card rounded-full">
              <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-300 font-medium">系统运行中</span>
            </div>
          </div>
        </div>
      </header>

      {/* 标签导航 */}
      <nav className="card border-b border-teal-500/10">
        <div className="container mx-auto px-6">
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-6 py-4 font-medium transition-all duration-300 rounded-t-lg
                    ${activeTab === tab.id
                      ? 'text-teal-400 bg-teal-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-purple-600 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="container mx-auto px-6 py-8">
        <div className="animate-fadeInUp">
          {activeTab === 'dashboard' && <Dashboard stats={stats} proxies={proxies} />}
          {activeTab === 'proxies' && <ProxyList proxies={proxies} onRefresh={loadData} />}
          {activeTab === 'add' && <AddProxy onSuccess={loadData} />}
          {activeTab === 'import' && <AddProxy onSuccess={loadData} />}
          {activeTab === 'config' && config && <Configuration config={config} onUpdate={loadData} />}
        </div>
      </main>
    </div>
  );
}

export default App;
