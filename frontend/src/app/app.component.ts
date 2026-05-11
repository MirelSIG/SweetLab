import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Recipe } from './recipe.model';
import { RecipeService } from './recipe.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  recipes: Recipe[] = [];
  selectedRecipe?: Recipe;
  searchTerm = '';
  loading = false;
  errorMessage = '';
  userRole: 'admin' | 'externo' | null = null;
  loginUsername = '';
  loginPassword = '';

  constructor(private readonly recipeService: RecipeService) {}

  ngOnInit(): void {
    const storedToken = this.recipeService.getStoredToken();
    const storedRole = this.recipeService.getStoredRole();

    if (storedToken && storedRole) {
      this.userRole = storedRole;
      this.loadRecipes();
      return;
    }

    this.errorMessage = 'Ingresa usuario y contraseña para iniciar sesión o registrarte.';
  }

  get isAuthenticated(): boolean {
    return !!this.userRole;
  }

  get isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  loginAs(): void {
    if (!this.loginUsername.trim() || !this.loginPassword.trim()) {
      this.errorMessage = 'Ingresa usuario y contraseña para iniciar sesión.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.recipeService.login(this.loginUsername.trim(), this.loginPassword).subscribe({
      next: ({ token, refreshToken, role: loggedRole }) => {
        this.recipeService.setSession(token, refreshToken, loggedRole);
        this.userRole = loggedRole;
        this.successMessage = `Sesión iniciada como ${loggedRole}.`;
        this.loginUsername = '';
        this.loginPassword = '';
        this.loadRecipes();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al iniciar sesión:', error);
        this.loading = false;
        if (error.status === 401) {
          this.errorMessage = 'Usuario o contraseña incorrectos.';
        } else if (error.status === 429) {
          this.errorMessage = error.error?.message || 'Demasiados intentos fallidos. Intenta más tarde.';
        } else {
          this.errorMessage = 'No se pudo iniciar sesión. Verifica que el backend esté corriendo.';
        }
      }
    });
  }

  registerAs(): void {
    if (!this.loginUsername.trim() || !this.loginPassword.trim()) {
      this.errorMessage = 'Ingresa usuario y contraseña para registrarte.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.recipeService.register(this.loginUsername.trim(), this.loginPassword).subscribe({
      next: ({ token, refreshToken, role: regRole }) => {
        this.recipeService.setSession(token, refreshToken, regRole);
        this.userRole = regRole;
        this.successMessage = `Usuario registrado e ingresado como ${regRole}.`;
        this.loginUsername = '';
        this.loginPassword = '';
        this.loadRecipes();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al registrar:', error);
        this.loading = false;
        if (error.status === 409) {
          this.errorMessage = 'El nombre de usuario ya existe.';
        } else if (error.status === 403) {
          this.errorMessage = error.error?.message || 'Registro no permitido.';
        } else {
          this.errorMessage = 'No se pudo registrar. Verifica que el backend esté corriendo.';
        }
      }
    });
  }

  logout(): void {
    this.recipeService.clearSession(true);
    this.userRole = null;
    this.recipes = [];
    this.selectedRecipe = undefined;
    this.showJsonEditor = false;
    this.cancelEditing();
    this.loading = false;
    this.successMessage = 'Sesión cerrada.';
    this.errorMessage = 'Selecciona un rol para iniciar sesión: Admin o Usuario externo.';
    this.loginUsername = '';
    this.loginPassword = '';
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
        if (error.status === 401) {
          this.errorMessage = 'Tu sesión no es válida o expiró. Inicia sesión de nuevo.';
          this.recipeService.clearSession();
          this.userRole = null;
        } else {
          this.errorMessage = 'No se pudo conectar a la API. Verifica que el backend esté corriendo en http://localhost:4000';
        }
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

  // --- JSON libre (sin restricciones) ---
  showJsonEditor = false;
  rawJson = '{\n  "title": "Nueva receta libre",\n  "ingredients": ["ingrediente 1"],\n  "steps": ["paso 1"]\n}';
  submittingRaw = false;
  editorMode: 'form' | 'json' = 'form';

  // Formulario amigable (no requiere conocimientos de JSON)
  simpleTitle = '';
  simpleIngredients = '';
  simpleSteps = '';
  simpleTags = '';
  simplePrepTime = '';
  simpleDifficulty: '' | 'Fácil' | 'Media' | 'Alta' = '';
  successMessage = '';

  // Estado para edición de recetas
  editingRecipeId: string | null = null;
  editTitle = '';
  editIngredients = '';
  editSteps = '';
  editTags = '';
  editPrepTime = '';
  editDifficulty: '' | 'Fácil' | 'Media' | 'Alta' = '';
  submittingEdit = false;

  toggleJsonEditor(): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Solo el rol admin puede crear recetas.';
      return;
    }

    this.showJsonEditor = !this.showJsonEditor;
    this.successMessage = '';
    this.errorMessage = '';
    if (this.showJsonEditor) {
      this.loadDraft();
    }
  }

  // Guardado automático en localStorage
  private draftKey = 'simpleRecipeDraft';

  saveDraft(): void {
    const draft = {
      title: this.simpleTitle,
      ingredients: this.simpleIngredients,
      steps: this.simpleSteps,
      tags: this.simpleTags,
      prepTime: this.simplePrepTime,
      difficulty: this.simpleDifficulty,
      editorMode: this.editorMode
    };
    try {
      localStorage.setItem(this.draftKey, JSON.stringify(draft));
    } catch (e) {
      // ignore storage errors
    }
  }

  loadDraft(): void {
    try {
      const raw = localStorage.getItem(this.draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      this.simpleTitle = draft.title || '';
      this.simpleIngredients = draft.ingredients || '';
      this.simpleSteps = draft.steps || '';
      this.simpleTags = draft.tags || '';
      this.simplePrepTime = draft.prepTime || '';
      this.simpleDifficulty = draft.difficulty || '';
      this.editorMode = draft.editorMode || this.editorMode;
    } catch (e) {
      // ignore parse errors
    }
  }

  submitRawJson(): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Solo el rol admin puede crear recetas.';
      return;
    }

    let payload: any;
    try {
      payload = JSON.parse(this.rawJson);
    } catch (err) {
      this.errorMessage = 'JSON inválido. Corrige la sintaxis antes de enviar.';
      return;
    }

    this.submittingRaw = true;
    this.recipeService.createRawRecipe(payload).subscribe({
      next: (inserted) => {
        this.submittingRaw = false;
        this.errorMessage = '';
        this.showJsonEditor = false;
        // recargar lista
        this.loadRecipes();
        this.successMessage = 'Receta enviada correctamente.';
      },
      error: (err) => {
        console.error('Error al insertar JSON raw:', err);
        this.submittingRaw = false;
        this.errorMessage = 'Error al insertar la receta (ver consola).';
      }
    });
  }

  // Construye el objeto desde el formulario amigable y lo envía
  submitSimpleForm(): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Solo el rol admin puede crear recetas.';
      return;
    }

    if (!this.simpleTitle || this.simpleTitle.trim() === '') {
      this.errorMessage = 'El título es obligatorio.';
      return;
    }

    const ingredients = this.simpleIngredients
      .split(/\r?\n|,/) // acepta líneas o comas
      .map((s) => s.trim())
      .filter(Boolean);

    const steps = this.simpleSteps
      .split(/\r?\n/) // cada línea es un paso
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = this.simpleTags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: any = {
      title: this.simpleTitle.trim(),
      ingredients: ingredients.length ? ingredients : [''],
      steps: steps.length ? steps : [''],
    };

    if (tags.length) payload.tags = tags;
    if (this.simplePrepTime && Number(this.simplePrepTime) > 0) {
      payload.prepTime = Number(this.simplePrepTime);
    }
    if (this.simpleDifficulty) {
      payload.difficulty = this.simpleDifficulty;
    }

    this.submittingRaw = true;
    this.recipeService.createRawRecipe(payload).subscribe({
      next: () => {
        this.submittingRaw = false;
        this.errorMessage = '';
        this.successMessage = 'Receta creada correctamente.';
        this.showJsonEditor = false;
        this.resetSimpleForm();
        this.loadRecipes();
      },
      error: (err) => {
        console.error('Error al insertar receta simple:', err);
        this.submittingRaw = false;
        this.errorMessage = 'Error al insertar la receta (ver consola).';
      }
    });
  }

  resetSimpleForm(): void {
    this.simpleTitle = '';
    this.simpleIngredients = '';
    this.simpleSteps = '';
    this.simpleTags = '';
    this.simplePrepTime = '';
    this.simpleDifficulty = '';
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Métodos de edición
  startEditing(recipe: Recipe): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Solo el rol admin puede editar recetas.';
      return;
    }

    this.editingRecipeId = recipe._id || recipe.id || null;
    this.editTitle = recipe.title;
    this.editIngredients = recipe.ingredients.join('\n');
    this.editSteps = recipe.steps.join('\n');
    this.editTags = (recipe.tags || []).join(', ');
    this.editPrepTime = recipe.prepTime?.toString() || '';
    this.editDifficulty = recipe.difficulty || '';
    this.showJsonEditor = false;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEditing(): void {
    this.editingRecipeId = null;
    this.editTitle = '';
    this.editIngredients = '';
    this.editSteps = '';
    this.editTags = '';
    this.editPrepTime = '';
    this.editDifficulty = '';
  }

  submitEditForm(): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Solo el rol admin puede editar recetas.';
      return;
    }

    if (!this.editTitle || this.editTitle.trim() === '') {
      this.errorMessage = 'El título es obligatorio.';
      return;
    }

    if (!this.editingRecipeId) {
      this.errorMessage = 'ID de receta no encontrado.';
      return;
    }

    const ingredients = this.editIngredients
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);

    const steps = this.editSteps
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = this.editTags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: any = {
      title: this.editTitle.trim(),
      ingredients: ingredients.length ? ingredients : [''],
      steps: steps.length ? steps : [''],
    };

    if (tags.length) payload.tags = tags;
    if (this.editPrepTime && Number(this.editPrepTime) > 0) {
      payload.prepTime = Number(this.editPrepTime);
    }
    if (this.editDifficulty) {
      payload.difficulty = this.editDifficulty;
    }

    this.submittingEdit = true;
    this.recipeService.updateRecipe(this.editingRecipeId, payload).subscribe({
      next: () => {
        this.submittingEdit = false;
        this.errorMessage = '';
        this.successMessage = 'Receta actualizada correctamente.';
        this.cancelEditing();
        this.loadRecipes();
      },
      error: (err) => {
        console.error('Error al actualizar receta:', err);
        this.submittingEdit = false;
        if (err.status === 403) {
          this.errorMessage = 'Permiso denegado: solo admin puede actualizar recetas.';
        } else {
          this.errorMessage = 'Error al actualizar la receta (ver consola).';
        }
      }
    });
  }

  deleteRecipe(recipe: Recipe): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Solo el rol admin puede eliminar recetas.';
      return;
    }

    const recipeId = recipe._id || recipe.id;
    if (!recipeId) {
      this.errorMessage = 'ID de receta no encontrado.';
      return;
    }

    const confirm = window.confirm(
      `¿Estás seguro de que quieres eliminar "${recipe.title}"? Esta acción no se puede deshacer.`
    );

    if (!confirm) {
      return;
    }

    this.recipeService.deleteRecipe(recipeId).subscribe({
      next: () => {
        this.errorMessage = '';
        this.successMessage = `Receta "${recipe.title}" eliminada correctamente.`;
        if (this.selectedRecipe?._id === recipeId || this.selectedRecipe?.id === recipeId) {
          this.selectedRecipe = undefined;
        }
        this.loadRecipes();
      },
      error: (err) => {
        console.error('Error al eliminar receta:', err);
        if (err.status === 403) {
          this.errorMessage = 'Permiso denegado: solo admin puede eliminar recetas.';
        } else {
          this.errorMessage = 'Error al eliminar la receta (ver consola).';
        }
      }
    });
  }

  // Método auxiliar para verificar si una receta está siendo editada
  isEditingRecipe(recipe: Recipe): boolean {
    const recipeId = recipe._id || recipe.id;
    return this.editingRecipeId === recipeId;
  }
}