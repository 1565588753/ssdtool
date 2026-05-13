/**
 * local server entry file, for local development
 */
import app from './app.js';
import { testConnection } from './db.js';
import { setUseMockData } from './dboperations.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, async () => {
  console.log(`Server ready on port ${PORT}`);
  
  // 测试数据库连接
  const connected = await testConnection();
  
  if (!connected) {
    console.log('⚠️  Database connection failed, switching to mock data mode');
    setUseMockData(true);
  }
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;