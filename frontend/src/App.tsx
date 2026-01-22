import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ProxyList from './components/ProxyList';
import AddProxy from './components/AddProxy';
import Configuration from './components/Configuration';
import { proxyApi } from './api';
import type { Proxy, Config, Stats } from './types';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-900 dark:to-black">
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center animate-glow">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                ProxyPool Hub
              </h1>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-400" />}
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-gray-800 bg-black/30 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="flex space-x-1">
            {['dashboard', 'proxies', 'add', 'config'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium transition-all ${
                  activeTab === tab
                    ? 'text-neon-blue border-b-2 border-neon-blue'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        {activeTab === 'dashboard' && <Dashboard stats={stats} proxies={proxies} />}
        {activeTab === 'proxies' && <ProxyList proxies={proxies} onRefresh={loadData} />}
        {activeTab === 'add' && <AddProxy onSuccess={loadData} />}
        {activeTab === 'config' && config && <Configuration config={config} onUpdate={loadData} />}
      </main>
    </div>
  );
}

export default App;
