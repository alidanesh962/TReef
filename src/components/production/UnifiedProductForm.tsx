// src/components/production/UnifiedProductForm.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { db } from '../../database';
import { ProductDefinition, ProductRecipe, RecipeMaterial, Item } from '../../types';
import MaterialEntrySection from './sections/MaterialEntrySection';
import ExistingRecipesSection from './sections/ExistingRecipesSection';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';

interface UnifiedProductFormProps {
  product: ProductDefinition;
  onBack: () => void;
}

export default function UnifiedProductForm({ product, onBack }: UnifiedProductFormProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    code: product.code,
    saleDepartment: product.saleDepartment,
    productionSegment: product.productionSegment,
    recipeName: '',
    materials: [] as RecipeMaterial[],
    notes: ''
  });
  
  const [materials, setMaterials] = useState<Item[]>([]);
  const [recipes, setRecipes] = useState<ProductRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<ProductRecipe | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [product.id]);

  const loadData = () => {
    setMaterials(db.getMaterials());
    setRecipes(db.getProductRecipes(product.id));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.recipeName.trim()) {
      newErrors.recipeName = 'نام دستور پخت الزامی است';
    }

    if (formData.materials.length === 0) {
      newErrors.materials = 'حداقل یک ماده اولیه باید وارد شود';
    }

    formData.materials.forEach((material, index) => {
      if (!material.materialId) {
        newErrors[`material_${index}`] = 'انتخاب ماده اولیه الزامی است';
      }
      if (material.amount <= 0) {
        newErrors[`amount_${index}`] = 'مقدار باید بیشتر از صفر باشد';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveRecipe = () => {
    if (!validateForm()) return;

    const recipeData: Omit<ProductRecipe, 'id' | 'createdAt' | 'updatedAt'> = {
      productId: product.id,
      name: formData.recipeName,
      materials: formData.materials,
      notes: formData.notes || undefined
    };

    if (selectedRecipe) {
      db.updateProductRecipe({
        ...selectedRecipe,
        ...recipeData,
        updatedAt: Date.now()
      });
    } else {
      db.addProductRecipe(recipeData);
    }

    loadData();
    resetForm();
  };

  const resetForm = () => {
    setFormData(prev => ({
      ...prev,
      recipeName: '',
      materials: [],
      notes: ''
    }));
    setErrors({});
    setSelectedRecipe(null);
  };

  const handleEditRecipe = (recipe: ProductRecipe) => {
    setSelectedRecipe(recipe);
    setFormData(prev => ({
      ...prev,
      recipeName: recipe.name,
      materials: recipe.materials,
      notes: recipe.notes || ''
    }));
  };

  const handleDeleteRecipe = () => {
    if (selectedRecipe) {
      db.deleteProductRecipe(selectedRecipe.id);
      loadData();
      resetForm();
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Recipe Name Input */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            نام دستور پخت
          </label>
          <input
            type="text"
            value={formData.recipeName}
            onChange={(e) => setFormData(prev => ({ ...prev, recipeName: e.target.value }))}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.recipeName 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
            placeholder="نام دستور پخت را وارد کنید"
          />
          {errors.recipeName && (
            <p className="mt-1 text-sm text-red-500">{errors.recipeName}</p>
          )}
        </div>

        {/* Materials Section */}
        <MaterialEntrySection
          materials={formData.materials}
          availableMaterials={materials}
          errors={errors}
          onChange={(materials) => setFormData(prev => ({ ...prev, materials }))}
        />

        {/* Notes */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            توضیحات
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="توضیحات اضافی..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          {selectedRecipe && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                       transition-colors"
            >
              حذف دستور پخت
            </button>
          )}
          <button
            onClick={handleSaveRecipe}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg 
                     hover:bg-blue-600 transition-colors"
          >
            <Save className="h-4 w-4" />
            {selectedRecipe ? 'بروزرسانی دستور پخت' : 'ذخیره دستور پخت'}
          </button>
        </div>
      </div>

      {/* Existing Recipes */}
      {recipes.length > 0 && (
        <ExistingRecipesSection
          recipes={recipes}
          materials={materials}
          onEdit={handleEditRecipe}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        itemName={selectedRecipe?.name || ''}
        onConfirm={handleDeleteRecipe}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
