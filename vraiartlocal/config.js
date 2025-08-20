  // Backend configuration
  backend: {
    host: process.env.BACKEND_HOST || 'localhost',
    port: process.env.BACKEND_PORT || 4000,
    get baseURL() {
      return `http://${this.host}:${this.port}`;
    },
