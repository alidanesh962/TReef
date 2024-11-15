// src/components/inventory/EditingMP.tsx
import React, { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Item } from '../../types';
import { db } from '../../database';
import EditingTable from './EditingTable';
import BulkEditDialog from './BulkEditDialog';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';

interface FilterState {
  search: string;
  type: 'all' | 'products' | 'materials';
  department: string;
}

export default function EditingMP() {
  const [items, setItems] = useState<Item[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    department: ''
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadAllItems();
  }, []);

  const loadAllItems = () => {
    const products = db.getProducts().map(item => ({ ...item, type: 'product' as const }));
    const materials = db.getMaterials().map(item => ({ ...item, type: 'material' as const }));
    setItems([...products, ...materials]);
  };

  const handleSort = (key: keyof Item) => {
    const sortedItems = [...items].sort((a, b) => {
      const aValue = String(a[key] ?? '');
      const bValue = String(b[key] ?? '');
      return aValue.localeCompare(bValue);
    });
    setItems(sortedItems);
  };

  const handleFilter = () => {
    const products = db.getProducts().map(item => ({ ...item, type: 'product' as const }));
    const materials = db.getMaterials().map(item => ({ ...item, type: 'material' as const }));
    let filteredItems: Item[] = [...products, ...materials];

    if (filters.type !== 'all') {
      filteredItems = filteredItems.filter(item => 
        filters.type === 'products' ? item.type === 'product' : item.type === 'material'
      );
    }

    if (filters.department) {
      filteredItems = filteredItems.filter(item => 
        item.department.toLowerCase().includes(filters.department.toLowerCase())
      );
    }

    if (filters.search) {
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.code.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setItems(filteredItems);
  };

  useEffect(() => {
    handleFilter();
  }, [filters]); // Re-filter when filters change

  const handleBulkEdit = (changes: Partial<Item>) => {
    selectedItems.forEach(id => {
      const item = items.find(i => i.id === id);
      if (item) {
        const updatedItem = { ...item, ...changes };
        if (item.type === 'product') {
          db.updateProduct(updatedItem);
        } else {
          db.updateMaterial(updatedItem);
        }
      }
    });
    loadAllItems();
    setShowBulkEdit(false);
  };

  const handleBulkDelete = () => {
    selectedItems.forEach(id => {
      const item = items.find(i => i.id === id);
      if (item) {
        if (item.type === 'product') {
          db.deleteProduct(id);
        } else {
          db.deleteMaterial(id);
        }
      }
    });
    loadAllItems();
    setShowDeleteConfirm(false);
    setSelectedItems([]);
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            ویرایش کالا و متریال
          </h2>
          <div className="flex gap-2">
            {selectedItems.length > 0 && (
              <>
                <button
                  onClick={() => setShowBulkEdit(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg
                           hover:bg-blue-600 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  ویرایش گروهی ({selectedItems.length})
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg
                           hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف گروهی
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="جستجو..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value as FilterState['type'] })}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">همه</option>
            <option value="products">کالاها</option>
            <option value="materials">متریال‌ها</option>
          </select>

          <input
            type="text"
            placeholder="فیلتر بر اساس بخش..."
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Table Section */}
      <EditingTable
        items={items}
        selectedItems={selectedItems}
        onSelectItems={setSelectedItems}
        onSort={handleSort}
      />

      {/* Dialogs */}
      <BulkEditDialog
        isOpen={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        onConfirm={handleBulkEdit}
        selectedCount={selectedItems.length}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        itemName={`${selectedItems.length} مورد انتخاب شده`}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}