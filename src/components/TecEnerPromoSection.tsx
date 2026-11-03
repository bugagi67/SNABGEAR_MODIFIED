import React from 'react';
import { GeneratorSvgPlaceholder } from './catalog/GeneratorSvgPlaceholder';
import { Zap, ShieldCheck, Flame, Cpu, Settings, ArrowRight, Gauge, CheckCircle } from 'lucide-react';
import styles from './TecEnerPromoSection.module.css';

interface TecEnerPromoSectionProps {
  onOpenCatalog: () => void;
}

export const TecEnerPromoSection: React.FC<TecEnerPromoSectionProps> = ({ onOpenCatalog }) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onOpenCatalog();
  };

  return (
    <section id="tecener-power" className={styles.section} aria-labelledby="tecener-heading">
      <div className={styles.container}>
        {/* Header Block */}
        <header className={styles.headerRow}>
          <div className={styles.titleArea}>
            <div className={styles.badge}>
              <Zap size={13} />
              <span>Официальные B2B-поставки силового оборудования</span>
            </div>
            <h2 id="tecener-heading" className={styles.mainHeading}>
              Генераторы и силовое оборудование <span className={styles.brandRed}>TecEner</span>
            </h2>
            <p className={styles.subHeading}>
              Надежное энергоснабжение строительных объектов, промышленных площадок, складов и коммерческой инфраструктуры. 
              Комплексные поставки с НДС по Смоленску и Смоленской области с официальной гарантией завода.
            </p>
          </div>

          <div className={styles.headerCta}>
            <a
              href="?catalog=tecener"
              onClick={handleLinkClick}
              className={styles.ctaButton}
              aria-label="Перейти в каталог оборудования TecEner"
            >
              <span>Перейти в каталог TecEner</span>
              <ArrowRight size={18} />
            </a>
          </div>
        </header>

        {/* Feature Hero Banner */}
        <article className={styles.bannerCard}>
          <div className={styles.bannerContent}>
            <span className={styles.bannerTag}>МОДЕЛЬНЫЙ РЯД 2026 ГОДА</span>
            <h3 className={styles.bannerTitle}>
              Инверторные, газовые, бензиновые и дизельные электростанции TecEner
            </h3>
            <p className={styles.bannerText}>
              Компания «СНАБГИР» обеспечивает прямые поставки сертифицированного оборудования TecEner:
              от компактных малошумных цифровых инверторов для чувствительной электроники до тяжелых 
              дизельных генераторов промышленного класса с системами автоматического ввода резерва (АВР).
            </p>

            <div className={styles.specsList}>
              <div className={styles.specRow}>
                <CheckCircle size={16} className={styles.specIcon} />
                <span>Экономичный расход топлива и чистый синус</span>
              </div>
              <div className={styles.specRow}>
                <CheckCircle size={16} className={styles.specIcon} />
                <span>Блоки автоматики АВР и параллельного подключения</span>
              </div>
              <div className={styles.specRow}>
                <CheckCircle size={16} className={styles.specIcon} />
                <span>Гарантия производителя и наличие запчастей</span>
              </div>
              <div className={styles.specRow}>
                <CheckCircle size={16} className={styles.specIcon} />
                <span>Фиксированные РРЦ и оптовые скидки с НДС</span>
              </div>
            </div>

            <div>
              <a
                href="?catalog=tecener"
                onClick={handleLinkClick}
                className={styles.ctaButton}
              >
                <span>Открыть полный прайс-лист (47 моделей)</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Visual Showcase */}
          <div className={styles.bannerVisual}>
            <div className={styles.visualFrame}>
              <GeneratorSvgPlaceholder width="100%" height={180} />
              <div className={styles.quickStatsRow}>
                <div className={styles.statItem}>
                  <span className={styles.statNum}>47</span>
                  <span className={styles.statLabel}>Позиций в каталоге</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNum}>до 15 кВт</span>
                  <span className={styles.statLabel}>Диапазон мощности</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNum}>230/400 В</span>
                  <span className={styles.statLabel}>Напряжение</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* 4 Category Highlights */}
        <div className={styles.categoriesGrid}>
          <article
            className={styles.categoryCard}
            onClick={onOpenCatalog}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onOpenCatalog();
            }}
          >
            <div className={styles.catIconBox}>
              <Cpu size={22} />
            </div>
            <h3 className={styles.catTitle}>Инверторные генераторы</h3>
            <p className={styles.catText}>
              Идеальная синусоида для точной электроники, серверов и измерительных приборов. Сверхнизкий уровень шума и вес от 12 кг.
            </p>
            <span className={styles.catLink}>
              Смотреть модели <ArrowRight size={14} />
            </span>
          </article>

          <article
            className={styles.categoryCard}
            onClick={onOpenCatalog}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onOpenCatalog();
            }}
          >
            <div className={styles.catIconBox}>
              <Flame size={22} />
            </div>
            <h3 className={styles.catTitle}>Газовые электростанции</h3>
            <p className={styles.catText}>
              Работа на сжиженном (LPG) и магистральном природном газе (NG). Минимальная стоимость вырабатываемого киловатт-часа.
            </p>
            <span className={styles.catLink}>
              Смотреть модели <ArrowRight size={14} />
            </span>
          </article>

          <article
            className={styles.categoryCard}
            onClick={onOpenCatalog}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onOpenCatalog();
            }}
          >
            <div className={styles.catIconBox}>
              <Gauge size={22} />
            </div>
            <h3 className={styles.catTitle}>Бензиновые и дизельные</h3>
            <p className={styles.catText}>
              Выносливые рамные генераторы для стройплощадок, ремонтных бригад и производственных цехов с медной обмоткой альтернатора.
            </p>
            <span className={styles.catLink}>
              Смотреть модели <ArrowRight size={14} />
            </span>
          </article>

          <article
            className={styles.categoryCard}
            onClick={onOpenCatalog}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onOpenCatalog();
            }}
          >
            <div className={styles.catIconBox}>
              <Settings size={22} />
            </div>
            <h3 className={styles.catTitle}>Блоки автоматики АВР</h3>
            <p className={styles.catText}>
              Блоки автоматического ввода резерва ATS TecEner, кабели синхронизации, транспортировочные комплекты и расходные материалы.
            </p>
            <span className={styles.catLink}>
              Смотреть модели <ArrowRight size={14} />
            </span>
          </article>
        </div>
      </div>
    </section>
  );
};
