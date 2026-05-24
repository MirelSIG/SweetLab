export interface Recipe {
  id?: string;
  _id?: string;
  title: string;
  imageUrl?: string;
  imageName?: string;
  description?: string;
  ingredients: string[];
  steps: string[];
  tags?: string[];
  prepTime?: number;
  servings?: number;
  difficulty?: 'Fácil' | 'Media' | 'Alta';
  createdAt?: string;
  updatedAt?: string;
}