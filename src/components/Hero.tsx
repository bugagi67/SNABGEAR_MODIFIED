import React from 'react';
import styles from './Hero.module.css';
import { COMPANY_INFO } from '../data/categories';
import { FileUp, ArrowDown, Zap } from 'lucide-react';

interface HeroProps {
  onScrollToForm: () => void;
  onScrollToCatalog: () => void;
  onOpenCatalog?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToForm,
  onScrollToCatalog,
  onOpenCatalog,
}) => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroBackdrop} />

      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          
          {/* Top Industrial Badge */}
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            <span>Официальный B2B Поставщик · Работаем с юридическими лицами</span>
          </div>

          {/* H1 Heading with Company Name & Core B2B Supply Proposition */}
          <h1 className={styles.title}>
            СНАБГИР (SNABGEAR) — Комплексное снабжение предприятий и B2B поставки
          </h1>

          {/* Subtitle with commercial keys */}
          <p className={styles.subtitle}>
            Поставка промышленного оборудования, профессионального инструмента, оснастки и расходных материалов в Смоленске и Смоленской области для юридических лиц.
          </p>

          {/* Big Red Button + TecEner Catalog Button + Secondary Action */}
          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.primaryCtaBtn}
              onClick={onScrollToForm}
            >
              <FileUp size={22} />
              <span>Загрузить спецификацию для расчета</span>
            </button>

            <a
              href="?catalog=tecener"
              className={styles.tecEnerBtn}
              onClick={(e) => {
                e.preventDefault();
                if (onOpenCatalog) {
                  onOpenCatalog();
                } else {
                  window.location.search = '?catalog=tecener';
                }
              }}
              aria-label="Перейти в официальный каталог оборудования и генераторов TecEner"
            >
              <Zap size={18} className={styles.tecEnerZapIcon} />
              <span>КАТАЛОГ TecEner</span>
            </a>

            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={onScrollToCatalog}
            >
              <span>Посмотреть 13 направлений</span>
              <ArrowDown size={18} />
            </button>
          </div>

          {/* 4 Stats / USP Badges */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>
                <span>14 дней</span>
              </div>
              <div className={styles.statLabel}>
                Отсрочка платежа, лимиты по согласованию
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statValue}>
                <span className={styles.statAccent}>1 счет</span>
              </div>
              <div className={styles.statLabel}>
                Закрываем сложные сборные спецификации
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statValue}>
                <span>13</span>
              </div>
              <div className={styles.statLabel}>
                Профильных направлений снабжения MRO
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statValue}>
                <span className={styles.statAccent}>от 24ч</span>
              </div>
              <div className={styles.statLabel}>
                Срок комплектации и быстрая отгрузка
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
