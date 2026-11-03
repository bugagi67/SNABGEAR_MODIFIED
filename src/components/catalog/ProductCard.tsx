import React, { useState } from 'react';
import { Product } from '../../types/product';
import { useCart } from '../../context/CartContext';
import { GeneratorSvgPlaceholder } from './GeneratorSvgPlaceholder';
import { ShoppingCart, Check, Plus, Minus } from 'lucide-react';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { getItemQuantity, addToCart, updateQuantity } = useCart();
  const [imageError, setImageError] = useState<boolean>(false);

  const quantityInCart = getItemQuantity(product.sku);

  const formattedPrice = new Intl.NumberFormat('ru-RU').format(product.price);

  const handleCardClick = () => {
    onSelect(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.sku, -1);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(product.sku, 1);
  };

  // Preview first 2 specs
  const previewSpecs = product.specs.filter(Boolean).slice(0, 2);

  return (
    <article
      className={styles.card}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`${product.title}, цена ${formattedPrice} руб.`}
    >
      <div className={styles.cardHeader}>
        <span className={styles.sku}>АРТ. {product.sku}</span>
        {product.stock > 0 ? (
          <span className={`${styles.stockBadge} ${styles.inStock}`}>
            ● В наличии {product.stock} шт.
          </span>
        ) : (
          <span className={`${styles.stockBadge} ${styles.onOrder}`}>
            Под заказ
          </span>
        )}
      </div>

      <div className={styles.imageWrapper}>
        {!product.image || imageError ? (
          <GeneratorSvgPlaceholder />
        ) : (
          <img
            src={product.image}
            alt={product.title}
            className={styles.productImage}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title} title={product.title}>
          {product.title}
        </h3>

        <div className={styles.specsPreview}>
          {previewSpecs.map((spec, idx) => (
            <div key={idx} className={styles.specItem}>
              {spec}
            </div>
          ))}
          {product.specs.length > 2 && (
            <div className={styles.specItem}>
              + ещё {product.specs.length - 2} характеристик
            </div>
          )}
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.priceBlock}>
          <span className={styles.priceLabel}>РРЦ с НДС</span>
          <span className={styles.priceValue}>{formattedPrice} ₽</span>
        </div>

        {quantityInCart === 0 ? (
          <button
            type="button"
            className={styles.cartButton}
            onClick={handleAddToCart}
            aria-label={`Добавить в корзину: ${product.title}`}
          >
            <ShoppingCart size={15} />
            <span>В корзину</span>
          </button>
        ) : (
          <div className={styles.quantityControl} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.qtyBtn}
              onClick={handleDecrease}
              aria-label="Уменьшить количество"
            >
              <Minus size={13} />
            </button>
            <span className={styles.qtyValue}>{quantityInCart}</span>
            <button
              type="button"
              className={styles.qtyBtn}
              onClick={handleIncrease}
              aria-label="Увеличить количество"
            >
              <Plus size={13} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
};
