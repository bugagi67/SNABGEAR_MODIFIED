import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Ensure public/data directory exists for saving orders and leads
  const dataDir = path.resolve(__dirname, 'public/data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (e) {
      console.warn('Could not create data dir:', e);
    }
  }

  // API Route: Submit Order from Cart
  app.post('/api/submit-order', async (req: Request, res: Response) => {
    try {
      const order = req.body;
      const orderId = `SG-${Date.now().toString(36).toUpperCase()}`;
      const timestamp = new Date().toISOString();
      const orderRecord = {
        orderId,
        timestamp,
        ...order,
      };

      console.log(`[SNABGEAR] Order processed: #${orderId}`);

      // Persist order to local orders_log.json
      try {
        const ordersFile = path.resolve(dataDir, 'orders_log.json');
        let existingOrders: any[] = [];
        if (fs.existsSync(ordersFile)) {
          const content = fs.readFileSync(ordersFile, 'utf-8');
          existingOrders = JSON.parse(content || '[]');
        }
        existingOrders.unshift(orderRecord);
        fs.writeFileSync(ordersFile, JSON.stringify(existingOrders.slice(0, 500), null, 2), 'utf-8');
      } catch (err) {
        console.warn('Error saving order to log file:', err);
      }

      // Background attempt to notify FormSubmit (server-to-server, no CORS)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        fetch('https://formsubmit.co/info@snabgear.ru', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            _subject: `[SNABGEAR] Новый заказ #${orderId} на сумму ${order.totalSum || ''} ₽`,
            _template: 'table',
            _captcha: 'false',
            'Номер заказа': orderId,
            'Организация': order.companyName || '—',
            'ИНН': order.companyInn || '—',
            'Контактное лицо': order.contactName || '—',
            'Телефон': order.phone || '—',
            'Email': order.email || '—',
            'Комментарий': order.deliveryNote || '—',
            'Состав заказа': order.itemsText || '—',
            'Итоговая сумма': `${order.totalSum || '0'} ₽`,
          }),
          signal: controller.signal,
        })
          .catch((e) => console.log('[Server FormSubmit notice]:', e.message))
          .finally(() => clearTimeout(timeoutId));
      } catch (e) {
        // Ignore background notify error
      }

      return res.status(200).json({
        success: true,
        orderId,
        message: 'Заказ успешно зарегистрирован',
        targetEmail: 'info@snabgear.ru',
      });
    } catch (error: any) {
      console.error('Submit order error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // API Route: Submit Lead with Specification
  app.post('/api/submit-lead', async (req: Request, res: Response) => {
    try {
      const lead = req.body;
      const leadId = `LD-${Date.now().toString(36).toUpperCase()}`;
      const timestamp = new Date().toISOString();
      const leadRecord = {
        leadId,
        timestamp,
        organization: lead.organization || lead.companyOrInn || '—',
        contactPerson: lead.contact_person || lead.contactPerson || '—',
        phone: lead.phone || '—',
        email: lead.email || '—',
        message: lead.message || lead.comment || '—',
        fileName: lead.fileName || lead.attachmentName || null,
        fileSize: lead.fileSize || null,
      };

      console.log(`[SNABGEAR] Lead processed: #${leadId}`);

      // Persist to leads_log.json
      try {
        const leadsFile = path.resolve(dataDir, 'leads_log.json');
        let existingLeads: any[] = [];
        if (fs.existsSync(leadsFile)) {
          const content = fs.readFileSync(leadsFile, 'utf-8');
          existingLeads = JSON.parse(content || '[]');
        }
        existingLeads.unshift(leadRecord);
        fs.writeFileSync(leadsFile, JSON.stringify(existingLeads.slice(0, 500), null, 2), 'utf-8');
      } catch (err) {
        console.warn('Error saving lead to log file:', err);
      }

      // Background attempt to notify FormSubmit (server-to-server, no CORS)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        fetch('https://formsubmit.co/info@snabgear.ru', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            _subject: `[SNABGEAR] Новая заявка на расчет от ${leadRecord.organization} (${leadRecord.contactPerson})`,
            _template: 'table',
            _captcha: 'false',
            'Номер заявки': leadId,
            'Организация / ИНН': leadRecord.organization,
            'Контактное лицо': leadRecord.contactPerson,
            'Телефон': leadRecord.phone,
            'Email': leadRecord.email,
            'ТЗ / Комментарий': leadRecord.message,
            'Прикрепленный файл': leadRecord.fileName ? `${leadRecord.fileName} (${leadRecord.fileSize})` : 'Нет',
          }),
          signal: controller.signal,
        })
          .catch((e) => console.log('[Server FormSubmit notice]:', e.message))
          .finally(() => clearTimeout(timeoutId));
      } catch (e) {
        // Ignore background notify error
      }

      return res.status(200).json({
        success: true,
        leadId,
        message: 'Заявка успешно принята',
        targetEmail: 'info@snabgear.ru',
      });
    } catch (error: any) {
      console.error('Submit lead error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'SNABGEAR B2B Full-Stack Server',
      targetEmail: 'info@snabgear.ru',
      timestamp: new Date().toISOString(),
    });
  });

  // Vite middleware in dev, static dist in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`SNABGEAR Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
