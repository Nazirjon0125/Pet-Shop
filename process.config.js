const { name } = require("ejs");

module.exports = {
  apps: [
    {
      name: "PETSHOP",
      cwd: "./",
      script: "./dist/server.js",
      watch: false,
      env_produxtion: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
      instances: 1,
      exec_mode: "cluster",
    },
  ],
};
