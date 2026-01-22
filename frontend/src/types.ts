export type ProxyType = 'http' | 'https' | 'socks5';
export type ProxyStatus = 'active' | 'inactive' | 'checking';
export type RotationMode = 'sequential' | 'random' | 'least_used';

export interface Proxy {
  id: string;
  address: string;
  port: number;
  type: ProxyType;
  username?: string;
  password?: string;
  status: ProxyStatus;
  response_time: number;
  success_count: number;
  fail_count: number;
  last_check: string;
  created_at: string;
}

export interface Config {
  rotation_mode: RotationMode;
  health_check_url: string;
  check_interval: number;
  timeout: number;
  max_fail_count: number;
  enable_auth: boolean;
  auth_username: string;
  auth_password: string;
  auto_refresh: boolean;
  refresh_interval: number;
}

export interface Stats {
  total_proxies: number;
  active_proxies: number;
  total_requests: number;
  success_requests: number;
  failed_requests: number;
}
