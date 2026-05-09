import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Recipe } from './recipe.model';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:4000/api/recipes';

  getRecipes(): Observable<Recipe[]> {
    // Intentar la API primero; si falla, usar el archivo local de assets como fallback.
    return this.http.get<Recipe[]>(this.apiUrl).pipe(
      // Si hay error (backend apagado/CORS/falla), cargamos el recurso local
      catchError(() => this.http.get<Recipe[]>('/assets/recipes.json'))
    );
  }

  getRecipeById(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/${id}`);
  }

  createRecipe(recipe: Omit<Recipe, 'id'>): Observable<Recipe> {
    return this.http.post<Recipe>(this.apiUrl, recipe);
  }

  // Enviar JSON libre al endpoint raw (sin validaciones)
  createRawRecipe(raw: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/raw`, raw);
  }

  updateRecipe(id: string, recipe: Partial<Recipe>): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.apiUrl}/${id}`, recipe);
  }

  deleteRecipe(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}