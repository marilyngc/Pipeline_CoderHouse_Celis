import { createApp } from './app.js';

const port = 3000;
const app = createApp();

const server = app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

function shutdown(signal) {
  console.log(`${signal} recibido, cerrando el servidor...`);
  server.close(() => {
    console.log('Servidor cerrada correctamente');
    process.exit(0);
  });

  // Si algo se queda colgado, forzamos la salida a los 10s
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
