// src/components/production/ProductDefinitionForm.tsx

import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { db } from '../../database';
import { Department, ProductDefinition } from '../../types';
import DepartmentDialog from './DepartmentDialog';

interface ProductDefinitionFormProps {
  onProductCreated: (product: Omit<ProductDefinition, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export default function ProductDefinitionForm({ onProductCreated }: ProductDefinitionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    saleDepartment: '',
    productionSegment: '',
  });

  const [saleDepartments, setSaleDepartments] = useState<Department[]>([]);
  const [productionSegments, setProductionSegments] = useState<Department[]>([]);
  const [showSaleDeptDialog, setShowSaleDeptDialog] = useState(false);
  const [showProdSegDialog, setShowProdSegDialog] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    console.log('ProductDefinitionForm mounted - Loading departments');
    loadDepartments();
  }, []);

  const loadDepartments = () => {
    try {
      const saleDepts = db.getDepartmentsByType('sale');
      const prodDepts = db.getDepartmentsByType('production');
      
      console.log('Loaded sale departments:', saleDepts);
      console.log('Loaded production departments:', prodDepts);
      
      setSaleDepartments(saleDepts);
      setProductionSegments(prodDepts);
    } catch (error) {
      console.error('Error loading departments:', error);
      setSubmitError('خطا در بارگیری اطلاعات بخش‌ها');
    }
  };

  const handleAddDepartment = (name: string, type: 'sale' | 'production') => {
    try {
      console.log(`Adding new ${type} department:`, name);
      const newDept = db.addDepartment(name, type);
      console.log('New department created:', newDept);
      
      loadDepartments(); // Reload all departments
      
      if (type === 'sale') {
        setFormData(prev => ({ ...prev, saleDepartment: newDept.id }));
        setShowSaleDeptDialog(false);
      } else {
        setFormData(prev => ({ ...prev, productionSegment: newDept.id }));
        setShowProdSegDialog(false);
      }
    } catch (error) {
      console.error(`Error adding ${type} department:`, error);
      setSubmitError(`خطا در ایجاد ${type === 'sale' ? 'واحد فروش' : 'واحد تولید'} جدید`);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'نام محصول الزامی است';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'کد محصول الزامی است';
    }
    
    if (!formData.saleDepartment) {
      newErrors.saleDepartment = 'انتخاب واحد فروش الزامی است';
    }
    
    if (!formData.productionSegment) {
      newErrors.productionSegment = 'انتخاب واحد تولید الزامی است';
    }

    // Check for duplicate code
    const existingProducts = db.getProductDefinitions();
    if (existingProducts.some(p => p.code === formData.code.trim())) {
      newErrors.code = 'این کد محصول قبلاً استفاده شده است';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>, type: 'sale' | 'production') => {
    const value = e.target.value;
    console.log(`${type} department changed to:`, value);
    
    if (value === 'new') {
      if (type === 'sale') {
        setShowSaleDeptDialog(true);
      } else {
        setShowProdSegDialog(true);
      }
    } else {
      if (type === 'sale') {
        setFormData(prev => ({ ...prev, saleDepartment: value }));
      } else {
        setFormData(prev => ({ ...prev, productionSegment: value }));
      }
    }
  };

  const handleSubmit = () => {
    setSubmitError(null); // Clear any previous submit errors
    
    try {
      if (!validate()) {
        console.log('Validation failed, errors:', errors);
        return;
      }

      console.log('Submitting product with data:', formData);
      
      onProductCreated({
        name: formData.name.trim(),
        code: formData.code.trim(),
        saleDepartment: formData.saleDepartment,
        productionSegment: formData.productionSegment,
      });

      // Reset form
      setFormData({
        name: '',
        code: '',
        saleDepartment: '',
        productionSegment: '',
      });
      
      setErrors({});
      console.log('Form submitted and reset successfully');
      
    } catch (error) {
      console.error('Error submitting product:', error);
      setSubmitError('خطا در ثبت محصول');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        تعریف محصول جدید
      </h2>

      {submitError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                     rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5" />
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            نام محصول
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.name 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            کد محصول
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.code 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-500">{errors.code}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            واحد فروش
          </label>
          <select
            value={formData.saleDepartment}
            onChange={(e) => handleDepartmentChange(e, 'sale')}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.saleDepartment 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
          >
            <option value="">انتخاب واحد فروش...</option>
            {saleDepartments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
            <option value="new">+ افزودن واحد فروش جدید</option>
          </select>
          {errors.saleDepartment && (
            <p className="mt-1 text-sm text-red-500">{errors.saleDepartment}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            واحد تولید
          </label>
          <select
            value={formData.productionSegment}
            onChange={(e) => handleDepartmentChange(e, 'production')}
            className={`w-full px-3 py-2 rounded-lg border ${
              errors.productionSegment 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            } bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white`}
          >
            <option value="">انتخاب واحد تولید...</option>
            {productionSegments.map(segment => (
              <option key={segment.id} value={segment.id}>{segment.name}</option>
            ))}
            <option value="new">+ افزودن واحد تولید جدید</option>
          </select>
          {errors.productionSegment && (
            <p className="mt-1 text-sm text-red-500">{errors.productionSegment}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                   transition-colors"
        >
          ایجاد محصول
        </button>
      </div>

      {/* Department Dialogs */}
      <DepartmentDialog
        isOpen={showSaleDeptDialog}
        type="sale"
        onClose={() => setShowSaleDeptDialog(false)}
        onConfirm={(name) => handleAddDepartment(name, 'sale')}
      />

      <DepartmentDialog
        isOpen={showProdSegDialog}
        type="production"
        onClose={() => setShowProdSegDialog(false)}
        onConfirm={(name) => handleAddDepartment(name, 'production')}
      />
    </div>
  );
}