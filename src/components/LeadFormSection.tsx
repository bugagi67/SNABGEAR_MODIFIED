import React, { useState, useRef, useEffect } from 'react';
import styles from './LeadFormSection.module.css';
import { COMPANY_INFO } from '../data/categories';
import { 
  FileUp, 
  Send, 
  CheckCircle2, 
  Trash2, 
  FileText, 
  Download,
  Mail,
  Phone,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';

interface LeadFormSectionProps {
  initialCategory?: string;
  onClearInitialCategory?: () => void;
}

interface AttachedFileInfo {
  file: File;
  name: string;
  sizeFormatted: string;
  base64?: string;
}

export const LeadFormSection: React.FC<LeadFormSectionProps> = ({
  initialCategory,
  onClearInitialCategory,
}) => {
  // Form State
  const [companyOrInn, setCompanyOrInn] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  
  // File state
  const [attachedFile, setAttachedFile] = useState<AttachedFileInfo | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Form submission state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [needsActivation, setNeedsActivation] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submittedDataSummary, setSubmittedDataSummary] = useState<{
    company: string;
    contact: string;
    phone: string;
    fileName?: string;
    fileSize?: string;
    fileDataUrl?: string;
  } | null>(null);

  // Check if target email requires one-time FormSubmit activation
  useEffect(() => {
    fetch(`https://formsubmit.co/ajax/${COMPANY_INFO.targetEmail}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _ping: '1' }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.message && data.message.toLowerCase().includes('activation')) {
          setNeedsActivation(true);
        } else if (data?.success === 'true') {
          setNeedsActivation(false);
        }
      })
      .catch(() => {});
  }, []);

  // If a user clicked "Запросить КП" on a category card, prefill the comment
  useEffect(() => {
    if (initialCategory) {
      setComment((prev) => 
        prev ? `${prev}\nИнтересует направление: ${initialCategory}` : `Интересует направление: ${initialCategory}`
      );
      if (onClearInitialCategory) {
        onClearInitialCategory();
      }
    }
  }, [initialCategory, onClearInitialCategory]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setAttachedFile({
        file,
        name: file.name,
        sizeFormatted: formatFileSize(file.size),
        base64: dataUrl,
      });

      // Synchronize file into the DOM file input ref so native multipart/form-data upload contains it
      if (fileInputRef.current) {
        try {
          const dt = new DataTransfer();
          dt.items.add(file);
          fileInputRef.current.files = dt.files;
        } catch (e) {
          console.warn('DataTransfer sync notice:', e);
        }
      }
    };
    reader.readAsDataURL(file);
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      try {
        const dt = new DataTransfer();
        fileInputRef.current.files = dt.files;
      } catch (e) {
        console.warn('Could not reset files via DataTransfer:', e);
      }
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!contactPerson.trim()) {
      newErrors.contactPerson = 'Укажите контактное лицо';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Укажите номер телефона для связи';
    } else if (phone.trim().length < 6) {
      newErrors.phone = 'Укажите корректный номер телефона';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const emailSubject = `Новая спецификация от ${companyOrInn || contactPerson} [SNABGEAR]`;

    // Ensure DOM file input has the attached file before form submission
    if (attachedFile?.file && fileInputRef.current) {
      if (!fileInputRef.current.files || fileInputRef.current.files.length === 0) {
        try {
          const dt = new DataTransfer();
          dt.items.add(attachedFile.file);
          fileInputRef.current.files = dt.files;
        } catch (err) {
          console.warn('DataTransfer sync warning:', err);
        }
      }
    }

    // Comprehensive logging
    console.log('====================================================');
    console.log('[SNABGEAR Lead Submission] Отправка заявки и файла спецификации:');
    console.log('Получатель (Email):', COMPANY_INFO.targetEmail);
    console.log('Тема письма:', emailSubject);
    console.log('Организация / ИНН:', companyOrInn || 'Не указано');
    console.log('Контактное лицо:', contactPerson);
    console.log('Телефон:', phone);
    console.log('Email:', email || 'Не указан');
    console.log('Комментарий / ТЗ:', comment || 'Без комментария');
    if (attachedFile) {
      console.log('Прикрепленный файл спецификации:', attachedFile.name, `(${attachedFile.sizeFormatted})`);
      console.log('MIME тип файла:', attachedFile.file.type);
    } else {
      console.log('Прикрепленный файл: отсутствует');
    }
    console.log('====================================================');

    let activationDetected = needsActivation;

    try {
      // 1. Submit native multipart/form-data via formRef into hidden iframe.
      // FormSubmit requires native multipart/form-data with name="attachment"
      // to attach the original file byte-for-byte to the recipient email.
      if (formRef.current) {
        formRef.current.submit();
      }

      // 2. Also send as FormData via AJAX endpoint to inspect response status
      if (formRef.current) {
        const ajaxFormData = new FormData(formRef.current);
        const res = await fetch(`https://formsubmit.co/ajax/${COMPANY_INFO.targetEmail}`, {
          method: 'POST',
          body: ajaxFormData,
        });
        const resData = await res.json().catch(() => null);
        if (resData?.message && resData.message.toLowerCase().includes('activation')) {
          activationDetected = true;
        } else if (resData?.success === 'true') {
          activationDetected = false;
        }
      }
    } catch (err) {
      console.warn('Form submission dispatch fallback:', err);
    }

    setNeedsActivation(activationDetected);
    setIsSubmitting(false);
    setIsSuccess(true);
    setSubmittedDataSummary({
      company: companyOrInn || 'Юридическое лицо',
      contact: contactPerson,
      phone: phone,
      fileName: attachedFile?.name,
      fileSize: attachedFile?.sizeFormatted,
      fileDataUrl: attachedFile?.base64,
    });
  };

  const handleCopyData = () => {
    const summaryText = [
      `ЗАЯВКА НА СНАБЖЕНИЕ — ${COMPANY_INFO.brandName}`,
      `Организация / ИНН: ${companyOrInn || 'Не указано'}`,
      `Контактное лицо: ${contactPerson}`,
      `Телефон: ${phone}`,
      email ? `Email: ${email}` : '',
      comment ? `Комментарий: ${comment}` : '',
      attachedFile ? `Приложен файл: ${attachedFile.name} (${attachedFile.sizeFormatted})` : '',
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setCompanyOrInn('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setComment('');
    handleRemoveFile();
    setErrors({});
  };

  const mailtoSubject = encodeURIComponent(`Спецификация от ${companyOrInn || contactPerson} [SNABGEAR]`);
  const mailtoBody = encodeURIComponent(
    `Добрый день!\n\n` +
    `Прошу рассчитать спецификацию со следующими параметрами:\n` +
    `Организация / ИНН: ${companyOrInn || 'Не указано'}\n` +
    `Контактное лицо: ${contactPerson}\n` +
    `Телефон: ${phone}\n` +
    `Email: ${email || 'Не указан'}\n` +
    (comment ? `Комментарий: ${comment}\n` : '') +
    (attachedFile ? `\n(Прикрепленный файл: ${attachedFile.name})` : '')
  );
  const mailtoUrl = `mailto:${COMPANY_INFO.targetEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <section id="lead-form" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.formCard}>
          <div className={styles.topAccentBar} />

          {/* Section Header */}
          <div className={styles.headerArea}>
            <span className={styles.eyebrow}>Оперативный расчет сметы</span>
            <h2 className={styles.title}>
              Отправьте заявку или спецификацию на расчет — Отдел снабжения СНАБГИР
            </h2>
            <p className={styles.subtitle}>
              Прикрепите файл спецификации в любом формате (.xlsx, .pdf, .doc, .csv) или опишите потребности. Инженеры отдела комплектации SNABGEAR подготовят расчет в течение 30 минут. Также принимаем заявки на{' '}
              <a href={`mailto:${COMPANY_INFO.email}`} style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}>
                {COMPANY_INFO.email}
              </a>
              {' '}или по телефону{' '}
              <a href={`tel:${COMPANY_INFO.phoneClean}`} style={{ color: 'var(--color-dark)', fontWeight: 600, textDecoration: 'underline' }}>
                {COMPANY_INFO.phone}
              </a>.
            </p>
          </div>

          {/* Hidden iframe so native multipart submission posts quietly without reloading the SPA */}
          <iframe
            name="hidden_form_iframe"
            id="hidden_form_iframe"
            style={{ display: 'none', width: 0, height: 0, border: 0 }}
            aria-hidden="true"
            title="Lead Submission Target Frame"
          />

          {/* Success Notification View */}
          {isSuccess ? (
            <div className={styles.successCard}>
              <div className={styles.successIconWrapper}>
                <CheckCircle2 size={36} />
              </div>

              <h3 className={styles.successTitle}>
                Заявка сформирована и отправлена!
              </h3>

              <p className={styles.successMessage}>
                Данные заявки и спецификация переданы на адрес <strong>{COMPANY_INFO.targetEmail}</strong>. Мы свяжемся с вами в течение 30 минут для согласования цен и сроков отгрузки.
              </p>

              {/* Informative banner if target email requires one-time FormSubmit activation */}
              {needsActivation && (
                <div className={styles.activationAlert}>
                  <div className={styles.activationHeader}>
                    <AlertTriangle size={20} color="#d97706" />
                    <span>Внимание: требуется однократная активация ящика {COMPANY_INFO.targetEmail}</span>
                  </div>
                  <p className={styles.activationText}>
                    Почтовый шлюз FormSubmit отправил письмо подтверждения на адрес <strong>{COMPANY_INFO.targetEmail}</strong>. Пока кнопка в письме не нажата, новые заявки временно заблокированы сервисом.
                  </p>
                  <ol className={styles.activationSteps}>
                    <li>Войдите в почтовый ящик <strong>{COMPANY_INFO.targetEmail}</strong> (в Яндекс Почте обязательно проверьте папку <strong>«Спам»</strong> или «Рассылки»).</li>
                    <li>Найдите письмо от <strong>FormSubmit</strong> с темой <em>«Action Required: Confirm your FormSubmit form»</em>.</li>
                    <li>Нажмите в письме зеленую кнопку <strong>«Activate Form»</strong>.</li>
                  </ol>
                  <p className={styles.activationFooterNote}>
                    Это требуется сделать только 1 раз при подключении адреса. После подтверждения все последующие заявки будут сразу попадать во Входящие.
                  </p>
                </div>
              )}

              {submittedDataSummary && (
                <div className={styles.successSummaryBox}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Организация:</span>
                    <span className={styles.summaryVal}>{submittedDataSummary.company}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Контактное лицо:</span>
                    <span className={styles.summaryVal}>{submittedDataSummary.contact}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Телефон для связи:</span>
                    <span className={styles.summaryVal}>{submittedDataSummary.phone}</span>
                  </div>
                  {submittedDataSummary.fileName && (
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>Прикрепленная спецификация:</span>
                      <span className={styles.summaryVal} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                        <FileText size={16} color="var(--color-primary)" />
                        {submittedDataSummary.fileName} ({submittedDataSummary.fileSize})
                      </span>
                    </div>
                  )}
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Адрес доставки заявки:</span>
                    <span className={styles.summaryVal}>{COMPANY_INFO.targetEmail}</span>
                  </div>
                </div>
              )}

              {/* Action buttons on success */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 24 }}>
                <a
                  href={mailtoUrl}
                  className={styles.mailClientBtn}
                  title="Открыть в вашем почтовом клиенте для прямой отправки"
                >
                  <Mail size={16} />
                  <span>Продублировать через почту (mailto)</span>
                </a>

                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={handleCopyData}
                  title="Скопировать текст заявки в буфер обмена"
                >
                  {copied ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
                  <span>{copied ? 'Скопировано!' : 'Скопировать текст заявки'}</span>
                </button>

                {submittedDataSummary?.fileDataUrl && (
                  <a
                    href={submittedDataSummary.fileDataUrl}
                    download={submittedDataSummary.fileName || 'spec.xlsx'}
                    className={styles.resetBtn}
                    style={{ backgroundColor: 'var(--color-bg-page)', color: 'var(--color-dark)', border: '1px solid var(--color-border)', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                  >
                    <Download size={16} />
                    <span>Скачать файл</span>
                  </a>
                )}

                <button
                  type="button"
                  className={styles.resetBtn}
                  onClick={handleReset}
                >
                  Отправить еще одну заявку
                </button>
              </div>
            </div>
          ) : (
            /* Lead Form */
            <form
              ref={formRef}
              action={`https://formsubmit.co/${COMPANY_INFO.targetEmail}`}
              method="POST"
              encType="multipart/form-data"
              target="hidden_form_iframe"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* FormSubmit Configuration Fields */}
              <input 
                type="hidden" 
                name="_subject" 
                value={`Новая спецификация от: ${companyOrInn || contactPerson} [SNABGEAR B2B]`} 
              />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="Компания_или_ИНН" value={companyOrInn || 'Не указано'} />
              <input type="hidden" name="Контактное_лицо" value={contactPerson} />
              <input type="hidden" name="Телефон" value={phone} />
              <input type="hidden" name="Email_заказчика" value={email || 'Не указан'} />
              <input type="hidden" name="Комментарий_ТЗ" value={comment || 'Без комментария'} />
              <input 
                type="hidden" 
                name="Спецификация_название" 
                value={attachedFile ? `${attachedFile.name} (${attachedFile.sizeFormatted})` : 'Файл не приложен'} 
              />
              <input type="hidden" name="Регион_поставки" value={COMPANY_INFO.location} />

              <div className={styles.formGrid}>
                
                {/* Company / INN */}
                <div className={styles.formGroup}>
                  <label htmlFor="companyOrInn" className={styles.label}>
                    Название компании / ИНН
                  </label>
                  <input
                    id="companyOrInn"
                    name="organization"
                    type="text"
                    value={companyOrInn}
                    onChange={(e) => setCompanyOrInn(e.target.value)}
                    placeholder="Название организации или ИНН"
                    className={styles.input}
                  />
                </div>

                {/* Contact Person (Required) */}
                <div className={styles.formGroup}>
                  <label htmlFor="contactPerson" className={styles.label}>
                    Контактное лицо <span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    id="contactPerson"
                    name="contact_person"
                    type="text"
                    value={contactPerson}
                    onChange={(e) => {
                      setContactPerson(e.target.value);
                      if (errors.contactPerson) setErrors((prev) => ({ ...prev, contactPerson: '' }));
                    }}
                    placeholder="ФИО / Должность представителя"
                    className={`${styles.input} ${errors.contactPerson ? styles.inputError : ''}`}
                    required
                  />
                  {errors.contactPerson && (
                    <span className={styles.errorText}>{errors.contactPerson}</span>
                  )}
                </div>

                {/* Phone (Required) */}
                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.label}>
                    Телефон <span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    placeholder="+7 (___) ___-__-__"
                    className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                    required
                  />
                  {errors.phone && (
                    <span className={styles.errorText}>{errors.phone}</span>
                  )}
                </div>

                {/* Email */}
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Электронная почта (Email)
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="corporate@domain.ru"
                    className={styles.input}
                  />
                </div>

                {/* Comment / Specifications */}
                <div className={styles.formGroupFull}>
                  <label htmlFor="comment" className={styles.label}>
                    Комментарий / Текст заявки
                  </label>
                  <textarea
                    id="comment"
                    name="message"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Укажите требуемые позиции, ГОСТ, маркировку, объем партии или особые условия поставки..."
                    className={styles.textarea}
                  />
                </div>

                {/* File Upload Dropzone (input ALWAYS remains mounted in form for multipart submission) */}
                <div className={styles.formGroupFull}>
                  <label className={styles.label}>
                    Спецификация или смета (Excel, PDF, Word, CSV)
                  </label>

                  {/* CRITICAL: The file input MUST always stay in the DOM inside form with name="attachment" */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="attachment"
                    accept=".xlsx,.xls,.pdf,.doc,.docx,.csv,.txt,.zip"
                    onChange={handleFileChange}
                    className={styles.fileInputHidden}
                  />

                  {!attachedFile ? (
                    <div
                      className={`${styles.dropzone} ${dragActive ? styles.dropzoneDragActive : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className={styles.dropzoneContent}>
                        <FileUp size={34} className={styles.dropzoneIcon} />
                        <div className={styles.dropzoneTitle}>
                          Перетащите файл спецификации сюда или нажмите для выбора
                        </div>
                        <div className={styles.dropzoneSubtitle}>
                          Поддерживаются .xlsx, .xls, .pdf, .docx, .csv до 10 МБ (приходит вложением в почту)
                        </div>
                        <span className={styles.dropzoneBtn}>
                          Прикрепить файл спецификации
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.filePreviewCard}>
                      <div className={styles.fileInfo}>
                        <FileText size={28} className={styles.fileDocIcon} />
                        <div>
                          <div className={styles.fileName}>{attachedFile.name}</div>
                          <div className={styles.fileSize}>{attachedFile.sizeFormatted} · Готов к отправке вложением</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className={styles.removeFileBtn}
                        title="Удалить прикрепленный файл"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Submit Button & Legal Note */}
              <div className={styles.submitRow}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitBtn}
                >
                  <Send size={20} />
                  <span>
                    {isSubmitting ? 'Отправка спецификации...' : 'Отправить заявку со спецификацией'}
                  </span>
                </button>

                <p className={styles.legalNote}>
                  Нажимая кнопку «Отправить заявку со спецификацией», вы даете согласие на обработку персональных данных в соответствии с 152-ФЗ. Работаем строго с юридическими лицами (ООО, АО, ИП) с НДС 22%.
                </p>
              </div>

            </form>
          )}

        </div>
      </div>
    </section>
  );
};
