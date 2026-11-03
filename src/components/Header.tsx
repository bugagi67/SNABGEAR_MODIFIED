import React, { useState } from 'react';
import styles from './Header.module.css';
import { COMPANY_INFO } from '../data/categories';
import { Logo } from './Logo';
import { MapPin, Phone, Menu, X, ArrowRight } from 'lucide-react';

interface HeaderProps {
  onScrollToForm: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onScrollToForm }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        
        {/* Brand Logo Component with light theme */}
        <Logo width={205} height={44} theme="light" className={styles.logoLink} />

        {/* Desktop Navigation */}
        <nav className={styles.nav} aria-label="Главное меню сайта">
          <a
            href="#about"
            className={styles.navLink}
            onClick={(e) => handleNavClick(e, 'about')}
          >
            О компании
          </a>
          <a
            href="#catalog"
            className={styles.navLink}
            onClick={(e) => handleNavClick(e, 'catalog')}
          >
            Направления
          </a>
          <a
            href="#advantages"
            className={styles.navLink}
            onClick={(e) => handleNavClick(e, 'advantages')}
          >
            Преимущества
          </a>
          <a
            href="#contacts"
            className={styles.navLink}
            onClick={(e) => handleNavClick(e, 'contacts')}
          >
            Контакты
          </a>
        </nav>

        {/* Contacts & Primary Action */}
        <div className={styles.contactsBlock}>
          <div className={styles.locationMeta}>
            <div className={styles.cityTag}>
              <MapPin size={13} color="var(--color-primary)" />
              <span>{COMPANY_INFO.location}</span>
            </div>
            <a href={`tel:${COMPANY_INFO.phoneClean}`} className={styles.phoneLink}>
              {COMPANY_INFO.phone}
            </a>
          </div>

          <button
            type="button"
            className={styles.ctaBtn}
            onClick={onScrollToForm}
          >
            Оставить заявку
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Меню"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

      </div>

      {/* Mobile Drawer & Backdrop */}
      {mobileOpen && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className={styles.mobileDrawer}>
            <div style={{ padding: '0 0 16px', borderBottom: '1px solid var(--color-border)' }}>
              <Logo width={180} height={38} theme="light" />
            </div>
            <nav className={styles.mobileNavLinks} aria-label="Мобильное меню навигации">
              <a
                href="#about"
                className={styles.navLink}
                onClick={(e) => handleNavClick(e, 'about')}
              >
                О компании
              </a>
              <a
                href="#catalog"
                className={styles.navLink}
                onClick={(e) => handleNavClick(e, 'catalog')}
              >
                Направления поставок
              </a>
              <a
                href="#advantages"
                className={styles.navLink}
                onClick={(e) => handleNavClick(e, 'advantages')}
              >
                Преимущества B2B
              </a>
              <a
                href="#contacts"
                className={styles.navLink}
                onClick={(e) => handleNavClick(e, 'contacts')}
              >
                Контакты
              </a>
            </nav>

            <div className={styles.mobileContacts}>
              <div className={styles.cityTag} style={{ justifyContent: 'flex-start' }}>
                <MapPin size={14} color="var(--color-primary)" />
                <span>{COMPANY_INFO.location}</span>
              </div>
              <a href={`tel:${COMPANY_INFO.phoneClean}`} className={styles.phoneLink}>
                {COMPANY_INFO.phone}
              </a>
              <button
                type="button"
                className={styles.ctaBtn}
                onClick={() => {
                  setMobileOpen(false);
                  onScrollToForm();
                }}
              >
                Оставить заявку
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
