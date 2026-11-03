import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { GeneratorSvgPlaceholder } from './GeneratorSvgPlaceholder';
import { X, Trash2, Plus, Minus, ShoppingBag, Send, CheckCircle2, ArrowRight } from 'lucide-react';
import styles from './CartDrawer.module.css';

interface CartDrawerProps {
  onClose: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onClose, onContinueShopping }) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalCount,
    totalSum,
  } = useCart();

  const [companyInn, setCompanyInn] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const formattedTotalSum = new Intl.NumberFormat('ru-RU').format(totalSum);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!companyInn.trim() && !companyName.trim()) {
      setErrorMessage('Пожалуйста, укажите ИНН или наименование организации');
      return;
    }

    if (!phone.trim() && !email.trim()) {
      setErrorMessage('Укажите телефон или email для связи и отправки счёта');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // Generate formatted plaintext specification table
    const itemsLines = items
      .map(
        (i, index) =>
          `${index + 1}. [Арт: ${i.product.sku}] ${i.product.title}\n` +
          `   Цена: ${new Intl.NumberFormat('ru-RU').format(i.product.price)} ₽ | Кол-во: ${i.quantity} шт. | Сумма: ${new Intl.NumberFormat('ru-RU').format(i.product.price * i.quantity)} ₽`
      )
      .join('\n\n');

    const fullMessage = [
      `=== ЗАКАЗ ОБОРУДОВАНИЯ TECENER (С САЙТА SNABGEAR.RU) ===`,
      `Дата и время: ${new Date().toLocaleString('ru-RU')}`,
      ``,
      `--- ДАННЫЕ ОРГАНИЗАЦИИ ---`,
      `ИНН: ${companyInn || 'Не указан'}`,
      `Компания: ${companyName || 'Не указано'}`,
      `Контактное лицо: ${contactName || 'Не указано'}`,
      `Телефон: ${phone || 'Не указан'}`,
      `Email: ${email || 'Не указан'}`,
      `Адрес/комментарий к доставке: ${deliveryNote || 'Не указан'}`,
      ``,
      `--- СПЕЦИФИКАЦИЯ ТОВАРОВ ---`,
      itemsLines,
      ``,
      `---------------------------------------`,
      `ИТОГО ПОЗИЦИЙ: ${totalCount} шт.`,
      `ИТОГО К ОПЛАТЕ (с НДС): ${formattedTotalSum} ₽`,
      `Регион поставки: г. Смоленск / Смоленская область`,
      `Форма оплаты: Безналичный расчёт с НДС для юр. лиц`,
    ].join('\n');

    try {
      const formData = new FormData();
      formData.append('_subject', `Заказ TecEner на сумму ${formattedTotalSum} ₽ (ИНН: ${companyInn || 'юрлицо'})`);
      formData.append('_captcha', 'false');
      formData.append('_template', 'table');
      formData.append('Заказчик_ИНН', companyInn);
      formData.append('Компания', companyName);
      formData.append('Контактное_лицо', contactName);
      formData.append('Телефон', phone);
      formData.append('Email', email);
      formData.append('Спецификация_и_Сумма', fullMessage);

      const response = await fetch('https://formsubmit.co/ajax/info@snabgear.ru', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      if (response.ok) {
        setIsSubmitted(true);
        clearCart();
      } else {
        throw new Error('Ошибка сервера');
      }
    } catch {
      // Fallback: standard submission or friendly error
      setErrorMessage('Не удалось отправить заявку автоматически. Пожалуйста, позвоните нам по тел. +7 920 664 90 68 или напишите на info@snabgear.ru');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-title"
    >
      <div className={styles.drawer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle} id="cart-title">
            <ShoppingBag size={20} color="#e52320" />
            <span>Спецификация заказа</span>
            {totalCount > 0 && <span className={styles.headerBadge}>{totalCount}</span>}
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Закрыть корзину"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className={styles.body}>
          {isSubmitted ? (
            <div className={styles.successCard}>
              <div className={styles.successIcon}>
                <CheckCircle2 size={32} />
              </div>
              <h3 className={styles.successTitle}>Спецификация успешно отправлена!</h3>
              <p className={styles.successText}>
                Наш специалист по оборудованию TecEner сформирует официальный счёт и договор поставки с НДС и свяжется с вами в течение 15 минут.
              </p>
              <button
                type="button"
                className={styles.returnBtn}
                onClick={() => {
                  setIsSubmitted(false);
                  onClose();
                }}
              >
                Вернуться на сайт
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <ShoppingBag size={32} />
              </div>
              <h3 className={styles.emptyTitle}>В спецификации пока нет позиций</h3>
              <p className={styles.emptyText}>
                Выберите необходимые модели генераторов или силового оборудования TecEner в каталоге.
              </p>
              <button
                type="button"
                className={styles.returnBtn}
                onClick={onContinueShopping}
              >
                Перейти в каталог TecEner
              </button>
            </div>
          ) : (
            <>
              {/* Product Items List */}
              <div className={styles.itemsList}>
                {items.map((item) => {
                  const lineTotal = new Intl.NumberFormat('ru-RU').format(
                    item.product.price * item.quantity
                  );

                  return (
                    <div key={item.product.sku} className={styles.itemCard}>
                      <div className={styles.itemImageWrap}>
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.title}
                            className={styles.itemImage}
                          />
                        ) : (
                          <GeneratorSvgPlaceholder />
                        )}
                      </div>

                      <div className={styles.itemDetails}>
                        <div className={styles.itemSku}>АРТ. {item.product.sku}</div>
                        <div className={styles.itemTitle} title={item.product.title}>
                          {item.product.title}
                        </div>
                        <div className={styles.itemPrice}>
                          {new Intl.NumberFormat('ru-RU').format(item.product.price)} ₽ × {item.quantity} = {lineTotal} ₽
                        </div>
                      </div>

                      <div className={styles.itemActions}>
                        <div className={styles.itemControls}>
                          <button
                            type="button"
                            className={styles.itemQtyBtn}
                            onClick={() => updateQuantity(item.product.sku, -1)}
                            aria-label="Уменьшить"
                          >
                            <Minus size={12} />
                          </button>
                          <span className={styles.itemQtyVal}>{item.quantity}</span>
                          <button
                            type="button"
                            className={styles.itemQtyBtn}
                            onClick={() => updateQuantity(item.product.sku, 1)}
                            aria-label="Увеличить"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          type="button"
                          className={styles.itemRemoveBtn}
                          onClick={() => removeFromCart(item.product.sku)}
                          aria-label="Удалить позицию"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Form & Totals */}
              <div className={styles.orderSection}>
                <div className={styles.summaryBox}>
                  <div className={styles.summaryRow}>
                    <span>Всего оборудования:</span>
                    <span>{totalCount} шт.</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Условия оплаты:</span>
                    <span>Безналичный расчёт с НДС</span>
                  </div>
                  <div className={styles.summaryTotalRow}>
                    <span className={styles.totalLabel}>Итого к оплате:</span>
                    <span className={styles.totalPrice}>{formattedTotalSum} ₽</span>
                  </div>
                </div>

                <form onSubmit={handleSubmitOrder}>
                  <h4 className={styles.formSectionTitle}>Реквизиты для выставления счёта (B2B)</h4>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>ИНН организации *</label>
                      <input
                        type="text"
                        required
                        className={styles.formInput}
                        placeholder="Например, 6700048898"
                        value={companyInn}
                        onChange={(e) => setCompanyInn(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Наименование компании / ИП</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="ООО / ИП..."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Контактное лицо</label>
                      <input
                        type="text"
                        className={styles.formInput}
                        placeholder="ФИО или должность"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Телефон для связи *</label>
                      <input
                        type="tel"
                        required
                        className={styles.formInput}
                        placeholder="+7 (___) ___-__-__"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Электронная почта (для счёта) *</label>
                      <input
                        type="email"
                        required
                        className={styles.formInput}
                        placeholder="snab@company.ru"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Адрес доставки / примечание к заказу</label>
                      <textarea
                        className={styles.formTextarea}
                        placeholder="г. Смоленск или область, требования к пусконаладке..."
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                      />
                    </div>

                    {errorMessage && (
                      <div style={{ color: '#e52320', fontSize: '12px', fontWeight: 600 }}>
                        {errorMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={styles.submitBtn}
                    >
                      {isSubmitting ? (
                        <span>Отправка заказа...</span>
                      ) : (
                        <>
                          <span>Оформить заказ и запросить счёт</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>

                    <div className={styles.privacyNotice}>
                      Счёт и договор с НДС будут высланы на указанный email. Оплата по безналичному расчёту.
                    </div>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
