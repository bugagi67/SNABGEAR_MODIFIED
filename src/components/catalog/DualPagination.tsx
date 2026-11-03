import React from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import styles from './DualPagination.module.css';

interface DualPaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  displayedCount: number;
  onPageChange: (page: number) => void;
  onLoadMore: () => void;
  onScrollToTop: () => void;
}

export const DualPagination: React.FC<DualPaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  displayedCount,
  onPageChange,
  onLoadMore,
  onScrollToTop,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalItems === 0) return null;

  const hasMore = displayedCount < totalItems;

  const handlePageClick = (page: number) => {
    onPageChange(page);
    onScrollToTop();
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.countInfo}>
        Показано <span className={styles.countHighlight}>{displayedCount}</span> из{' '}
        <span className={styles.countHighlight}>{totalItems}</span> товаров TecEner
      </div>

      {hasMore && (
        <button
          type="button"
          className={styles.loadMoreBtn}
          onClick={onLoadMore}
        >
          <RefreshCw size={16} />
          <span>Показать ещё 12 товаров</span>
        </button>
      )}

      {totalPages > 1 && (
        <div className={styles.pagesList}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Предыдущая страница"
          >
            <ChevronLeft size={16} />
            <span>Назад</span>
          </button>

          {pages.map((p) => (
            <button
              key={p}
              type="button"
              className={`${styles.pageBtn} ${currentPage === p ? styles.activePage : ''}`}
              onClick={() => handlePageClick(p)}
              aria-current={currentPage === p ? 'page' : undefined}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            className={styles.navBtn}
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Следующая страница"
          >
            <span>Вперёд</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
