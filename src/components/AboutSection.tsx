import React from 'react';
import styles from './AboutSection.module.css';
import { COMPANY_INFO } from '../data/categories';
import { Check, Building2, ShieldCheck, MapPin, Truck } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className={styles.aboutSection}>
      <div className={styles.container}>
        <div className={styles.grid}>
          
          {/* Left Column: Story & Core Mission */}
          <div>
            <span className={styles.eyebrow}>О компании СНАБГИР (SNABGEAR)</span>
            <h2 className={styles.title}>
              О компании — Надежный B2B партнер комплексного снабжения предприятий
            </h2>
            <p className={styles.leadText}>
              Компания <strong>{COMPANY_INFO.name}</strong> (бренд <strong>{COMPANY_INFO.brandName}</strong>) специализируется на оптовых поставках профессионального инструмента, крепежа, спецодежды и промышленного оборудования для заводов, строительных трестов и монтажных организаций.
            </p>
            <p className={styles.bodyText}>
              Мы отказались от розничных наценок и сложной бюрократии. Наша цель — закрыть составную спецификацию заказчика в едином счете, организовать оперативную отгрузку и предоставить полный пакет закрывающих документов.
            </p>

            <div className={styles.highlightsList}>
              <div className={styles.highlightItem}>
                <Check size={18} className={styles.checkIcon} aria-hidden="true" />
                <span>Прямые договоры с производителями и официальными дистрибьюторами</span>
              </div>
              <div className={styles.highlightItem}>
                <Check size={18} className={styles.checkIcon} aria-hidden="true" />
                <span>Отсрочка платежа 14 дней для постоянных заказчиков (лимиты по согласованию)</span>
              </div>
              <div className={styles.highlightItem}>
                <Check size={18} className={styles.checkIcon} aria-hidden="true" />
                <span>Безналичный расчет строго с юридическими лицами (ООО, АО, ИП)</span>
              </div>
              <div className={styles.highlightItem}>
                <Check size={18} className={styles.checkIcon} aria-hidden="true" />
                <span>Электронный документооборот (Диадок, СБИС) в день отгрузки</span>
              </div>
            </div>
          </div>

          {/* Right Column: Verified Enterprise Card */}
          <aside className={styles.rightCard} aria-label="Карточка поставщика ООО СНАБГИР">
            <div className={styles.cardHeader}>
              <Building2 size={24} color="var(--color-primary)" aria-hidden="true" />
              <div className={styles.cardHeaderTitle}>Карточка поставщика</div>
            </div>

            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Организация:</span>
              <span className={styles.profileValue}>{COMPANY_INFO.name}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Торговая марка:</span>
              <span className={styles.profileValue}>{COMPANY_INFO.brandName}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>ИНН / КПП:</span>
              <span className={styles.profileValue}>{COMPANY_INFO.inn} / {COMPANY_INFO.kpp}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>ОГРН:</span>
              <span className={styles.profileValue}>{COMPANY_INFO.ogrn}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Регион деятельности:</span>
              <span className={styles.profileValue}>{COMPANY_INFO.location}</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Система налогообложения:</span>
              <span className={styles.profileValue}>ОСНО</span>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Телефон отдела снабжения:</span>
              <a href={`tel:${COMPANY_INFO.phoneClean}`} style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                {COMPANY_INFO.phone}
              </a>
            </div>
            <div className={styles.profileRow}>
              <span className={styles.profileLabel}>Электронная почта:</span>
              <a href={`mailto:${COMPANY_INFO.email}`} style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                {COMPANY_INFO.email}
              </a>
            </div>

            <div className={styles.cardFooter}>
              <strong>Оперативная логистика:</strong> Доставка по Смоленску и Смоленской области собственным автотранспортом компании в день готовности заказа.
            </div>
          </aside>

        </div>
      </div>
    </section>
  );
};
