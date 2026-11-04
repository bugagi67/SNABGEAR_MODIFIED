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
import { CatalogLayer, TecEnerCategory } from './components/catalog/CatalogLayer';
import { ProductDetailLayer } from './components/catalog/ProductDetailLayer';
import { CartDrawer } from './components/catalog/CartDrawer';
import { CartProvider, useCart } from './context/CartContext';
import { FALLBACK_PRODUCTS } from './data/fallbackProducts';
import { Product } from './types/product';
import { FileUp, ShoppingBag } from 'lucide-react';

const VALID_CATEGORIES: TecEnerCategory[] = [
  'all',
  'inverter',
  'gasoline',
  'gas',
  'diesel',
  'accessories',
];

function AppContent() {
  const [selectedCategoryForForm, setSelectedCategoryForForm] = useState<string>('');
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<TecEnerCategory>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { isCartOpen, setIsCartOpen, totalCount } = useCart();

  // Parse URL query parameters to synchronize overlay layers & category filter
  const syncFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const catalogParam = params.get('catalog');
    const categoryParam = params.get('category');
    const productParam = params.get('product');

    if (catalogParam === 'tecener') {
      setIsCatalogOpen(true);

      if (categoryParam && VALID_CATEGORIES.includes(categoryParam as TecEnerCategory)) {
        setActiveCategory(categoryParam as TecEnerCategory);
      } else {
        setActiveCategory('all');
      }

      if (productParam) {
        const found = FALLBACK_PRODUCTS.find((p) => p.sku === productParam);
        setSelectedProduct(found || null);
      } else {
        setSelectedProduct(null);
      }
    } else {
      setIsCatalogOpen(false);
      setSelectedProduct(null);
      setActiveCategory('all');
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

  // Open Catalog Layer with optional category filter and update URL
  const handleOpenCatalog = (category?: string) => {
    const cat: TecEnerCategory =
      category && VALID_CATEGORIES.includes(category as TecEnerCategory)
        ? (category as TecEnerCategory)
        : 'all';

    const newUrl =
      cat !== 'all'
        ? `${window.location.pathname}?catalog=tecener&category=${cat}`
        : `${window.location.pathname}?catalog=tecener`;

    window.history.pushState(null, '', newUrl);
    setActiveCategory(cat);
    setIsCatalogOpen(true);
    setSelectedProduct(null);
  };

  // Switch category filter inside the catalog and update URL
  const handleCategoryChange = (cat: TecEnerCategory) => {
    setActiveCategory(cat);
    const newUrl =
      cat !== 'all'
        ? `${window.location.pathname}?catalog=tecener&category=${cat}`
        : `${window.location.pathname}?catalog=tecener`;

    window.history.pushState(null, '', newUrl);
  };

  // Close Catalog Layer and reset URL
  const handleCloseCatalog = () => {
    window.history.pushState(null, '', window.location.pathname);
    setIsCatalogOpen(false);
    setSelectedProduct(null);
    setActiveCategory('all');
  };

  // Select Product Detail and update URL preserving active category
  const handleSelectProduct = (product: Product) => {
    const newUrl =
      activeCategory !== 'all'
        ? `${window.location.pathname}?catalog=tecener&category=${activeCategory}&product=${encodeURIComponent(product.sku)}`
        : `${window.location.pathname}?catalog=tecener&product=${encodeURIComponent(product.sku)}`;

    window.history.pushState(null, '', newUrl);
    setSelectedProduct(product);
  };

  // Back from Product Detail to Catalog preserving active category
  const handleBackToCatalog = () => {
    const newUrl =
      activeCategory !== 'all'
        ? `${window.location.pathname}?catalog=tecener&category=${activeCategory}`
        : `${window.location.pathname}?catalog=tecener`;

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
          onOpenCatalog={() => handleOpenCatalog()}
        />

        {/* 3. О компании */}
        <AboutSection />

        {/* 4. Что мы поставляем (13 направлений) */}
        <CategoriesSection
          onSelectCategoryForForm={(catTitle) => setSelectedCategoryForForm(catTitle)}
          onScrollToForm={scrollToForm}
        />

        {/* 4.1. Генераторы и силовое оборудование TecEner (SEO-rich Promo & Interactive Entry Point) */}
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

      {/* Layer 1: TecEner Full Catalog Overlay with pre-selected category */}
      {isCatalogOpen && (
        <CatalogLayer
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
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
              handleOpenCatalog(activeCategory);
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
