module.exports = {
  apps: [
    {
      name: 'yukon-wildcats-server',
      script: 'server.js',
      cwd: './server',
      instances: 'max',  // Use all available CPUs for better performance
      exec_mode: 'cluster',  // Enable clustering for production
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        // VPS optimizations
        NODE_OPTIONS: '--max-old-space-size=512',
        UV_THREADPOOL_SIZE: 4
      }
    }
  ],
  
  // Deployment configuration for VPS
  deploy: {
    production: {
      user: 'root',
      host: 'YOUR_VPS_IP',
      ref: 'origin/main',
      repo: 'git@github.com:Lazardeus/yukon-wildcats-site.git',
      path: '/var/www/yukon-wildcats',
      'pre-deploy-local': '',
      'post-deploy': 'cd server && npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'cd server && npm install'
    }
  }
};