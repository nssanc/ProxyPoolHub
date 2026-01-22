package main

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	db *sql.DB
}

func NewDatabase(dbPath string) (*Database, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}

	database := &Database{db: db}
	if err := database.initTables(); err != nil {
		return nil, err
	}

	return database, nil
}

func (d *Database) initTables() error {
	// 创建代理表
	proxyTable := `
	CREATE TABLE IF NOT EXISTS proxies (
		id TEXT PRIMARY KEY,
		address TEXT NOT NULL,
		port INTEGER NOT NULL,
		type TEXT NOT NULL,
		username TEXT,
		password TEXT,
		status TEXT DEFAULT 'checking',
		response_time INTEGER DEFAULT 0,
		success_count INTEGER DEFAULT 0,
		fail_count INTEGER DEFAULT 0,
		last_check DATETIME,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	// 创建配置表
	configTable := `
	CREATE TABLE IF NOT EXISTS config (
		id INTEGER PRIMARY KEY CHECK (id = 1),
		rotation_mode TEXT DEFAULT 'sequential',
		health_check_url TEXT DEFAULT 'https://www.google.com',
		check_interval INTEGER DEFAULT 60,
		timeout INTEGER DEFAULT 10,
		max_fail_count INTEGER DEFAULT 3,
		refresh_interval INTEGER DEFAULT 300,
		auto_refresh INTEGER DEFAULT 1,
		enable_auth INTEGER DEFAULT 0,
		auth_username TEXT,
		auth_password TEXT
	);`

	if _, err := d.db.Exec(proxyTable); err != nil {
		return err
	}

	if _, err := d.db.Exec(configTable); err != nil {
		return err
	}

	// 插入默认配置
	d.db.Exec(`INSERT OR IGNORE INTO config (id) VALUES (1)`)

	return nil
}

// SaveProxy 保存代理到数据库
func (d *Database) SaveProxy(proxy *Proxy) error {
	query := `INSERT OR REPLACE INTO proxies
		(id, address, port, type, username, password, status, response_time, success_count, fail_count, last_check)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	_, err := d.db.Exec(query,
		proxy.ID,
		proxy.Address,
		proxy.Port,
		proxy.Type,
		proxy.Username,
		proxy.Password,
		proxy.Status,
		proxy.ResponseTime,
		proxy.SuccessCount,
		proxy.FailCount,
		proxy.LastCheck,
	)
	return err
}

// LoadProxies 从数据库加载所有代理
func (d *Database) LoadProxies() ([]*Proxy, error) {
	query := `SELECT id, address, port, type, username, password, status, response_time, success_count, fail_count, last_check
		FROM proxies`

	rows, err := d.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var proxies []*Proxy
	for rows.Next() {
		proxy := &Proxy{}
		err := rows.Scan(
			&proxy.ID,
			&proxy.Address,
			&proxy.Port,
			&proxy.Type,
			&proxy.Username,
			&proxy.Password,
			&proxy.Status,
			&proxy.ResponseTime,
			&proxy.SuccessCount,
			&proxy.FailCount,
			&proxy.LastCheck,
		)
		if err != nil {
			log.Printf("Error scanning proxy: %v", err)
			continue
		}
		proxies = append(proxies, proxy)
	}
	return proxies, nil
}

// DeleteProxy 从数据库删除代理
func (d *Database) DeleteProxy(id string) error {
	query := `DELETE FROM proxies WHERE id = ?`
	_, err := d.db.Exec(query, id)
	return err
}

// SaveConfig 保存配置到数据库
func (d *Database) SaveConfig(config *Config) error {
	query := `UPDATE config SET
		rotation_mode = ?,
		health_check_url = ?,
		check_interval = ?,
		timeout = ?,
		max_fail_count = ?,
		refresh_interval = ?,
		auto_refresh = ?,
		enable_auth = ?,
		auth_username = ?,
		auth_password = ?
		WHERE id = 1`

	_, err := d.db.Exec(query,
		config.RotationMode,
		config.HealthCheckURL,
		config.CheckInterval,
		config.Timeout,
		config.MaxFailCount,
		config.RefreshInterval,
		config.AutoRefresh,
		config.EnableAuth,
		config.AuthUsername,
		config.AuthPassword,
	)
	return err
}

// LoadConfig 从数据库加载配置
func (d *Database) LoadConfig() (*Config, error) {
	query := `SELECT rotation_mode, health_check_url, check_interval, timeout, max_fail_count,
		refresh_interval, auto_refresh, enable_auth, auth_username, auth_password
		FROM config WHERE id = 1`

	config := &Config{}
	err := d.db.QueryRow(query).Scan(
		&config.RotationMode,
		&config.HealthCheckURL,
		&config.CheckInterval,
		&config.Timeout,
		&config.MaxFailCount,
		&config.RefreshInterval,
		&config.AutoRefresh,
		&config.EnableAuth,
		&config.AuthUsername,
		&config.AuthPassword,
	)
	if err != nil {
		return nil, err
	}
	return config, nil
}

// Close 关闭数据库连接
func (d *Database) Close() error {
	return d.db.Close()
}
