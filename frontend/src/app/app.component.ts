import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Recipe } from './recipe.model';
import { RecipeService } from './recipe.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  recipes: Recipe[] = [];
  selectedRecipe?: Recipe;
  searchTerm = '';
  loading = true;
  errorMessage = '';

  constructor(private readonly recipeService: RecipeService) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  private loadRecipes(): void {
    this.loading = true;
    this.recipeService.getRecipes().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.selectedRecipe = recipes[0];
        this.loading = false;
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Error al cargar recetas:', error);
        this.errorMessage = 'No se pudo conectar a la API. Verifica que el backend esté corriendo en http://localhost:4000';
        this.loading = false;
      }
    });
  }

  get filteredRecipes(): Recipe[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.recipes;
    }

    return this.recipes.filter((recipe) => {
      const haystack = [
        recipe.title,
        recipe.description || '',
        (recipe.tags || []).join(' '),
        recipe.ingredients.join(' ')
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }

  get totalRecipes(): number {
    return this.recipes.length;
  }

  get totalIngredients(): number {
    return new Set(this.recipes.flatMap((recipe) => recipe.ingredients)).size;
  }

  get totalSteps(): number {
    return this.recipes.reduce((sum, recipe) => sum + recipe.steps.length, 0);
  }

  selectRecipe(recipe: Recipe): void {
    this.selectedRecipe = recipe;
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  trackByRecipe(_: number, recipe: Recipe): string {
    return recipe._id || recipe.id || '';
  }
}