/**
 * 分类管理 API 路由
 * 处理分类的查询等
 */
import { Router, type Request, type Response } from 'express';
import { categoryDB } from '../dboperations.js';

const router = Router();

/**
 * 获取所有分类
 * GET /api/categories
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await categoryDB.findAll();
    
    // 转换为树形结构
    const categoryTree = buildCategoryTree(categories as any[]);
    
    res.json({
      success: true,
      categories: categoryTree
    });
  } catch (error) {
    console.error('获取分类列表错误:', error);
    // 数据库不可用时返回空数组
    res.json({
      success: true,
      categories: [],
      message: '数据库未连接，使用空数据'
    });
  }
});

/**
 * 获取单个分类
 * GET /api/categories/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await categoryDB.findById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        error: '分类不存在'
      });
      return;
    }

    res.json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        parentId: category.parent_id,
        orderIndex: category.order_index,
        createdAt: category.created_at
      }
    });
  } catch (error) {
    console.error('获取分类详情错误:', error);
    res.status(500).json({
      success: false,
      error: '获取分类详情失败'
    });
  }
});

/**
 * 获取子分类
 * GET /api/categories/:id/children
 */
router.get('/:id/children', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const children = await categoryDB.findChildren(id);

    res.json({
      success: true,
      children: (children as any[]).map(child => ({
        id: child.id,
        name: child.name,
        parentId: child.parent_id,
        orderIndex: child.order_index,
        createdAt: child.created_at
      }))
    });
  } catch (error) {
    console.error('获取子分类错误:', error);
    res.status(500).json({
      success: false,
      error: '获取子分类失败'
    });
  }
});

/**
 * 构建分类树形结构
 */
function buildCategoryTree(categories: any[]): any[] {
  const categoryMap = new Map();
  const roots: any[] = [];

  // 先将所有分类放入 map
  categories.forEach(cat => {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      parentId: cat.parent_id,
      orderIndex: cat.order_index,
      createdAt: cat.created_at,
      children: []
    });
  });

  // 构建树形结构
  categories.forEach(cat => {
    const category = categoryMap.get(cat.id);
    if (cat.parent_id) {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children.push(category);
      }
    } else {
      roots.push(category);
    }
  });

  // 按 orderIndex 排序
  const sortCategories = (cats: any[]) => {
    cats.sort((a, b) => a.orderIndex - b.orderIndex);
    cats.forEach(cat => {
      if (cat.children.length > 0) {
        sortCategories(cat.children);
      }
    });
  };

  sortCategories(roots);
  return roots;
}

export default router;
