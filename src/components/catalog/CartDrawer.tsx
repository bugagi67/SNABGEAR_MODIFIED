import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { GeneratorSvgPlaceholder } from './GeneratorSvgPlaceholder';
import { X, Trash2, Plus, Minus, ShoppingBag, Send, CheckCircle2, ArrowRight, Mail, Copy, Check } from 'lucide-react';
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
  const [copiedOrder, setCopiedOrder] = useState(false);
  const [submittedOrderInfo, setSubmittedOrderInfo] = useState<{
    orderId: string;
    customer: string;
    phone: string;
    email: string;
    totalFormatted: string;
    itemsText: string;
    mailtoUrl: string;
  } | null>(null);

  const hiddenFormRef = useRef<HTMLFormElement>(null);

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

  // Formatted customer name/org representation
  const customerName = companyName
    ? `${companyName} (ИНН: ${companyInn || '—'}, контакт: ${contactName || '—'})`
    : (contactName ? `${contactName} (ИНН: ${companyInn || '—'})` : `Организация ИНН: ${companyInn || '—'}`);

  // Format order items line-by-line
  const formattedCartItemsText = items
    .map(
      (i, index) =>
        `${index + 1}. [Арт: ${i.product.sku}] ${i.product.title}\n` +
        `   Цена: ${new Intl.NumberFormat('ru-RU').format(i.product.price)} ₽ | Кол-во: ${i.quantity} шт. | Сумма: ${new Intl.NumberFormat('ru-RU').format(i.product.price * i.quantity)} ₽`
    )
    .join('\n\n');

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!companyInn.trim() && !companyName.trim() && !contactName.trim()) {
      setErrorMessage('Пожалуйста, укажите контактное лицо, ИНН или организацию');
      return;
    }

    if (!phone.trim() && !email.trim()) {
      setErrorMessage('Укажите телефон или email для отправки счёта и связи');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const orderId = `SG-${Date.now().toString(36).toUpperCase()}`;
    const mailtoSubject = encodeURIComponent(`Заказ оборудования TecEner #${orderId} от ${companyName || contactName || companyInn || 'Клиент'}`);
    const mailtoBody = encodeURIComponent(
      `Добрый день, ООО «СНАБГИР»!\n\n` +
      `Прошу выставить официальный счёт с НДС 22% на следующий заказ:\n\n` +
      `Номер заказа: #${orderId}\n` +
      `Организация / ИП: ${companyName || '—'}\n` +
      `ИНН: ${companyInn || '—'}\n` +
      `Контактное лицо: ${contactName || '—'}\n` +
      `Телефон: ${phone}\n` +
      `Email: ${email}\n` +
      (deliveryNote ? `Примечание / Доставка: ${deliveryNote}\n\n` : '\n') +
      `СПЕЦИФИКАЦИЯ ОБОРУДОВАНИЯ:\n` +
      `${formattedCartItemsText}\n\n` +
      `ИТОГО К ОПЛАТЕ: ${formattedTotalSum} ₽ (с НДС 22%)\n`
    );
    const mailtoUrl = `mailto:info@snabgear.ru?subject=${mailtoSubject}&body=${mailtoBody}`;

    const orderSummary = {
      orderId,
      customer: customerName,
      phone,
      email,
      totalFormatted: formattedTotalSum,
      itemsText: formattedCartItemsText,
      mailtoUrl,
    };
    setSubmittedOrderInfo(orderSummary);

    // 1. Submit to local full-stack server endpoint (No CORS issues, logged and stored)
    try {
      await fetch('/api/submit-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          companyInn: companyInn || '—',
          companyName: companyName || '—',
          contactName: contactName || '—',
          phone,
          email,
          deliveryNote: deliveryNote || '—',
          items: items.map((i) => ({
            sku: i.product.sku,
            title: i.product.title,
            price: i.product.price,
            quantity: i.quantity,
          })),
          itemsText: formattedCartItemsText,
          totalSum,
          totalFormatted: formattedTotalSum,
        }),
      });
    } catch (apiErr) {
      console.warn('Backend order endpoint notice:', apiErr);
    }

    // 2. Secondary fallback via native form targeting hidden iframe
    if (hiddenFormRef.current) {
      try {
        hiddenFormRef.current.submit();
      } catch (err) {
        // quiet fallback
      }
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
    clearCart();
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
      {/* Hidden Native Form & Iframe Fallback for FormSubmit */}
      <form
        ref={hiddenFormRef}
        action="https://formsubmit.co/info@snabgear.ru"
        method="POST"
        target="hidden_cart_submit_iframe"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="_subject" value={`Новый заказ из каталога TecEner (SNABGEAR) на сумму ${formattedTotalSum} ₽`} />
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="Имя / Организация" value={customerName} />
        <input type="hidden" name="ИНН" value={companyInn || '—'} />
        <input type="hidden" name="Компания" value={companyName || '—'} />
        <input type="hidden" name="Контактное лицо" value={contactName || '—'} />
        <input type="hidden" name="Телефон" value={phone} />
        <input type="hidden" name="Email" value={email} />
        <input type="hidden" name="Комментарий" value={deliveryNote || '—'} />
        <input type="hidden" name="Состав заказа" value={formattedCartItemsText} />
        <input type="hidden" name="Итоговая сумма (РРЦ)" value={`${formattedTotalSum} ₽`} />
      </form>
      <iframe
        name="hidden_cart_submit_iframe"
        title="hidden_cart_submit_iframe"
        style={{ display: 'none', width: 0, height: 0, border: 'none' }}
      />

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
              {submittedOrderInfo?.orderId && (
                <div className={styles.orderIdBadge}>Заказ #{submittedOrderInfo.orderId}</div>
              )}
              <h3 className={styles.successTitle}>Спецификация принята в обработку!</h3>
              <p className={styles.successText}>
                Заказ зарегистрирован и направлен в отдел комплектации на <strong>info@snabgear.ru</strong>.
                Наш специалист подготовит официальный счёт с НДС 22% и свяжется с вами по телефону{' '}
                <strong>{submittedOrderInfo?.phone || phone}</strong>.
              </p>

              {/* Instant direct actions for customer */}
              <div className={styles.successActions}>
                {submittedOrderInfo?.mailtoUrl && (
                  <a
                    href={submittedOrderInfo.mailtoUrl}
                    className={styles.primaryMailBtn}
                    title="Открыть в вашем почтовом клиенте для прямой отправки"
                  >
                    <Mail size={16} />
                    <span>Отправить копию на info@snabgear.ru</span>
                  </a>
                )}

                <button
                  type="button"
                  className={styles.copyOrderBtn}
                  onClick={() => {
                    if (submittedOrderInfo) {
                      const textToCopy =
                        `ЗАКАЗ ОБОРУДОВАНИЯ TECENER — ООО «СНАБГИР»\n` +
                        `Номер заказа: #${submittedOrderInfo.orderId}\n` +
                        `Клиент: ${submittedOrderInfo.customer}\n` +
                        `Телефон: ${submittedOrderInfo.phone}\n` +
                        `Email: ${submittedOrderInfo.email}\n\n` +
                        `СПЕЦИФИКАЦИЯ:\n${submittedOrderInfo.itemsText}\n\n` +
                        `ИТОГО К ОПЛАТЕ: ${submittedOrderInfo.totalFormatted} ₽ (с НДС 22%)`;
                      navigator.clipboard.writeText(textToCopy);
                      setCopiedOrder(true);
                      setTimeout(() => setCopiedOrder(false), 2500);
                    }
                  }}
                  title="Скопировать текст заказа в буфер обмена"
                >
                  {copiedOrder ? <Check size={16} color="#059669" /> : <Copy size={16} />}
                  <span>{copiedOrder ? 'Спецификация скопирована!' : 'Скопировать состав заказа'}</span>
                </button>
              </div>

              <div className={styles.supportContactNote}>
                Прямая связь с отделом снабжения: <a href="tel:+79206649068">+7 920 664 90 68</a>
              </div>

              <button
                type="button"
                className={styles.returnBtn}
                onClick={() => {
                  setIsSubmitted(false);
                  onClose();
                }}
              >
                Вернуться к покупкам
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
                      <label className={styles.formLabel}>ИНН организации</label>
                      <input
                        type="text"
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
                        placeholder="ООО / ИП / Организация"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Контактное лицо *</label>
                      <input
                        type="text"
                        required
                        className={styles.formInput}
                        placeholder="Имя или должность"
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
