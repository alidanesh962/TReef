import React from 'react';
import { Plus } from 'lucide-react';
import { RecipeMaterial, Item } from '../../../types';
import { db } from '../../../database';

interface MaterialEntrySectionProps {
  materials: RecipeMaterial[];
  availableMaterials: Item[];
  errors: Record<string, string>;
  onChange: (materials: RecipeMaterial[]) => void;
}

export default function MaterialEntrySection({
  materials,
  availableMaterials,
  errors,
  onChange
}: MaterialEntrySectionProps) {
  const units = db.getMaterialUnits();

  const handleAddMaterial = () => {
    if (availableMaterials.length === 0) return;

    const firstMaterial = availableMaterials[0];
    const newMaterial: RecipeMaterial = {
      materialId: firstMaterial.id,
      unit: units[0]?.id || '',
      amount: 0,
      unitPrice: firstMaterial.price,
      totalPrice: 0
    };

    onChange([...materials, newMaterial]);
  };

  const handleRemoveMaterial = (index: number) => {
    onChange(materials.filter((_, i) => i !== index));
  };

  const handleMaterialChange = (index: number, updates: Partial<RecipeMaterial>) => {
    const updatedMaterials = [...materials];
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      ...updates
    };

    // Recalculate total price if amount or unit price changed
    if ('amount' in updates || 'unitPrice' in updates) {
      const material = updatedMaterials[index];
      updatedMaterials[index].totalPrice = material.amount * material.unitPrice;
    }

    onChange(updatedMaterials);
  };

  const calculateTotalPrice = () => {
    return materials.reduce((total, material) => total + material.totalPrice, 0);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold text-gray-800 dark:text-white">
          مواد اولیه
        </div>
        <button
          onClick={handleAddMaterial}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 
                   text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          افزودن ماده اولیه
        </button>
      </div>

      {errors.materials && (
        <p className="mb-4 text-sm text-red-500">{errors.materials}</p>
      )}

      {/* Material Entries Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="p-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                نام ماده اولیه
              </th>
              <th className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                مقدار
              </th>
              <th className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                واحد
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                قیمت واحد (ریال)
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                قیمت کل (ریال)
              </th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {materials.map((material, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-3">
                  <select
                    value={material.materialId}
                    onChange={(e) => {
                      const selectedMaterial = availableMaterials.find(m => m.id === e.target.value);
                      if (selectedMaterial) {
                        handleMaterialChange(index, {
                          materialId: e.target.value,
                          unitPrice: selectedMaterial.price,
                          totalPrice: selectedMaterial.price * material.amount
                        });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">انتخاب ماده اولیه...</option>
                    {availableMaterials.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  {errors[`material_${index}`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`material_${index}`]}</p>
                  )}
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    value={material.amount}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || 0;
                      handleMaterialChange(index, {
                        amount,
                        totalPrice: amount * material.unitPrice
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                    min="0"
                    step="0.01"
                  />
                  {errors[`amount_${index}`] && (
                    <p className="mt-1 text-sm text-red-500">{errors[`amount_${index}`]}</p>
                  )}
                </td>
                <td className="p-3">
                  <select
                    value={material.unit}
                    onChange={(e) => handleMaterialChange(index, { unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                  >
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <input
                    type="text"
                    value={material.unitPrice.toLocaleString()}
                    onChange={(e) => {
                      const price = parseFloat(e.target.value.replace(/,/g, '')) || 0;
                      handleMaterialChange(index, {
                        unitPrice: price,
                        totalPrice: price * material.amount
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                             bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-left"
                    dir="ltr"
                  />
                </td>
                <td className="p-3">
                  <div className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-600 
                               text-gray-900 dark:text-white text-left"
                       dir="ltr"
                  >
                    {material.totalPrice.toLocaleString()}
                  </div>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleRemoveMaterial(index)}
                    className="p-2 text-red-500 hover:text-red-600 transition-colors rounded-lg
                             hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {materials.length > 0 && (
            <tfoot className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <td colSpan={4} className="p-3 text-left font-medium">
                  جمع کل:
                </td>
                <td className="p-3">
                  <div className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 
                               text-blue-600 dark:text-blue-400 text-left font-medium"
                       dir="ltr"
                  >
                    {calculateTotalPrice().toLocaleString()} ریال
                  </div>
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
