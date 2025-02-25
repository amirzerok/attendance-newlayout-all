import { createServer } from 'https';
import { createServer as createHttpServer } from 'http';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import express from 'express';
import { IncomingMessage, ServerResponse } from 'http';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.existsSync('/certs/privkey.pem') ? fs.readFileSync('/certs/privkey.pem') : '',
  cert: fs.existsSync('/certs/fullchain.pem') ? fs.readFileSync('/certs/fullchain.pem') : '',
};

app.prepare().then(() => {
  const server = express();

  // 🚀 1. ریدایرکت HTTP به HTTPS
  createHttpServer((req, res) => {
    res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
    res.end();
  }).listen(80, () => {
    console.log('🚀 HTTP Server running on port 80 (Redirecting to HTTPS)');
  });

  // 🚀 2. سرور HTTPS (فقط اجرا می‌شه اگه SSL موجود باشه)
  if (httpsOptions.key && httpsOptions.cert) {
    createServer(httpsOptions, (req: IncomingMessage, res: ServerResponse) => {
      const parsedUrl = parse(req.url || '', true);
      handle(req, res, parsedUrl);
    }).listen(443, () => {
      console.log('✅ HTTPS Server running on https://yourdomain.com');
    });
  } else {
    console.error('❌ SSL certificates not found! Make sure Let’s Encrypt is configured.');
  }
});
