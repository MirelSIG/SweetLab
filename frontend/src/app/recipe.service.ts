import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Recipe } from './recipe.model';

export interface LoginResponse {
  token: string;
  refreshToken: string;
  role: 'admin' | 'externo';
  expiresIn: string;
}

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:4000/api';
  private readonly apiUrl = `${this.apiBaseUrl}/recipes`;
  private readonly tokenStorageKey = 'sweetlabAuthToken';
  private readonly refreshTokenStorageKey = 'sweetlabRefreshToken';
  private readonly roleStorageKey = 'sweetlabUserRole';

  login(role: 'admin' | 'externo', username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiBaseUrl}/auth/login`, { role, username, password });
  }

  setSession(token: string, refreshToken: string, role: 'admin' | 'externo'): void {
    localStorage.setItem(this.tokenStorageKey, token);
    localStorage.setItem(this.refreshTokenStorageKey, refreshToken);
    localStorage.setItem(this.roleStorageKey, role);
  }

  clearSession(logoutOnServer = false): void {
    if (logoutOnServer) {
      const refreshToken = this.getStoredRefreshToken();
      if (refreshToken) {
        this.http.post(`${this.apiBaseUrl}/auth/logout`, { refreshToken }).subscribe({
          next: () => {
            // No-op
          },
          error: () => {
            // No-op: si falla igual limpiamos local.
          }
        });
      }
    }

    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.refreshTokenStorageKey);
    localStorage.removeItem(this.roleStorageKey);
  }

  getStoredToken(): string {
    return localStorage.getItem(this.tokenStorageKey) || '';
  }

  getStoredRefreshToken(): string {
    return localStorage.getItem(this.refreshTokenStorageKey) || '';
  }

  getStoredRole(): 'admin' | 'externo' | null {
    const role = localStorage.getItem(this.roleStorageKey);
    return role === 'admin' || role === 'externo' ? role : null;
  }

  private authOptions(): { headers: HttpHeaders } {
    const token = this.getStoredToken();
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    };
  }

  private refreshAccessToken(): Observable<LoginResponse> {
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No hay refresh token almacenado.'));
    }

    return this.http.post<LoginResponse>(`${this.apiBaseUrl}/auth/refresh`, { refreshToken });
  }

  private withAutoRefresh<T>(requestFactory: () => Observable<T>): Observable<T> {
    return requestFactory().pipe(
      catchError((error) => {
        if (error?.status !== 401) {
          return throwError(() => error);
        }

        return this.refreshAccessToken().pipe(
          switchMap((refreshResponse) => {
            this.setSession(refreshResponse.token, refreshResponse.refreshToken, refreshResponse.role);
            return requestFactory();
          }),
          catchError((refreshError) => {
            this.clearSession();
            return throwError(() => refreshError);
          })
        );
      })
    );
  }

  getRecipes(): Observable<Recipe[]> {
    return this.withAutoRefresh(() => this.http.get<Recipe[]>(this.apiUrl, this.authOptions()));
  }

  getRecipeById(id: string): Observable<Recipe> {
    return this.withAutoRefresh(() => this.http.get<Recipe>(`${this.apiUrl}/${id}`, this.authOptions()));
  }

  createRecipe(recipe: Omit<Recipe, 'id'>): Observable<Recipe> {
    return this.withAutoRefresh(() => this.http.post<Recipe>(this.apiUrl, recipe, this.authOptions()));
  }

  // Enviar JSON libre al endpoint raw (sin validaciones)
  createRawRecipe(raw: any): Observable<any> {
    return this.withAutoRefresh(() => this.http.post<any>(`${this.apiUrl}/raw`, raw, this.authOptions()));
  }

  updateRecipe(id: string, recipe: Partial<Recipe>): Observable<Recipe> {
    return this.withAutoRefresh(() => this.http.put<Recipe>(`${this.apiUrl}/${id}`, recipe, this.authOptions()));
  }

  deleteRecipe(id: string): Observable<{ message: string }> {
    return this.withAutoRefresh(() => this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, this.authOptions()));
  }
}