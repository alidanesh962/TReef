import React from 'react';
import { Edit2, Clock } from 'lucide-react';
import { ProductRecipe, Item } from '../../../types';
import { db } from '../../../database';

interface ExistingRecipesSectionProps {
  recipes: ProductRecipe[];
  materials: Item[];
  onEdit: (recipe: ProductRecipe) => void;
}

export default function ExistingRecipesSection({
  recipes,
  materials,
  onEdit
}: ExistingRecipesSectionProps) {
  const units = db.getMaterialUnits();

  const getMaterialName = (materialId: string): string => {
    const material = materials.find(m => m.id === materialId);
    return material?.name || 'ماده حذف شده';
  };

  const getUnitName = (unitId: string): string => {
    const unit = units.find(u => u.id === unitId);
    return unit ? `${unit.symbol}` : '';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const calculateTotalCost = (recipe: ProductRecipe): number => {
    return recipe.materials.reduce((total, material) => total + material.totalPrice, 0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
        دستورهای پخت موجود
      </h3>

      <div className="space-y-6">
        {recipes.map(recipe => (
          <div
            key={recipe.id}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6
                     border border-gray-200/50 dark:border-gray-600/50"
          >
            {/* Recipe Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  {recipe.name}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>آخرین بروزرسانی: {formatDate(recipe.updatedAt)}</span>
                </div>
              </div>
              <button
                onClick={() => onEdit(recipe)}
                className="flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400
                         bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 
                         dark:hover:bg-blue-900/30 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                ویرایش
              </button>
            </div>

            {/* Materials Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-100 dark:bg-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-500 dark:text-gray-300">
                      ماده اولیه
                    </th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-300">
                      مقدار
                    </th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-300">
                      واحد
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                      قیمت واحد (ریال)
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                      قیمت کل (ریال)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
                  {recipe.materials.map((material, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                        {getMaterialName(material.materialId)}
                      </td>
                      <td className="px-4 py-2 text-center text-gray-800 dark:text-gray-200">
                        {material.amount}
                      </td>
                      <td className="px-4 py-2 text-center text-gray-800 dark:text-gray-200">
                        {getUnitName(material.unit)}
                      </td>
                      <td className="px-4 py-2 text-left text-gray-800 dark:text-gray-200" dir="ltr">
                        {material.unitPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-left text-gray-800 dark:text-gray-200" dir="ltr">
                        {material.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 dark:bg-gray-600 font-medium">
                    <td colSpan={4} className="px-4 py-2 text-left text-gray-800 dark:text-gray-200">
                      جمع کل:
                    </td>
                    <td className="px-4 py-2 text-left text-gray-800 dark:text-gray-200" dir="ltr">
                      {calculateTotalCost(recipe).toLocaleString()} ریال
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Recipe Notes */}
            {recipe.notes && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-600 rounded-lg">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  توضیحات:
                </h5>
                <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">
                  {recipe.notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}