import { Category } from '../types/category';
import { CATEGORIES_DATA } from '../data/categoriesData';

export interface ICategoryService {
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
  
  // Future Admin & Firebase methods
  createCategory?(category: Omit<Category, 'id'>): Promise<Category>;
  updateCategory?(id: string, data: Partial<Category>): Promise<Category>;
  deleteCategory?(id: string): Promise<boolean>;
}

export class CategoryService implements ICategoryService {
  private categories: Category[] = [...CATEGORIES_DATA];

  async getCategories(): Promise<Category[]> {
    return this.categories.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return this.categories.find((c) => c.id === id) || null;
  }
}

export const categoryService: ICategoryService = new CategoryService();
