import React from 'react';
import styles from './Footer.module.css';
import { COMPANY_INFO } from '../data/categories';
import { Logo } from './Logo';
import { MapPin, Phone, Mail, Clock, ArrowUp, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onScrollToForm: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToForm }) => {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="contacts" className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          
          {/* Brand & Requisites */}
          <div className={styles.brandCol}>
            <Logo width={220} height={48} theme="dark" />
            <p className={styles.brandDescription}>
              Комплексное материально-техническое обеспечение производственных и строительных предприятий. Профессиональный инструмент, оборудование и крепеж.
            </p>

            <div className={styles.requisitesBox}>
              <div className={styles.reqLine}>
                <span>Организация:</span>
                <span>{COMPANY_INFO.name}</span>
              </div>
              <div className={styles.reqLine}>
                <span>ИНН:</span>
                <span>{COMPANY_INFO.inn}</span>
              </div>
              <div className={styles.reqLine}>
                <span>КПП:</span>
                <span>{COMPANY_INFO.kpp}</span>
              </div>
              <div className={styles.reqLine}>
                <span>ОГРН:</span>
                <span>{COMPANY_INFO.ogrn}</span>
              </div>
              <div className={styles.reqLine}>
                <span>Система налогообложения:</span>
                <span>ОСНО</span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <nav aria-label="Быстрая навигация по сайту">
            <div className={styles.colTitle}>Навигация</div>
            <ul className={styles.linksList}>
              <li>
                <a
                  href="#about"
                  className={styles.link}
                  onClick={(e) => handleNavClick(e, 'about')}
                >
                  О компании
                </a>
              </li>
              <li>
                <a
                  href="#catalog"
                  className={styles.link}
                  onClick={(e) => handleNavClick(e, 'catalog')}
                >
                  Что мы поставляем (13 направлений)
                </a>
              </li>
              <li>
                <a
                  href="#advantages"
                  className={styles.link}
                  onClick={(e) => handleNavClick(e, 'advantages')}
                >
                  Преимущества для B2B
                </a>
              </li>
              <li>
                <a
                  href="#lead-form"
                  className={styles.link}
                  onClick={(e) => handleNavClick(e, 'lead-form')}
                >
                  Отправить спецификацию на расчет
                </a>
              </li>
            </ul>
          </nav>

          {/* Contacts & Location */}
          <address style={{ fontStyle: 'normal' }} aria-label="Контакты ООО СНАБГИР">
            <div className={styles.colTitle}>Контакты</div>
            <div className={styles.contactsList}>
              <div className={styles.contactItem}>
                <MapPin size={20} className={styles.contactIcon} aria-hidden="true" />
                <div>
                  <div className={styles.contactLabel}>Регион поставок:</div>
                  <div className={styles.contactValue}>{COMPANY_INFO.location}</div>
                </div>
              </div>

              <div className={styles.contactItem}>
                <Phone size={20} className={styles.contactIcon} aria-hidden="true" />
                <div>
                  <div className={styles.contactLabel}>Отдел продаж и снабжения:</div>
                  <a href={`tel:${COMPANY_INFO.phoneClean}`} className={styles.contactPhone}>
                    {COMPANY_INFO.phone}
                  </a>
                </div>
              </div>

              <div className={styles.contactItem}>
                <Mail size={20} className={styles.contactIcon} aria-hidden="true" />
                <div>
                  <div className={styles.contactLabel}>Прием заявок и смет:</div>
                  <a href={`mailto:${COMPANY_INFO.email}`} className={styles.contactValue}>
                    {COMPANY_INFO.email}
                  </a>
                </div>
              </div>

              <div className={styles.contactItem}>
                <Clock size={20} className={styles.contactIcon} aria-hidden="true" />
                <div>
                  <div className={styles.contactLabel}>Режим работы:</div>
                  <div className={styles.contactValue}>{COMPANY_INFO.workHours}</div>
                </div>
              </div>
            </div>
          </address>

        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div>
            © {new Date().getFullYear()} {COMPANY_INFO.name}. Все права защищены.
          </div>

          <div className={styles.vatNotice}>
            Работаем только с юридическими лицами и ИП по безналичному расчету.
          </div>

          <button
            type="button"
            className={styles.scrollTopBtn}
            onClick={handleScrollTop}
          >
            <span>Наверх</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
};
