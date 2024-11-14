// src/components/production/MaterialRow.tsx
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Item, MaterialUnit, RecipeMaterial } from '../../types';

interface MaterialRowProps {
  material: RecipeMaterial;
  index: number;
  materials: Item[];
  units: MaterialUnit[];
  onChange: (index: number, updates: Partial<RecipeMaterial>) => void;
  onDelete: (index: number) => void;
  error?: string;
  showHeader?: boolean;
}

export const MaterialRow: React.FC<MaterialRowProps> = ({
  material,
  index,
  materials,
  units,
  onChange,
  onDelete,
  error,
  showHeader = false
}) => {
  const handleQuantityChange = (value: number) => {
    onChange(index, {
      amount: value,
      totalPrice: value * material.unitPrice
    });
  };

  const handleMaterialChange = (materialId: string) => {
    const selectedMaterial = materials.find(m => m.id === materialId);
    if (selectedMaterial) {
      onChange(index, {
        materialId,
        unitPrice: selectedMaterial.price,
        totalPrice: selectedMaterial.price * material.amount
      });
    }
  };

  return (
    <>
      {showHeader && (
        <div className="grid grid-cols-12 gap-4 mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          <div className="col-span-1"></div> {/* Space for delete button */}
          <div className="col-span-3 text-right">نام ماده اولیه</div>
          <div className="col-span-2 text-right">مقدار</div>
          <div className="col-span-2 text-center">واحد</div> {/* Increased column span */}
          <div className="col-span-2 text-left">قیمت واحد (ریال)</div>
          <div className="col-span-2 text-left">قیمت کل (ریال)</div> {/* Adjusted column span */}
        </div>
      )}

      <div className="grid grid-cols-12 gap-4 items-start">
        {/* Delete Button */}
        <div className="col-span-1 flex items-center justify-center">
          <button
            onClick={() => onDelete(index)}
            className="p-2 text-red-500 hover:text-red-600 transition-colors"
            title="حذف"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {/* Material Selection */}
        <div className="col-span-3">
          <select
            value={material.materialId}
            onChange={(e) => handleMaterialChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            style={{ direction: 'rtl' }}
          >
            <option value="">انتخاب ماده اولیه...</option>
            {materials.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div className="col-span-2">
          <input
            type="number"
            value={material.amount}
            onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-left"
            min="0"
            step="0.01"
            placeholder="مقدار"
            dir="ltr"
          />
        </div>

        {/* Unit Selection - Modified */}
        <div className="col-span-2"> {/* Increased column span */}
          <select
            value={material.unit}
            onChange={(e) => onChange(index, { unit: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            style={{ direction: 'ltr' }}
          >
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Unit Price Input */}
        <div className="col-span-2">
          <input
            type="text"
            value={material.unitPrice.toLocaleString()}
            onChange={(e) => {
              const value = parseFloat(e.target.value.replace(/,/g, '')) || 0;
              onChange(index, {
                unitPrice: value,
                totalPrice: value * material.amount
              });
            }}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-left"
            dir="ltr"
          />
        </div>

        {/* Total Price */}
        <div className="col-span-2"> {/* Adjusted column span */}
          <input
            type="text"
            value={material.totalPrice.toLocaleString()}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white text-left"
            readOnly
            dir="ltr"
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="col-span-12 text-sm text-red-500 mr-4">{error}</p>
        )}
      </div>
    </>
  );
};

export default MaterialRow;