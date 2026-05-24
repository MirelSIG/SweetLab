import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  // Map of fallback images loaded from frontend assets (id/title -> imageUrl)
  assetImageMap: Record<string, string> = {};
  selectedRecipe?: Recipe;
  searchTerm = '';
  loading = false;
  errorMessage = '';
  userRole: 'admin' | null = null;

  showJsonEditor = false;
  rawJson = '{\n  "title": "Nueva receta libre",\n  "ingredients": ["ingrediente 1"],\n  "steps": ["paso 1"]\n}';
  submittingRaw = false;
  editorMode: 'form' | 'json' = 'form';

  simpleTitle = '';
  simpleIngredients = '';
  simpleSteps = '';
  simpleTags = '';
  simplePrepTime = '';
  simpleDifficulty: '' | 'Fácil' | 'Media' | 'Alta' = '';
  simpleImagePath = '';
  simpleImagePreview = '';
  simpleImageFileName = '';
  successMessage = '';

  editingRecipeId: string | null = null;
  editTitle = '';
  editIngredients = '';
  editSteps = '';
  editTags = '';
  editPrepTime = '';
  editDifficulty: '' | 'Fácil' | 'Media' | 'Alta' = '';
  editImagePath = '';
  editImagePreview = '';
  editImageFileName = '';
  submittingEdit = false;

  private readonly draftKey = 'simpleRecipeDraft';

  constructor(private readonly recipeService: RecipeService) {}

  ngOnInit(): void {
    const storedToken = this.recipeService.getStoredToken();
    const storedRole = this.recipeService.getStoredRole();

    if (storedToken && storedRole) {
      this.userRole = storedRole;
      // Load local asset images first so we can fallback when API recipes don't include images
      this.loadAssetImages().finally(() => this.loadRecipes());
      return;
    }

    // Load asset images for public view even when not authenticated
    this.loadAssetImages().finally(() => this.loadRecipes());
  }

  get isAuthenticated(): boolean {
    return !!this.userRole;
  }

  get isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  private loadRecipes(): void {
    this.loading = true;
    this.recipeService.getRecipes().subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.selectedRecipe = this.selectedRecipe || recipes[0];
        this.loading = false;
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('Error al cargar recetas:', error);
        if (error.status === 401) {
          this.errorMessage = 'No tienes permisos para editar recetas.';
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

  getRecipeImage(recipe: Recipe): string {
    const fromRecipe = (recipe.imageUrl || '').trim();
    if (fromRecipe) return fromRecipe;

    // Try by id -> title (lowercased) fallbacks from assets
    const maybeId = (recipe.id || recipe._id || '').toString();
    if (maybeId && this.assetImageMap[maybeId]) return this.assetImageMap[maybeId];

    const titleKey = (recipe.title || '').toString().toLowerCase();
    if (titleKey && this.assetImageMap[titleKey]) return this.assetImageMap[titleKey];

    // Final fallback: empty string so template shows the placeholder
    return '';
  }

  private async loadAssetImages(): Promise<void> {
    try {
      const resp = await fetch('assets/recipes.json');
      if (!resp.ok) return;
      const data: any[] = await resp.json();
      data.forEach((item) => {
        if (!item) return;
        if (item.id) this.assetImageMap[item.id] = item.imageUrl || '';
        if (item.title) this.assetImageMap[item.title.toString().toLowerCase()] = item.imageUrl || '';
      });
    } catch (err) {
      // ignore - fallback to API-only behavior
      console.warn('No se pudieron cargar las imágenes de assets:', err);
    }
  }

  getCreateRecipeImage(): string {
    return (this.simpleImagePreview || this.simpleImagePath || '').trim();
  }

  getEditRecipeImage(): string {
    return (this.editImagePreview || this.editImagePath || '').trim();
  }

  private readImageFile(file: File, target: 'create' | 'edit'): void {
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Selecciona un archivo de imagen válido.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';

      if (!result) {
        this.errorMessage = 'No se pudo leer la imagen seleccionada.';
        return;
      }

      if (target === 'create') {
        this.simpleImagePreview = result;
        this.simpleImageFileName = file.name;
      } else {
        this.editImagePreview = result;
        this.editImageFileName = file.name;
      }

      this.errorMessage = '';
    };

    reader.onerror = () => {
      this.errorMessage = 'No se pudo cargar la imagen seleccionada.';
    };

    reader.readAsDataURL(file);
  }

  onSimpleImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.readImageFile(file, 'create');
    input.value = '';
  }

  onEditImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.readImageFile(file, 'edit');
    input.value = '';
  }

  clearSimpleImage(): void {
    this.simpleImagePath = '';
    this.simpleImagePreview = '';
    this.simpleImageFileName = '';
  }

  clearEditImage(): void {
    this.editImagePath = '';
    this.editImagePreview = '';
    this.editImageFileName = '';
  }

  // Guardado automático en localStorage
  saveDraft(): void {
    const draft = {
      title: this.simpleTitle,
      ingredients: this.simpleIngredients,
      steps: this.simpleSteps,
      tags: this.simpleTags,
      prepTime: this.simplePrepTime,
      imagePath: this.simpleImagePath,
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
      this.simpleImagePath = draft.imagePath || '';
      this.simpleDifficulty = draft.difficulty || '';
      this.editorMode = draft.editorMode || this.editorMode;
      this.simpleImagePreview = '';
      this.simpleImageFileName = '';
    } catch (e) {
      // ignore parse errors
    }
  }

  toggleJsonEditor(): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Solo el admin puede crear recetas.';
      return;
    }

    this.showJsonEditor = !this.showJsonEditor;
    this.successMessage = '';
    this.errorMessage = '';
    if (this.showJsonEditor) {
      this.loadDraft();
    } else {
      this.clearSimpleImage();
    }
  }

  submitRawJson(): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Solo el admin puede crear recetas.';
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
      next: () => {
        this.submittingRaw = false;
        this.errorMessage = '';
        this.showJsonEditor = false;
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
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);

    const steps = this.simpleSteps
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = this.simpleTags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: any = {
      title: this.simpleTitle.trim(),
      ingredients: ingredients.length ? ingredients : [''],
      steps: steps.length ? steps : ['']
    };

    if (tags.length) payload.tags = tags;
    const createImage = this.getCreateRecipeImage();
    if (createImage) {
      payload.imageUrl = createImage;
    }
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
    this.clearSimpleImage();
    this.successMessage = '';
    this.errorMessage = '';
  }

  startEditing(recipe: Recipe): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Solo el admin puede editar recetas.';
      return;
    }

    this.editingRecipeId = recipe._id || recipe.id || null;
    this.editTitle = recipe.title;
    this.editIngredients = recipe.ingredients.join('\n');
    this.editSteps = recipe.steps.join('\n');
    this.editTags = (recipe.tags || []).join(', ');
    this.editPrepTime = recipe.prepTime?.toString() || '';
    this.editDifficulty = recipe.difficulty || '';
    this.editImagePath = recipe.imageUrl || '';
    this.editImagePreview = '';
    this.editImageFileName = '';
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
    this.clearEditImage();
    this.submittingEdit = false;
  }

  submitEditForm(): void {
    if (!this.isAdmin) {
      this.errorMessage = 'Solo el admin puede editar recetas.';
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
      steps: steps.length ? steps : ['']
    };

    if (tags.length) payload.tags = tags;
    const editImage = this.getEditRecipeImage();
    if (editImage) {
      payload.imageUrl = editImage;
    }
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
      this.errorMessage = 'Solo el admin puede eliminar recetas.';
      return;
    }

    const recipeId = recipe._id || recipe.id;
    if (!recipeId) {
      this.errorMessage = 'ID de receta no encontrado.';
      return;
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar "${recipe.title}"? Esta acción no se puede deshacer.`
    );

    if (!confirmDelete) {
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

  isEditingRecipe(recipe: Recipe): boolean {
    const recipeId = recipe._id || recipe.id;
    return this.editingRecipeId === recipeId;
  }
}