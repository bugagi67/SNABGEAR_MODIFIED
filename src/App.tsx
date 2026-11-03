/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import styles from './App.module.css';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { CategoriesSection } from './components/CategoriesSection';
import { AdvantagesSection } from './components/AdvantagesSection';
import { LeadFormSection } from './components/LeadFormSection';
import { Footer } from './components/Footer';
import { TecEnerPromoSection } from './components/TecEnerPromoSection';
import { CatalogLayer } from './components/catalog/CatalogLayer';
import { ProductDetailLayer } from './components/catalog/ProductDetailLayer';
import { CartDrawer } from './components/catalog/CartDrawer';
import { CartProvider, useCart } from './context/CartContext';
import { FALLBACK_PRODUCTS } from './data/fallbackProducts';
import { Product } from './types/product';
import { FileUp, ShoppingBag } from 'lucide-react';

function AppContent() {
  const [selectedCategoryForForm, setSelectedCategoryForForm] = useState<string>('');
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { isCartOpen, setIsCartOpen, totalCount } = useCart();

  // Parse URL query parameters to synchronize overlay layers
  const syncFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const catalogParam = params.get('catalog');
    const productParam = params.get('product');

    if (catalogParam === 'tecener') {
      setIsCatalogOpen(true);
      if (productParam) {
        const found = FALLBACK_PRODUCTS.find((p) => p.sku === productParam);
        if (found) {
          setSelectedProduct(found);
        } else {
          setSelectedProduct(null);
        }
      } else {
        setSelectedProduct(null);
      }
    } else {
      setIsCatalogOpen(false);
      setSelectedProduct(null);
    }
  }, []);

  // Listen to popstate (browser back/forward) and initial load
  useEffect(() => {
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
    };
  }, [syncFromUrl]);

  // Open Catalog Layer and update URL
  const handleOpenCatalog = () => {
    const newUrl = `${window.location.pathname}?catalog=tecener`;
    window.history.pushState(null, '', newUrl);
    setIsCatalogOpen(true);
    setSelectedProduct(null);
  };

  // Close Catalog Layer and update URL
  const handleCloseCatalog = () => {
    window.history.pushState(null, '', window.location.pathname);
    setIsCatalogOpen(false);
    setSelectedProduct(null);
  };

  // Select Product Detail and update URL
  const handleSelectProduct = (product: Product) => {
    const newUrl = `${window.location.pathname}?catalog=tecener&product=${encodeURIComponent(product.sku)}`;
    window.history.pushState(null, '', newUrl);
    setSelectedProduct(product);
  };

  // Back from Product Detail to Catalog
  const handleBackToCatalog = () => {
    const newUrl = `${window.location.pathname}?catalog=tecener`;
    window.history.pushState(null, '', newUrl);
    setSelectedProduct(null);
  };

  const scrollToForm = () => {
    const el = document.getElementById('lead-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.appContainer}>
      {/* 1. Header (Sticky) */}
      <Header onScrollToForm={scrollToForm} />

      <main className={styles.mainContent}>
        {/* 2. Hero Section */}
        <Hero
          onScrollToForm={scrollToForm}
          onScrollToCatalog={scrollToCatalog}
        />

        {/* 3. О компании */}
        <AboutSection />

        {/* 4. Что мы поставляем (13 направлений) */}
        <CategoriesSection
          onSelectCategoryForForm={(catTitle) => setSelectedCategoryForForm(catTitle)}
          onScrollToForm={scrollToForm}
        />

        {/* 4.1. Генераторы и силовое оборудование TecEner (SEO-rich Promo & Entry Point) */}
        <TecEnerPromoSection onOpenCatalog={handleOpenCatalog} />

        {/* 5. Преимущества B2B (4 колонки) */}
        <AdvantagesSection />

        {/* 6. Lead Capture Form */}
        <LeadFormSection
          initialCategory={selectedCategoryForForm}
          onClearInitialCategory={() => setSelectedCategoryForForm('')}
        />
      </main>

      {/* 7. Footer */}
      <Footer onScrollToForm={scrollToForm} />

      {/* Floating CTA button for fast specification submission */}
      <button
        type="button"
        className={styles.floatingCta}
        onClick={scrollToForm}
        aria-label="Загрузить спецификацию"
      >
        <FileUp size={16} />
        <span>Загрузить спецификацию</span>
      </button>

      {/* Floating Cart Button when items are selected */}
      {totalCount > 0 && (
        <button
          type="button"
          className={styles.floatingCart}
          onClick={() => setIsCartOpen(true)}
          aria-label={`Корзина оборудования TecEner (${totalCount} поз.)`}
        >
          <ShoppingBag size={18} color="#e52320" />
          <span>Спецификация TecEner</span>
          <span className={styles.floatingCartBadge}>{totalCount}</span>
        </button>
      )}

      {/* Layer 1: TecEner Full Catalog Overlay */}
      {isCatalogOpen && (
        <CatalogLayer
          onClose={handleCloseCatalog}
          onSelectProduct={handleSelectProduct}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {/* Layer 2: Product Detail Overlay */}
      {selectedProduct && (
        <ProductDetailLayer
          product={selectedProduct}
          onBackToCatalog={handleBackToCatalog}
          onCloseAll={handleCloseCatalog}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {/* Layer 3: Cart & Checkout Drawer */}
      {isCartOpen && (
        <CartDrawer
          onClose={() => setIsCartOpen(false)}
          onContinueShopping={() => {
            setIsCartOpen(false);
            if (!isCatalogOpen) {
              handleOpenCatalog();
            }
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
