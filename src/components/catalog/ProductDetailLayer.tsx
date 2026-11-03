import React, { useEffect, useState } from 'react';
import { Product } from '../../types/product';
import { useCart } from '../../context/CartContext';
import { GeneratorSvgPlaceholder } from './GeneratorSvgPlaceholder';
import { ArrowLeft, X, ShoppingCart, Check, Plus, Minus, ShieldCheck, Truck, Receipt } from 'lucide-react';
import styles from './ProductDetailLayer.module.css';

interface ProductDetailLayerProps {
  product: Product;
  onBackToCatalog: () => void;
  onCloseAll: () => void;
  onOpenCart: () => void;
}

export const ProductDetailLayer: React.FC<ProductDetailLayerProps> = ({
  product,
  onBackToCatalog,
  onCloseAll,
  onOpenCart,
}) => {
  const { getItemQuantity, addToCart, setExactQuantity } = useCart();
  const [imageError, setImageError] = useState<boolean>(false);
  const [localQty, setLocalQty] = useState<number>(1);

  const quantityInCart = getItemQuantity(product.sku);

  useEffect(() => {
    // Lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBackToCatalog();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onBackToCatalog]);

  const formattedPrice = new Intl.NumberFormat('ru-RU').format(product.price);

  const handleAddToCart = () => {
    addToCart(product, localQty);
  };

  const handleUpdateInCart = (delta: number) => {
    const next = quantityInCart + delta;
    setExactQuantity(product.sku, next);
  };

  // Helper to parse spec line into key / value
  const parseSpec = (raw: string) => {
    const colonIdx = raw.indexOf(':');
    if (colonIdx !== -1) {
      const key = raw.slice(0, colonIdx).trim();
      const val = raw.slice(colonIdx + 1).trim();
      return { key, val: val || 'Уточняйте у менеджера' };
    }
    return { key: raw, val: '' };
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onBackToCatalog();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
    >
      <div className={styles.modal}>
        {/* Top Header Bar */}
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={onBackToCatalog}
            aria-label="Вернуться в каталог TecEner"
          >
            <ArrowLeft size={16} />
            <span>Назад в каталог</span>
          </button>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onCloseAll}
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className={styles.scrollArea}>
          {/* Left: Product Media */}
          <div className={styles.imageSection}>
            <div className={styles.imageContainer}>
              {!product.image || imageError ? (
                <GeneratorSvgPlaceholder />
              ) : (
                <img
                  src={product.image}
                  alt={product.title}
                  className={styles.mainImage}
                  onError={() => setImageError(true)}
                />
              )}
            </div>

            <div className={styles.b2bPerks}>
              <div className={styles.perkItem}>
                <ShieldCheck size={16} color="#e52320" />
                <span>Официальная гарантия производителя TecEner</span>
              </div>
              <div className={styles.perkItem}>
                <Truck size={16} color="#e52320" />
                <span>Доставка по г. Смоленск и Смоленской области</span>
              </div>
              <div className={styles.perkItem}>
                <Receipt size={16} color="#e52320" />
                <span>Полный пакет закрывающих документов с НДС</span>
              </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase Actions */}
          <div className={styles.infoSection}>
            <div className={styles.metaRow}>
              <span className={styles.skuTag}>АРТИКУЛ: {product.sku}</span>
              {product.stock > 0 ? (
                <span className={`${styles.stockBadge} ${styles.inStock}`}>
                  ● В наличии на складе ({product.stock} шт.)
                </span>
              ) : (
                <span className={`${styles.stockBadge} ${styles.onOrder}`}>
                  ○ Под заказ (срок поставки 3–5 рабочих дней)
                </span>
              )}
            </div>

            <h2 id="product-detail-title" className={styles.title}>
              {product.title}
            </h2>

            {/* Price Box */}
            <div className={styles.priceCard}>
              <div>
                <div className={styles.priceLabel}>Рекомендованная цена (РРЦ)</div>
                <div className={styles.priceValue}>{formattedPrice} ₽</div>
              </div>
              <div className={styles.vatNotice}>
                Включая НДС. Для оптовых партий действует специальная система скидок.
              </div>
            </div>

            {/* Cart Actions */}
            {quantityInCart === 0 ? (
              <div className={styles.actionRow}>
                <div className={styles.quantityPicker}>
                  <button
                    type="button"
                    className={styles.pickerBtn}
                    onClick={() => setLocalQty((q) => Math.max(1, q - 1))}
                    aria-label="Уменьшить"
                  >
                    <Minus size={14} />
                  </button>
                  <span className={styles.pickerValue}>{localQty}</span>
                  <button
                    type="button"
                    className={styles.pickerBtn}
                    onClick={() => setLocalQty((q) => q + 1)}
                    aria-label="Увеличить"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  type="button"
                  className={styles.addToCartBtn}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart size={16} />
                  <span>Добавить в спецификацию</span>
                </button>
              </div>
            ) : (
              <div className={styles.actionRow}>
                <div className={styles.quantityPicker}>
                  <button
                    type="button"
                    className={styles.pickerBtn}
                    onClick={() => handleUpdateInCart(-1)}
                    aria-label="Уменьшить в корзине"
                  >
                    <Minus size={14} />
                  </button>
                  <span className={styles.pickerValue}>{quantityInCart}</span>
                  <button
                    type="button"
                    className={styles.pickerBtn}
                    onClick={() => handleUpdateInCart(1)}
                    aria-label="Увеличить в корзине"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  type="button"
                  className={`${styles.addToCartBtn} ${styles.inCartState}`}
                  onClick={onOpenCart}
                >
                  <Check size={16} color="#10B981" />
                  <span>В корзине ({quantityInCart} шт.) • Перейти</span>
                </button>
              </div>
            )}

            {/* Specifications */}
            <div className={styles.specsSection}>
              <h3 className={styles.specsHeading}>Технические характеристики</h3>
              {product.specs && product.specs.length > 0 ? (
                <div className={styles.specsTable}>
                  {product.specs.map((item, idx) => {
                    const parsed = parseSpec(item);
                    return (
                      <div key={idx} className={styles.specRow}>
                        <span className={styles.specKey}>{parsed.key}</span>
                        <span className={styles.specVal}>{parsed.val}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                  Подробные характеристики и паспорт изделия предоставляются по запросу.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
