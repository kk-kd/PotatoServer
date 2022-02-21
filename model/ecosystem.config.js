module.exports = {
  apps: [
    {
      name: "index",
      script: "build/index.js",
      exec_mode: "fork",
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "emailWorker",
      exec_mode: "fork",
      watch: false,
      script: "build/mailer/emailWorker.js",
      instances: "1",
    },
  ],
};
