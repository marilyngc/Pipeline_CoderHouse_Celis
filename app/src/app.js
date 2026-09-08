import express from 'express';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');

  app.get('/', (_req, res) => {
    res.status(200).json({
      message: 'Hola desde el pipeline de demo ',
    });
  });

  app.get('/demo', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
    });
  });

  // Usado por los liveness/readiness probes de Kubernetes y por el
  // HEALTHCHECK del Dockerfile.
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
    });
  });

  return app;
}
