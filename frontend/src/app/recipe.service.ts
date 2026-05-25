import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Recipe } from './recipe.model';

export interface AuthResponse {
  token: string;
  refreshToken: string;
  role: 'admin';
  expiresIn: string;
}

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);
  private readonly isLocalDev = typeof window !== 'undefined' && window.location.port === '4200';
  private readonly apiBaseUrl = this.isLocalDev ? 'http://localhost:4000/api' : '/api';
  private readonly apiUrl = `${this.apiBaseUrl}/recipes`;
  private readonly tokenStorageKey = 'sweetlabAuthToken';
  private readonly refreshTokenStorageKey = 'sweetlabRefreshToken';
  private readonly roleStorageKey = 'sweetlabUserRole';
  private readonly usernameStorageKey = 'sweetlabUsername';

  setSession(token: string, refreshToken: string, role: 'admin', username?: string): void {
    localStorage.setItem(this.tokenStorageKey, token);
    localStorage.setItem(this.refreshTokenStorageKey, refreshToken);
    localStorage.setItem(this.roleStorageKey, role);
    const normalizedUsername = (username || '').trim();
    if (normalizedUsername) {
      localStorage.setItem(this.usernameStorageKey, normalizedUsername);
    }
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
    localStorage.removeItem(this.usernameStorageKey);
  }

  getStoredToken(): string {
    return localStorage.getItem(this.tokenStorageKey) || '';
  }

  getStoredRefreshToken(): string {
    return localStorage.getItem(this.refreshTokenStorageKey) || '';
  }

  getStoredRole(): 'admin' | null {
    const role = localStorage.getItem(this.roleStorageKey);
    return role === 'admin' ? role : null;
  }

  getStoredUsername(): string {
    return localStorage.getItem(this.usernameStorageKey) || '';
  }

  getStoredRoleFromToken(): 'admin' | null {
    const token = this.getStoredToken();
    if (!token) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const payload = JSON.parse(atob(paddedBase64));

      return payload?.role === 'admin' ? 'admin' : null;
    } catch {
      return null;
    }
  }

  getStoredUsernameFromToken(): string {
    const token = this.getStoredToken();
    if (!token) {
      return '';
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      return '';
    }

    try {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const payload = JSON.parse(atob(paddedBase64));

      return typeof payload?.username === 'string' ? payload.username : '';
    } catch {
      return '';
    }
  }

  private authOptions(): { headers: HttpHeaders } {
    const token = this.getStoredToken();
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    };
  }

  private refreshAccessToken(): Observable<AuthResponse> {
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No hay refresh token almacenado.'));
    }

    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/refresh`, { refreshToken });
  }

  registerAdmin(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/register`, { username, password });
  }

  loginAdmin(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/login`, { username, password });
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
    const token = this.getStoredToken();
    if (!token) {
      return this.http.get<Recipe[]>(this.apiUrl);
    }

    return this.withAutoRefresh(() => this.http.get<Recipe[]>(this.apiUrl, this.authOptions()));
  }

  getRecipeById(id: string): Observable<Recipe> {
    const token = this.getStoredToken();
    if (!token) {
      return this.http.get<Recipe>(`${this.apiUrl}/${id}`);
    }

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