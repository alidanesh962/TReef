// src/pages/UnifiedProductionPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, BookOpen, ArrowRight } from 'lucide-react';
import { getCurrentUser, clearCurrentUser } from '../utils/auth';
import { db } from '../database';
import { ProductDefinition } from '../types';
import UnifiedProductForm from '../components/production/UnifiedProductForm';
import DarkModeToggle from '../components/layout/DarkModeToggle';
import BackButton from '../components/layout/BackButton';
import LogoutConfirmDialog from '../components/common/LogoutConfirmDialog';
import ProductsList from '../components/production/ProductsList';

export default function UnifiedProductionPage() {
  const navigate = useNavigate();
  const [currentUser] = useState(getCurrentUser());
  const [selectedProduct, setSelectedProduct] = useState<ProductDefinition | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Initialize default departments if none exist
    const saleDepts = db.getDepartmentsByType('sale');
    const prodDepts = db.getDepartmentsByType('production');
    
    if (saleDepts.length === 0) {
      db.addDepartment('فروش عمومی', 'sale');
    }
    
    if (prodDepts.length === 0) {
      db.addDepartment('تولید عمومی', 'production');
    }
  }, [currentUser, navigate]);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    clearCurrentUser();
    setShowLogoutDialog(false);
    navigate('/login');
  };

  const handleProductSelect = (product: ProductDefinition) => {
    setSelectedProduct(product);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white mr-4">
                {selectedProduct ? selectedProduct.name : 'مدیریت محصولات'}
              </h1>
              {selectedProduct && (
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300
                           hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ArrowRight className="h-5 w-5" />
                  بازگشت به لیست
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-gray-300">
                {currentUser?.username}
              </span>
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg
                         bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
                خروج
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedProduct ? (
          <UnifiedProductForm 
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
          />
        ) : (
          <ProductsList 
            onProductSelect={handleProductSelect}
            key={refreshTrigger}
          />
        )}
      </main>

      {/* Fixed Elements */}
      <DarkModeToggle />
      <BackButton />

      {/* Logout Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutDialog(false)}
        username={currentUser?.username}
      />
    </div>
  );
}