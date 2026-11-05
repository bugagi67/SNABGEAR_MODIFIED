import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Product } from '../../types/product';
import { FALLBACK_PRODUCTS } from '../../data/fallbackProducts';
import { useCart } from '../../context/CartContext';
import { ProductCard } from './ProductCard';
import { DualPagination } from './DualPagination';
import { ArrowLeft, X, ShoppingCart, Search, Zap } from 'lucide-react';
import styles from './CatalogLayer.module.css';

export type TecEnerCategory = 'all' | 'inverter' | 'gasoline' | 'gas' | 'diesel' | 'accessories';

interface CatalogLayerProps {
  activeCategory: TecEnerCategory;
  onCategoryChange: (category: TecEnerCategory) => void;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenCart: () => void;
}

const ITEMS_PER_PAGE = 12;

export const CatalogLayer: React.FC<CatalogLayerProps> = ({
  activeCategory,
  onCategoryChange,
  onClose,
  onSelectProduct,
  onOpenCart,
}) => {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const { totalCount, totalSum } = useCart();
  const catalogTopRef = useRef<HTMLDivElement>(null);

  // Silent daily update from /data/price.json
  useEffect(() => {
    let isMounted = true;

    fetch(`${import.meta.env.BASE_URL}data/price.json?t=${Date.now()}`)
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
        // FALLBACK_PRODUCTS уже активен, поэтому молча продолжаем
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

  // Filtering based on exact title rules
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Stock filter
      if (onlyInStock && p.stock <= 0) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchSku = p.sku.toLowerCase().includes(query);
        if (!matchTitle && !matchSku) return false;
      }

      // Accurate Category filter rules
      const t = p.title.toLowerCase();
      if (activeCategory === 'inverter') {
        return t.includes('инверторн');
      }
      if (activeCategory === 'gasoline') {
        return t.includes('бензин');
      }
      if (activeCategory === 'gas') {
        return t.includes('газ');
      }
      if (activeCategory === 'diesel') {
        return t.includes('дизельн');
      }
      if (activeCategory === 'accessories') {
        return (
          t.includes('блок') ||
          t.includes('кабель') ||
          t.includes('колёса') ||
          t.includes('колеса')
        );
      }

      return true; // 'all'
    });
  }, [products, onlyInStock, searchQuery, activeCategory]);

  // Reset pagination when category, search, or stock toggles
  useEffect(() => {
    setCurrentPage(1);
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeCategory, searchQuery, onlyInStock]);

  const displayedProducts = useMemo(() => {
    if (currentPage === 1) {
      return filteredProducts.slice(0, visibleCount);
    }
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

  // Accurate category counts
  const categoryCounts = useMemo(() => {
    const counts = {
      all: products.length,
      inverter: 0,
      gasoline: 0,
      gas: 0,
      diesel: 0,
      accessories: 0,
    };
    products.forEach((p) => {
      const t = p.title.toLowerCase();
      if (t.includes('инверторн')) counts.inverter++;
      if (t.includes('бензин')) counts.gasoline++;
      if (t.includes('газ')) counts.gas++;
      if (t.includes('дизельн')) counts.diesel++;
      if (
        t.includes('блок') ||
        t.includes('кабель') ||
        t.includes('колёса') ||
        t.includes('колеса')
      ) {
        counts.accessories++;
      }
    });
    return counts;
  }, [products]);

  const categoriesList: { id: TecEnerCategory; label: string; count: number }[] = [
    { id: 'all', label: 'Все товары', count: categoryCounts.all },
    { id: 'inverter', label: 'Инверторные', count: categoryCounts.inverter },
    { id: 'gasoline', label: 'Бензиновые', count: categoryCounts.gasoline },
    { id: 'gas', label: 'Газовые / Газ-бензин', count: categoryCounts.gas },
    { id: 'diesel', label: 'Дизельные', count: categoryCounts.diesel },
    { id: 'accessories', label: 'АВР и комплектующие', count: categoryCounts.accessories },
  ];

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

          {/* Category Tabs inside Filter Panel */}
          <div className={styles.categoryTabs} role="tablist" aria-label="Фильтр по категориям">
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat.id}
                className={`${styles.categoryTab} ${activeCategory === cat.id ? styles.activeTab : ''}`}
                onClick={() => onCategoryChange(cat.id)}
              >
                <span>{cat.label}</span>
                <span className={styles.tabCount}>({cat.count})</span>
              </button>
            ))}
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
            <h3 className={styles.emptyResultsTitle}>В данной категории ничего не найдено</h3>
            <p style={{ fontSize: '13px' }}>
              Попробуйте изменить поисковую фразу или выбрать другую категорию генераторов.
            </p>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={() => {
                setSearchQuery('');
                onCategoryChange('all');
                setOnlyInStock(false);
              }}
            >
              Показать все товары TecEner
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
