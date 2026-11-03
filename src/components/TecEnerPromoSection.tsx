import React from 'react';
import { GeneratorSvgPlaceholder } from './catalog/GeneratorSvgPlaceholder';
import { Zap, ShieldCheck, Flame, Cpu, Settings, ArrowRight, Gauge, CheckCircle } from 'lucide-react';
import styles from './TecEnerPromoSection.module.css';

interface TecEnerPromoSectionProps {
  onOpenCatalog: (category?: string) => void;
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

        {/* 5 Interactive Category Cards with URL filtering */}
        <div className={styles.categoriesGrid}>
          {/* 1. Инверторные */}
          <article
            className={styles.categoryCard}
            onClick={() => onOpenCatalog('inverter')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onOpenCatalog('inverter');
            }}
            aria-label="Открыть инверторные генераторы TecEner"
          >
            <div className={styles.catIconBox}>
              <Cpu size={22} />
            </div>
            <h3 className={styles.catTitle}>Инверторные генераторы</h3>
            <p className={styles.catText}>
              Идеальная синусоида для точной электроники, серверов и приборов. Сверхнизкий уровень шума, компактный вес.
            </p>
            <a
              href="?catalog=tecener&category=inverter"
              className={styles.catLink}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenCatalog('inverter');
              }}
            >
              Смотреть модели (15) <ArrowRight size={14} />
            </a>
          </article>

          {/* 2. Бензиновые */}
          <article
            className={styles.categoryCard}
            onClick={() => onOpenCatalog('gasoline')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onOpenCatalog('gasoline');
            }}
            aria-label="Открыть бензиновые генераторы TecEner"
          >
            <div className={styles.catIconBox}>
              <Gauge size={22} />
            </div>
            <h3 className={styles.catTitle}>Бензиновые генераторы</h3>
            <p className={styles.catText}>
              Выносливые рамные электростанции для стройплощадок, ремонтных бригад и производственных цехов.
            </p>
            <a
              href="?catalog=tecener&category=gasoline"
              className={styles.catLink}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenCatalog('gasoline');
              }}
            >
              Смотреть модели (35) <ArrowRight size={14} />
            </a>
          </article>

          {/* 3. Газовые */}
          <article
            className={styles.categoryCard}
            onClick={() => onOpenCatalog('gas')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onOpenCatalog('gas');
            }}
            aria-label="Открыть газовые генераторы TecEner"
          >
            <div className={styles.catIconBox}>
              <Flame size={22} />
            </div>
            <h3 className={styles.catTitle}>Газовые / Газ-бензин</h3>
            <p className={styles.catText}>
              Работа на сжиженном (LPG) и магистральном природном газе (NG). Минимальная стоимость вырабатываемого кВт⋅ч.
            </p>
            <a
              href="?catalog=tecener&category=gas"
              className={styles.catLink}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenCatalog('gas');
              }}
            >
              Смотреть модели (10) <ArrowRight size={14} />
            </a>
          </article>

          {/* 4. Дизельные */}
          <article
            className={styles.categoryCard}
            onClick={() => onOpenCatalog('diesel')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onOpenCatalog('diesel');
            }}
            aria-label="Открыть дизельные генераторы TecEner"
          >
            <div className={styles.catIconBox}>
              <Zap size={22} />
            </div>
            <h3 className={styles.catTitle}>Дизельные генераторы</h3>
            <p className={styles.catText}>
              Тяжелые силовые установки 230/400 В высокой надежности для резервного и основного электроснабжения.
            </p>
            <a
              href="?catalog=tecener&category=diesel"
              className={styles.catLink}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenCatalog('diesel');
              }}
            >
              Смотреть модели (3) <ArrowRight size={14} />
            </a>
          </article>

          {/* 5. АВР и комплектующие */}
          <article
            className={styles.categoryCard}
            onClick={() => onOpenCatalog('accessories')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onOpenCatalog('accessories');
            }}
            aria-label="Открыть АВР и комплектующие TecEner"
          >
            <div className={styles.catIconBox}>
              <Settings size={22} />
            </div>
            <h3 className={styles.catTitle}>АВР и комплектующие</h3>
            <p className={styles.catText}>
              Блоки автоматики ATS TecEner, кабели синхронизации, транспортировочные колеса и рукоятки.
            </p>
            <a
              href="?catalog=tecener&category=accessories"
              className={styles.catLink}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenCatalog('accessories');
              }}
            >
              Смотреть позиции (7) <ArrowRight size={14} />
            </a>
          </article>
        </div>
      </div>
    </section>
  );
};

