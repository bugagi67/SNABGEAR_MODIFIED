import React from 'react';
import styles from './AdvantagesSection.module.css';
import { Truck, ReceiptText, CalendarClock, GitCompareArrows } from 'lucide-react';

export const AdvantagesSection: React.FC = () => {
  const advantages = [
    {
      icon: <Truck size={28} />,
      title: 'Оперативная доставка',
      text: 'Быстрая комплектация и доставка заказов автотранспортом по Смоленску и Смоленской области напрямую до вашего объекта или производства.',
      badge: 'г. Смоленск и Смоленская обл.',
    },
    {
      icon: <ReceiptText size={28} />,
      title: 'Работаем с НДС 22%',
      text: 'Работаем с юридическими лицами и ИП по безналичному расчету с НДС 22%. Предоставляем полный комплект закрывающих документов (УПД) через ЭДО в день отгрузки.',
      badge: 'Выделенный НДС 22% · ЭДО',
    },
    {
      icon: <CalendarClock size={28} />,
      title: 'Отсрочка платежа 14 дней',
      text: 'Предоставляем отсрочку платежа на 14 дней для постоянных партнеров, производственных предприятий и строительно-монтажных организаций. Кредитные лимиты — по согласованию сторон.',
      badge: '14 дней · Лимиты по согласованию',
    },
    {
      icon: <GitCompareArrows size={28} />,
      title: 'Подбор аналогов по ТЗ',
      text: 'Инженерный отдел выполнит профессиональный подбор сертифицированных аналогов по вашим техническим требованиям без потери эксплуатационных характеристик и ресурса.',
      badge: '100% соответствие ГОСТ / DIN',
    },
  ];

  return (
    <section id="advantages" className={styles.section} aria-label="Преимущества B2B снабжения SNABGEAR">
      <div className={styles.container}>
        
        <div className={styles.headerRow}>
          <span className={styles.eyebrow}>Почему выбирают SNABGEAR</span>
          <h2 className={styles.title}>
            Преимущества B2B снабжения с СНАБГИР (SNABGEAR)
          </h2>
          <p className={styles.subtitle}>
            Мы строим долгосрочные партнерские отношения с закупщиками и главными инженерами предприятий, обеспечивая предсказуемость и надежность поставок инструмента, оборудования и оснастки.
          </p>
        </div>

        <div className={styles.grid}>
          {advantages.map((adv, index) => (
            <article key={index} className={styles.card} aria-label={adv.title}>
              <div className={styles.cardAccentLine} aria-hidden="true" />
              <div className={styles.iconBox} role="img" aria-label={adv.title}>
                {adv.icon}
              </div>
              <h3 className={styles.cardTitle}>{adv.title}</h3>
              <p className={styles.cardText}>{adv.text}</p>
              <span className={styles.cardBadge}>{adv.badge}</span>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
