module.exports = {
  apps: [
    {
      name: "backend",
      script: "./server.js",

      // Mode cluster (important pour ERP)
      instances: "max",
      exec_mode: "cluster",

      // Redémarrage auto
      autorestart: true,
      watch: false,

      // Mémoire limite (évite crash silencieux)
      max_memory_restart: "500M",

      // Variables d'environnement
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};