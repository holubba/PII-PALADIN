#!/usr/bin/env node

/*
 * Simple HTTP server for testing PII-PALADIN browser version
 * Usage: node serve.js [port]
 */

import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const port = process.argv[2] || 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = createServer(async (req, res) => {
  try {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    let filePath = req.url === '/' ? '/example.browser.html' : req.url;
    filePath = join(__dirname, filePath);

    const ext = extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    const content = await readFile(filePath);
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);

  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>404 - File Not Found</title></head>
          <body>
            <h1>404 - File Not Found</h1>
            <p>The requested file was not found on this server.</p>
            <p><a href="/">Go to PII-PALADIN Browser Example</a></p>
          </body>
        </html>
      `);
    } else {
      console.error('Server error:', error);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>500 - Server Error</title></head>
          <body>
            <h1>500 - Server Error</h1>
            <p>An error occurred while processing your request.</p>
            <p><a href="/">Go to PII-PALADIN Browser Example</a></p>
          </body>
        </html>
      `);
    }
  }
});

server.listen(port, () => {
  console.log(`🚀 PII-PALADIN Browser Server running at http://localhost:${port}`);
  console.log(`📄 Browser example: http://localhost:${port}/example.browser.html`);
  console.log(`📁 Serving files from: ${__dirname}`);
  console.log(`\n💡 To stop the server, press Ctrl+C`);
});
