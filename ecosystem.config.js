const root = __dirname;

module.exports = {
  apps: [
    {
      name: "backend",
      cwd: `${root}/backend`,
      script: `${root}/.venv/bin/gunicorn`,
      interpreter: "none",
      args: `--chdir ${root}/backend --bind 127.0.0.1:5000 app:app`,
    },
    {
      name: "frontend",
      cwd: `${root}/frontend`,
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
  ],
};
