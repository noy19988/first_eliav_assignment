module.exports = {
  apps: [
    {
      name: 'foodconnect',
      script: 'npm',
      args: 'run prod',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      }
    }
  ]
};
