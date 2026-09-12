import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

test('GET /demo responde 200 con status "ok"', async () => {
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/demo`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.status, 'ok');
    assert.equal(typeof body.uptimeSeconds, 'number');
  } finally {
    server.close();
  }
});

test('GET / responde 200 con un mensaje de bienvenida', async () => {
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.match(body.message, /Hola desde el pipeline/);
  } finally {
    server.close();
  }
});

test('GET /metrics expone métricas Prometheus', async () => {
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/metrics`);
    const body = await res.text();

    assert.equal(res.status, 200);
    assert.match(body, /app_http_requests_total|nodejs_/);
  } finally {
    server.close();
  }
});
