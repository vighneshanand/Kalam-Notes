/**
 * Kalam Notes Server Entry Point
 *
 * Spawns the Python REST API server on port 5001, proxies /api requests,
 * and mounts Vite development middleware on port 3000.
 */

import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.DEFAULT_APP_PORT || '3000', 10);
const PYTHON_PORT = parseInt(process.env.PYTHON_PORT || '5001', 10);

let pythonProcess: ChildProcess | null = null;

function startPythonBackend(): Promise<void> {
  return new Promise((resolve) => {
    const rootDir = process.cwd();
    const pythonScript = path.join(rootDir, 'backend', 'main.py');
    pythonProcess = spawn('python3', [pythonScript], {
      cwd: rootDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
        PYTHON_PORT: String(PYTHON_PORT),
      },
    });

    pythonProcess.stdout?.on('data', (data) => {
      const msg = data.toString();
      process.stdout.write(`[Python Backend] ${msg}`);
      if (msg.includes('running on http://127.0.0.1')) {
        resolve();
      }
    });

    pythonProcess.stderr?.on('data', (data) => {
      process.stderr.write(`[Python Stderr] ${data.toString()}`);
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to spawn Python backend:', err);
      resolve();
    });

    pythonProcess.on('exit', (code, signal) => {
      console.log(`Python backend exited with code ${code}, signal ${signal}`);
    });

    // Fallback resolution after timeout to avoid hanging
    setTimeout(() => resolve(), 2000);
  });
}

function proxyToPython(req: Request, res: Response) {
  const options: http.RequestOptions = {
    hostname: '127.0.0.1',
    port: PYTHON_PORT,
    path: req.originalUrl,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${PYTHON_PORT}`,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy to Python failed:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Backend service unavailable', details: err.message });
    }
  });

  req.pipe(proxyReq);
}

async function createServer() {
  const app = express();

  // Route /api to Python backend
  app.use('/api', (req: Request, res: Response) => {
    proxyToPython(req, res);
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  await startPythonBackend();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kalam Notes Web App listening on http://0.0.0.0:${PORT}`);
  });
}

process.on('SIGINT', () => {
  if (pythonProcess) pythonProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (pythonProcess) pythonProcess.kill('SIGTERM');
  process.exit(0);
});

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
