/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import firmwareRoutes from './routes/firmware.js'
import categoryRoutes from './routes/categories.js'
import donationRoutes from './routes/donations.js'
import adminRoutes from './routes/admin.js'
import statsRoutes from './routes/stats.js'
import { maintenanceMiddleware } from './middleware/maintenance.js'
import { configDB, firmwareDB, categoryDB } from './dboperations.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 静态文件服务 - 提供上传文件的访问
app.use('/uploads', express.static(path.join(__dirname, '../files')))

/**
 * 公开维护状态 - 无需鉴权，放在维护模式中间件之前
 */
app.get('/api/maintenance-status', async (req: Request, res: Response): Promise<void> => {
  try {
    const maintenance = await configDB.get('maintenance_settings');
    res.json({
      enabled: maintenance?.enabled || false,
      message: maintenance?.message || '网站维护中，敬请期待...'
    });
  } catch {
    res.json({ enabled: false, message: '' });
  }
});

/**
 * API Routes
 */
app.use('/api', maintenanceMiddleware)
app.use('/api/auth', authRoutes)
app.use('/api/firmware', firmwareRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/donations', donationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/stats', statsRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * 动态 Sitemap - 公开访问，放在维护模式中间件之前
 */
app.get('/sitemap.xml', async (req: Request, res: Response): Promise<void> => {
  try {
    const firmwareList = await firmwareDB.findAll();
    const categoryList = await categoryDB.findAll();
    const baseUrl = 'https://ssdtool.cc';
    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    xml += `  <url><loc>${baseUrl}/</loc><priority>1.0</priority><changefreq>daily</changefreq></url>\n`;
    xml += `  <url><loc>${baseUrl}/categories</loc><priority>0.8</priority><changefreq>daily</changefreq></url>\n`;
    xml += `  <url><loc>${baseUrl}/donate</loc><priority>0.5</priority><changefreq>monthly</changefreq></url>\n`;

    const parentCategories = categoryList.filter((c: any) => !c.parent_id);
    for (const cat of parentCategories) {
      xml += `  <url><loc>${baseUrl}/categories?category=${cat.id}</loc><priority>0.7</priority><changefreq>weekly</changefreq></url>\n`;
    }

    for (const fw of firmwareList) {
      if (fw.status !== 'approved') continue;
      xml += `  <url><loc>${baseUrl}/firmware/${fw.id}</loc><priority>0.9</priority><changefreq>weekly</changefreq><lastmod>${fw.updated_at ? fw.updated_at.split(' ')[0] : today}</lastmod></url>\n`;
    }

    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('生成sitemap错误:', error);
    res.status(500).header('Content-Type', 'text/plain').send('Sitemap generation failed');
  }
});

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app