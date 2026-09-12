import express from 'express';
import client from 'prom-client';

client.collectDefaultMetrics({ prefix: 'demo_app_' });

const httpRequestCounter = new client.Counter({
  name: 'demo_app_http_requests_total',
  help: 'Total de peticiones HTTP recibidas',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDuration = new client.Histogram({
  name: 'demo_app_http_request_duration_seconds',
  help: 'Duración de las peticiones HTTP en segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

export function createApp() {
  const app = express();

  app.disable('x-powered-by');

  app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer();

    res.on('finish', () => {
      const route = req.route ? req.route.path : req.path;
      httpRequestCounter.inc({
        method: req.method,
        route,
        status_code: String(res.statusCode),
      });
      end({
        method: req.method,
        route,
        status_code: String(res.statusCode),
      });
    });

    next();
  });

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

  app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
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
