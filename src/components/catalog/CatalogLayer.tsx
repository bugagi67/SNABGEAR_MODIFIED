import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Product } from '../../types/product';
import { FALLBACK_PRODUCTS } from '../../data/fallbackProducts';
import { useCart } from '../../context/CartContext';
import { ProductCard } from './ProductCard';
import { DualPagination } from './DualPagination';
import { ArrowLeft, X, ShoppingCart, Search, Zap } from 'lucide-react';
import styles from './CatalogLayer.module.css';

interface CatalogLayerProps {
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenCart: () => void;
}

type CategoryType = 'all' | 'inverter' | 'gas' | 'petrol' | 'diesel' | 'accessories';

const ITEMS_PER_PAGE = 12;

export const CatalogLayer: React.FC<CatalogLayerProps> = ({
  onClose,
  onSelectProduct,
  onOpenCart,
}) => {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const { totalCount, totalSum } = useCart();
  const catalogTopRef = useRef<HTMLDivElement>(null);

  // Silent daily update from /data/price.json
  useEffect(() => {
    let isMounted = true;
    fetch(`/data/price.json?t=${Date.now()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Cannot load price.json');
        return res.json();
      })
      .then((data: Product[]) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(() => {
        // Fallback already active, silently proceed
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Lock body scroll
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Stock filter
      if (onlyInStock && p.stock <= 0) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchSku = p.sku.toLowerCase().includes(query);
        if (!matchTitle && !matchSku) return false;
      }

      // Category tab filter
      const t = p.title.toLowerCase();
      if (activeCategory === 'inverter') {
        return t.includes('инвертор');
      }
      if (activeCategory === 'gas') {
        return t.includes('газов');
      }
      if (activeCategory === 'petrol') {
        return t.includes('бензин') && !t.includes('инвертор');
      }
      if (activeCategory === 'diesel') {
        return t.includes('дизель');
      }
      if (activeCategory === 'accessories') {
        return (
          t.includes('авр') ||
          t.includes('кабель') ||
          t.includes('блок') ||
          t.includes('комплект') ||
          t.includes('колес')
        );
      }

      return true;
    });
  }, [products, onlyInStock, searchQuery, activeCategory]);

  // Reset pagination when category, search, or stock toggles
  useEffect(() => {
    setCurrentPage(1);
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeCategory, searchQuery, onlyInStock]);

  // Calculate items to show:
  // If user used "Load more", we show up to `visibleCount`.
  // If user navigated to a specific page, we show that specific slice.
  const displayedProducts = useMemo(() => {
    // If on page 1, slice up to visibleCount (supports Load More)
    if (currentPage === 1) {
      return filteredProducts.slice(0, visibleCount);
    }
    // If on page > 1, slice that specific page
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage, visibleCount]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const scrollToCatalogTop = () => {
    if (catalogTopRef.current) {
      catalogTopRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formattedTotalSum = new Intl.NumberFormat('ru-RU').format(totalSum);

  // Tab counts
  const categoryCounts = useMemo(() => {
    const counts = {
      all: products.length,
      inverter: 0,
      gas: 0,
      petrol: 0,
      diesel: 0,
      accessories: 0,
    };
    products.forEach((p) => {
      const t = p.title.toLowerCase();
      if (t.includes('инвертор')) counts.inverter++;
      else if (t.includes('газов')) counts.gas++;
      else if (t.includes('бензин')) counts.petrol++;
      else if (t.includes('дизель')) counts.diesel++;
      if (
        t.includes('авр') ||
        t.includes('кабель') ||
        t.includes('блок') ||
        t.includes('комплект') ||
        t.includes('колес')
      ) {
        counts.accessories++;
      }
    });
    return counts;
  }, [products]);

  return (
    <div className={styles.layer} role="dialog" aria-modal="true" aria-label="Каталог TecEner">
      {/* Sticky Top Header */}
      <header className={styles.topBar} ref={catalogTopRef}>
        <div className={styles.topBarContainer}>
          <div className={styles.brandGroup}>
            <button
              type="button"
              className={styles.backHomeBtn}
              onClick={onClose}
              aria-label="Вернуться на главную"
            >
              <ArrowLeft size={16} />
              <span>На главную</span>
            </button>

            <div className={styles.brandTitles}>
              <h1 className={styles.brandHeading}>
                TECENER <span style={{ color: '#e52320' }}>СИЛОВАЯ ТЕХНИКА</span>
              </h1>
              <span className={styles.brandTagline}>
                Официальный каталог оборудования и генераторов · СНАБГИР Смоленск
              </span>
            </div>
          </div>

          <div className={styles.topBarActions}>
            <button
              type="button"
              className={styles.cartBtn}
              onClick={onOpenCart}
              aria-label="Открыть корзину"
            >
              <ShoppingCart size={16} />
              <span>Корзина</span>
              {totalCount > 0 ? (
                <>
                  <span className={styles.cartBadge}>{totalCount}</span>
                  <span style={{ fontSize: '12px', opacity: 0.9 }}>{formattedTotalSum} ₽</span>
                </>
              ) : null}
            </button>

            <button
              type="button"
              className={styles.closeIconBtn}
              onClick={onClose}
              aria-label="Закрыть каталог"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className={styles.contentWrapper}>
        {/* Filters & Search */}
        <section className={styles.filterSection} aria-label="Фильтры каталога">
          <div className={styles.filterControlsRow}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Поиск по модели, мощности или артикулу (напр. 1112031)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <label className={styles.stockFilter}>
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                style={{ accentColor: '#e52320', width: 16, height: 16 }}
              />
              <span>Только в наличии на складе</span>
            </label>
          </div>

          {/* Category Tabs */}
          <div className={styles.categoryTabs} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'all'}
              className={`${styles.categoryTab} ${activeCategory === 'all' ? styles.activeTab : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              Все модели <span className={styles.tabCount}>({categoryCounts.all})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'inverter'}
              className={`${styles.categoryTab} ${activeCategory === 'inverter' ? styles.activeTab : ''}`}
              onClick={() => setActiveCategory('inverter')}
            >
              Инверторные <span className={styles.tabCount}>({categoryCounts.inverter})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'gas'}
              className={`${styles.categoryTab} ${activeCategory === 'gas' ? styles.activeTab : ''}`}
              onClick={() => setActiveCategory('gas')}
            >
              Газовые <span className={styles.tabCount}>({categoryCounts.gas})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'petrol'}
              className={`${styles.categoryTab} ${activeCategory === 'petrol' ? styles.activeTab : ''}`}
              onClick={() => setActiveCategory('petrol')}
            >
              Бензиновые <span className={styles.tabCount}>({categoryCounts.petrol})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'diesel'}
              className={`${styles.categoryTab} ${activeCategory === 'diesel' ? styles.activeTab : ''}`}
              onClick={() => setActiveCategory('diesel')}
            >
              Дизельные <span className={styles.tabCount}>({categoryCounts.diesel})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'accessories'}
              className={`${styles.categoryTab} ${activeCategory === 'accessories' ? styles.activeTab : ''}`}
              onClick={() => setActiveCategory('accessories')}
            >
              АВР и аксессуары <span className={styles.tabCount}>({categoryCounts.accessories})</span>
            </button>
          </div>
        </section>

        {/* Product Grid */}
        {displayedProducts.length > 0 ? (
          <div className={styles.grid}>
            {displayedProducts.map((p) => (
              <ProductCard
                key={p.sku}
                product={p}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyResults}>
            <Zap size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h3 className={styles.emptyResultsTitle}>По вашему запросу ничего не найдено</h3>
            <p style={{ fontSize: '13px' }}>
              Попробуйте изменить поисковую фразу или сбросить активные фильтры.
            </p>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setOnlyInStock(false);
              }}
            >
              Сбросить фильтры
            </button>
          </div>
        )}

        {/* Dual Pagination */}
        <DualPagination
          totalItems={filteredProducts.length}
          itemsPerPage={ITEMS_PER_PAGE}
          currentPage={currentPage}
          displayedCount={displayedProducts.length}
          onPageChange={handlePageChange}
          onLoadMore={handleLoadMore}
          onScrollToTop={scrollToCatalogTop}
        />
      </main>
    </div>
  );
};
