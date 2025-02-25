import { createServer } from 'https';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import { IncomingMessage, ServerResponse } from 'http';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// مسیر گواهینامه‌های SSL (مطمئن شو که مسیرها درست هستند)
const httpsOptions = {
  key: fs.readFileSync('/etc/letsencrypt/live/webapp.aboutthenetworks.online/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/webapp.aboutthenetworks.online/fullchain.pem'),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req: IncomingMessage, res: ServerResponse) => {
    const parsedUrl = parse(req.url || '', true);
    handle(req, res, parsedUrl);
  }).listen(3000, () => {
    console.log('> Server running on https://localhost:3000');
  });
});
