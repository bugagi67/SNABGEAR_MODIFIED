import React, { useState } from 'react';
import styles from './CategoriesSection.module.css';
import { SUPPLY_CATEGORIES } from '../data/categories';
import {
  Disc,
  Zap,
  Scissors,
  ShieldAlert,
  Wrench,
  Layers,
  Sprout,
  Package,
  ThermometerSnowflake,
  Wind,
  Factory,
  FlaskConical,
  Flame,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

interface CategoriesSectionProps {
  onSelectCategoryForForm: (categoryTitle: string) => void;
  onScrollToForm: () => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  onSelectCategoryForForm,
  onScrollToForm,
}) => {
  // First category open by default so visitors see content right away
  const [openedTabs, setOpenedTabs] = useState<number[]>([1]);

  const toggleTab = (id: number) => {
    setOpenedTabs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const expandAll = () => {
    setOpenedTabs(SUPPLY_CATEGORIES.map((cat) => cat.id));
  };

  const collapseAll = () => {
    setOpenedTabs([]);
  };

  const renderIcon = (iconName: string, title: string) => {
    const props = { size: 22, 'aria-hidden': true };
    const getIconSvg = () => {
      switch (iconName) {
        case 'Disc':
          return <Disc {...props} />;
        case 'Zap':
          return <Zap {...props} />;
        case 'Scissors':
          return <Scissors {...props} />;
        case 'ShieldAlert':
          return <ShieldAlert {...props} />;
        case 'Wrench':
          return <Wrench {...props} />;
        case 'Layers':
          return <Layers {...props} />;
        case 'Sprout':
          return <Sprout {...props} />;
        case 'Package':
          return <Package {...props} />;
        case 'ThermometerSnowflake':
          return <ThermometerSnowflake {...props} />;
        case 'Wind':
          return <Wind {...props} />;
        case 'Factory':
          return <Factory {...props} />;
        case 'FlaskConical':
          return <FlaskConical {...props} />;
        case 'Flame':
          return <Flame {...props} />;
        default:
          return <Package {...props} />;
      }
    };

    return (
      <span role="img" aria-label={`Категория: ${title} — СНАБГИР`} style={{ display: 'inline-flex' }}>
        {getIconSvg()}
      </span>
    );
  };

  return (
    <section id="catalog" className={styles.section} aria-label="Каталог направлений промышленного снабжения">
      <div className={styles.container}>
        
        {/* Section Header */}
        <div className={styles.headerRow}>
          <span className={styles.eyebrow}>Номенклатура поставок</span>
          <h2 className={styles.title}>
            Что мы поставляем — Промышленное оборудование, инструмент и оснастка
          </h2>
          <p className={styles.subtitle}>
            13 ключевых направлений комплексного снабжения предприятий, цехов и строительных площадок в Смоленске и Смоленской области с гарантией соответствия ГОСТ и ТУ.
          </p>
        </div>

        {/* Toolbar with counter & expand/collapse actions */}
        <div className={styles.controlsRow}>
          <div className={styles.controlsInfo}>
            <Layers size={16} className={styles.controlsIcon} aria-hidden="true" />
            <span>13 направлений снабжения · Нажмите на карточку-таб для просмотра информации</span>
          </div>
          <div className={styles.controlsButtons}>
            <button
              type="button"
              className={styles.controlBtn}
              onClick={expandAll}
              title="Развернуть информацию по всем категориям"
            >
              Развернуть все
            </button>
            <button
              type="button"
              className={styles.controlBtn}
              onClick={collapseAll}
              title="Свернуть все категории в компактные табы"
            >
              Свернуть все
            </button>
          </div>
        </div>

        {/* 13 Interactive Category Tabs (Semantic articles with expandable content) */}
        <div className={styles.grid}>
          {SUPPLY_CATEGORIES.map((cat, index) => {
            const isOpen = openedTabs.includes(cat.id);
            const formattedIndex = index < 9 ? `0${index + 1}` : `${index + 1}`;

            return (
              <article
                key={cat.id}
                className={`${styles.card} ${isOpen ? styles.cardOpen : styles.cardCollapsed}`}
                aria-labelledby={`cat-title-${cat.id}`}
              >
                {/* Active accent indicator */}
                {isOpen && <div className={styles.cardActiveAccent} />}

                {/* Category sequence number */}
                <span className={styles.cardNumber}>
                  {formattedIndex}
                </span>

                {/* Clickable Tab Trigger Header */}
                <button
                  type="button"
                  className={styles.tabTrigger}
                  onClick={() => toggleTab(cat.id)}
                  aria-expanded={isOpen}
                  aria-controls={`cat-content-${cat.id}`}
                >
                  <div className={styles.iconWrapper}>
                    {renderIcon(cat.iconName, cat.title)}
                  </div>
                  <div className={styles.titleWrapper}>
                    <h3 id={`cat-title-${cat.id}`} className={styles.cardTitle}>
                      {cat.title}
                    </h3>
                    <span className={styles.tabActionText}>
                      {isOpen ? 'Скрыть информацию' : 'Открыть информацию'}
                    </span>
                  </div>
                  <div className={`${styles.chevronWrapper} ${isOpen ? styles.chevronOpen : ''}`}>
                    <ChevronDown size={18} aria-hidden="true" />
                  </div>
                </button>

                {/* Tab Expanded Content Body */}
                {isOpen && (
                  <div id={`cat-content-${cat.id}`} className={styles.cardBody}>
                    <p className={styles.cardDesc}>{cat.description}</p>

                    <div className={styles.examplesList} aria-label={`Позиции в категории ${cat.title}`}>
                      {cat.examples.map((ex, i) => (
                        <span key={i} className={styles.exampleTag}>
                          {ex}
                        </span>
                      ))}
                    </div>

                    <footer className={styles.cardFooter}>
                      <button
                        type="button"
                        className={styles.requestBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCategoryForForm(cat.title);
                          onScrollToForm();
                        }}
                        aria-label={`Запросить коммерческое предложение на ${cat.title}`}
                      >
                        <span>Запросить КП</span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </button>
                    </footer>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className={styles.bottomBanner}>
          <div>
            <div className={styles.bannerTitle}>
              Не нашли нужную позицию или типоразмер в списке?
            </div>
            <div className={styles.bannerSubtitle}>
              Отправьте вашу сводную спецификацию — инженерная служба SNABGEAR оперативно подберет позиции по ГОСТ и ТУ.
            </div>
          </div>

          <button
            type="button"
            className={styles.bannerBtn}
            onClick={onScrollToForm}
          >
            Прикрепить смету на расчет
          </button>
        </div>

      </div>
    </section>
  );
};
