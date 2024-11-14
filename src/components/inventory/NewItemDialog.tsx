import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface NewItemDialogProps {
  isOpen: boolean;
  type: 'product' | 'material';
  onClose: () => void;
  onConfirm: (item: { name: string; code: string; department: string; price: number }) => void;
  departments: string[];
}

export default function NewItemDialog({
  isOpen,
  type,
  onClose,
  onConfirm,
  departments
}: NewItemDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: departments[0] || '',
    price: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'نام الزامی است';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'کد الزامی است';
    }
    if (!formData.department) {
      newErrors.department = 'انتخاب بخش الزامی است';
    }
    if (formData.price <= 0) {
      newErrors.price = 'قیمت باید بزرگتر از صفر باشد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      if (!validate()) {
        return;
      }

      onConfirm(formData);
      setFormData({
        name: '',
        code: '',
        department: departments[0] || '',
        price: 0
      });
    } catch (error) {
      console.error('Error adding item:', error);
      setErrors({ submit: 'خطا در ثبت اطلاعات' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {type === 'product' ? 'افزودن کالای جدید' : 'افزودن متریال جدید'}
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              نام
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                       disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={type === 'product' ? 'نام کالا' : 'نام متریال'}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              کد
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                       disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="کد محصول"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-500">{errors.code}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              بخش
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.department && (
              <p className="mt-1 text-sm text-red-500">{errors.department}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              قیمت (ریال)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              disabled={isSubmitting}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                       bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                       disabled:opacity-50 disabled:cursor-not-allowed"
              min="0"
              step="1000"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          {errors.submit && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin">⌛</span>
                  در حال ثبت...
                </>
              ) : (
                'تایید'
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              انصراف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}