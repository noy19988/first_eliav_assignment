module.exports = {
  apps: [
    {
      name: 'foodconnect',
      script: './dist/src/server.js',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
