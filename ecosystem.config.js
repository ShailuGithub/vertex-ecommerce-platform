const common = {
  env: { NODE_ENV: "production" },
  instances: 1,
  exec_mode: "fork",
  autorestart: true,
  max_memory_restart: "500M",
};

module.exports = {
  apps: [
    {
      name: "vertex-api",
      cwd: "./apps/api",
      script: "dist/main.js",
      ...common,
    },
    {
      name: "vertex-storefront",
      cwd: "./apps/storefront",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      ...common,
    },
    {
      name: "vertex-admin",
      cwd: "./apps/admin",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3002",
      ...common,
    },
  ],
};
