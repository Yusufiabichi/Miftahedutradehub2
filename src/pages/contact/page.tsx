import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import WhatsAppButton from '../../components/feature/WhatsAppButton';
import { useSEO, generateWebPageSchema } from '../../utils/seo';
import { API_BASE_URL } from '../../utils/api';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type FieldErrors = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MAX = 500;
const SUBJECT_MAX = 120;

const SERVICES = [
  'Import & Export Solutions',
  'Global Education & Scholarships',
  'Currency Exchange & Remittance',
  'Goods & Services Sourcing',
  'Flights & Hotel Bookings',
  'Visa Processing & Travel Advisory',
  'Other',
] as const;

const FAQS = [
  {
    q: 'How quickly will I hear back?',
    a: 'We reply to every message within 24 business hours. For urgent matters, please call or WhatsApp us directly.',
  },
  {
    q: 'Do I need an appointment to visit the office?',
    a: 'Walk-ins are welcome during working hours, but booking ahead ensures a specialist is available to assist you immediately.',
  },
  {
    q: 'Is the consultation free?',
    a: 'Yes — your first consultation is completely free and comes with no obligation to proceed.',
  },
  {
    q: 'Can you help clients outside Kano?',
    a: 'Absolutely. We serve clients across Nigeria and internationally through phone, email, and video consultations.',
  },
];

function validateName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Please enter your name.';
  if (trimmed.length < 2) return 'Name must be at least 2 characters.';
  return undefined;
}

function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Please enter your email address.';
  if (!EMAIL_REGEX.test(trimmed)) return 'Enter a valid email address.';
  return undefined;
}

function validateSubject(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Please add a subject.';
  if (trimmed.length < 4) return 'Subject must be at least 4 characters.';
  return undefined;
}

function validateMessage(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Please write a message.';
  if (trimmed.length < 15) return 'Message must be at least 15 characters.';
  if (trimmed.length > MESSAGE_MAX) return `Message must be under ${MESSAGE_MAX} characters.`;
  return undefined;
}

export default function ContactPage() {
  useSEO({
    title: 'Contact Us - Get In Touch | Miftah Edu-Trade Hub Ltd Kano Nigeria',
    description:
      'Contact Miftah Edu-Trade Hub Ltd for international trade, education, and travel services. Visit our office in Kano, Nigeria or reach us by phone, email, or WhatsApp. We are here to help you achieve your global goals.',
    keywords:
      'contact Miftah Edu-Trade Hub, Kano office address, international trade contact, education consulting inquiry, visa processing contact Nigeria',
    canonical: '/contact',
    schema: generateWebPageSchema(
      'Contact Us - Miftah Edu-Trade Hub Ltd',
      'Get in touch with us for international trade, education, and travel services',
      '/contact'
    ),
  });

  const [status, setStatus] = useState<Status>('idle');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<keyof FieldErrors, boolean>>({
    name: false,
    email: false,
    subject: false,
    message: false,
  });
  const [messageLength, setMessageLength] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Scroll top on mount + autofocus name
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Auto-dismiss copy feedback
  useEffect(() => {
    if (!copiedField) return;
    const id = window.setTimeout(() => setCopiedField(null), 2000);
    return () => window.clearTimeout(id);
  }, [copiedField]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(label);
    } catch {
      /* clipboard unavailable — ignore silently */
    }
  };

  const setFieldError = (field: keyof FieldErrors, error: string | undefined) => {
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBlur = (
    field: keyof FieldErrors,
    value: string,
    validator: (v: string) => string | undefined
  ) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFieldError(field, validator(value));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'submitting') return;

    const formData = new FormData(e.currentTarget);
    const values = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      subject: String(formData.get('subject') || '').trim(),
      service: String(formData.get('service') || '').trim(),
      preferred: String(formData.get('preferred') || '').trim(),
      message: String(formData.get('message') || '').trim(),
    };

    const errors: FieldErrors = {
      name: validateName(values.name),
      email: validateEmail(values.email),
      subject: validateSubject(values.subject),
      message: validateMessage(values.message),
    };
    setFieldErrors(errors);
    setTouched({ name: true, email: true, subject: true, message: true });

    const firstError = (Object.keys(errors) as (keyof FieldErrors)[]).find(
      (key) => errors[key]
    );
    if (firstError) {
      const el = formRef.current?.querySelector<HTMLElement>(`[name="${firstError}"]`);
      el?.focus();
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setStatus('submitting');

    // Compose subject so backend still gets a clean string
    const subjectWithService = values.service
      ? `[${values.service}] ${values.subject}`
      : values.subject;

    try {
      const response = await fetch(`${API_BASE_URL}/api/enquiries/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone,
          subject: subjectWithService,
          message:
            values.preferred && values.preferred !== 'Email'
              ? `[Preferred contact: ${values.preferred}]\n\n${values.message}`
              : values.message,
        }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setStatus('success');
      formRef.current?.reset();
      setMessageLength(0);
      setFieldErrors({});
      setTouched({ name: false, email: false, subject: false, message: false });
      window.setTimeout(() => setStatus('idle'), 6000);
    } catch {
      setStatus('error');
      window.setTimeout(() => setStatus('idle'), 6000);
    }
  };

  const contactCards = useMemo(
    () => [
      {
        icon: 'ri-map-pin-line',
        title: 'Visit Us',
        color: 'from-blue-500 to-blue-600',
        rows: [
          {
            text: '123 Ahmadu Bello Way, Kano 700001, Nigeria',
            href: 'https://www.google.com/maps/search/?api=1&query=123+Ahmadu+Bello+Way+Kano+Nigeria',
            external: true,
            action: 'Open in Maps',
          },
        ],
      },
      {
        icon: 'ri-phone-line',
        title: 'Call Us',
        color: 'from-green-500 to-green-600',
        rows: [
          {
            text: '+8613259865980',
            href: 'tel:+8613259865980',
            action: 'Call',
          },
          {
            text: '+234 816 241 1941',
            href: 'tel:+2348162411941',
            action: 'Call',
          },
        ],
      },
      {
        icon: 'ri-mail-line',
        title: 'Email Us',
        color: 'from-yellow-500 to-yellow-600',
        rows: [
          {
            text: 'info@miftahedutradehub.com',
            href: 'mailto:info@miftahedutradehub.com',
            action: 'Email',
          },
          {
            text: 'support@miftahedutradehub.com',
            href: 'mailto:support@miftahedutradehub.com',
            action: 'Email',
          },
        ],
      },
      {
        icon: 'ri-time-line',
        title: 'Working Hours',
        color: 'from-purple-500 to-purple-600',
        rows: [
          { text: 'Monday – Saturday: 9:00 AM – 6:00 PM' },
          { text: 'Sunday: Closed', muted: true },
        ],
      },
    ],
    []
  );

  const socials = [
    { label: 'Facebook', href: 'https://facebook.com', icon: 'ri-facebook-fill', tone: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Twitter / X', href: 'https://twitter.com', icon: 'ri-twitter-x-fill', tone: 'bg-gray-900 hover:bg-black' },
    { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'ri-linkedin-fill', tone: 'bg-blue-700 hover:bg-blue-800' },
    { label: 'Instagram', href: 'https://instagram.com/methl_ng', icon: 'ri-instagram-fill', tone: 'bg-gradient-to-br from-pink-500 to-orange-500' },
    { label: 'YouTube', href: 'https://youtube.com', icon: 'ri-youtube-fill', tone: 'bg-red-600 hover:bg-red-700' },
  ];

  const messageRemaining = MESSAGE_MAX - messageLength;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <WhatsAppButton />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center justify-center gap-2 text-sm text-blue-200">
              <li>
                <Link to="/" className="hover:text-yellow-400 transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <i className="ri-arrow-right-s-line"></i>
              </li>
              <li className="text-yellow-400 font-medium">Contact</li>
            </ol>
          </nav>

          <span className="inline-block px-4 py-1.5 bg-yellow-400/20 text-yellow-300 text-xs font-semibold rounded-full mb-6 tracking-wide uppercase">
            We're Here to Help
          </span>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">Get In Touch</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Have a question about import & export, study abroad, visa processing, or currency
            exchange? Our team replies within 24 hours.
          </p>

          {/* Response-time trust chip */}
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Typical response time: under 24 hours
          </div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactCards.map((info) => (
              <div
                key={info.title}
                className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-yellow-400 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform`}
                >
                  <i className={`${info.icon} text-2xl text-white`} aria-hidden="true"></i>
                </div>
                <h3 className="text-lg font-bold text-blue-900 mb-4">{info.title}</h3>
                <ul className="space-y-2">
                  {info.rows.map((row, idx) => (
                    <li key={idx} className="text-sm">
                      {'href' in row && row.href ? (
                        <div className="flex items-center justify-between gap-2 group/row">
                          <a
                            href={row.href}
                            target={('external' in row && row.external) ? '_blank' : undefined}
                            rel={('external' in row && row.external) ? 'noopener noreferrer' : undefined}
                            className="text-gray-700 hover:text-blue-900 transition-colors truncate"
                          >
                            {row.text}
                          </a>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(row.text, row.text)}
                              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                              aria-label={`Copy ${row.text}`}
                              title="Copy"
                            >
                              <i
                                className={
                                  copiedField === row.text
                                    ? 'ri-check-line text-green-600'
                                    : 'ri-file-copy-line'
                                }
                                aria-hidden="true"
                              ></i>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span
                          className={
                            'muted' in row && row.muted ? 'text-gray-400' : 'text-gray-600'
                          }
                        >
                          {row.text}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-8 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Form */}
            <div>
              <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-4 tracking-wide uppercase">
                Send a message
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
                Tell Us How We Can Help
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Fill in the form below and our team will respond within 24 business hours. Fields
                marked <span className="text-red-500">*</span> are required.
              </p>

              <form
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate
                className="space-y-5"
              >
                {/* Name + Email */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={nameRef}
                      type="text"
                      id="name"
                      name="name"
                      autoComplete="name"
                      onBlur={(e) => handleBlur('name', e.target.value, validateName)}
                      onChange={() => {
                        if (touched.name) setFieldError('name', undefined);
                      }}
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                      className={`w-full px-4 py-3 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
                        fieldErrors.name
                          ? 'border-red-300 focus:ring-red-400 focus:border-transparent'
                          : 'border-gray-300 focus:ring-blue-900 focus:border-transparent'
                      }`}
                      placeholder="John Doe"
                    />
                    {fieldErrors.name && (
                      <p
                        id="name-error"
                        className="mt-1.5 text-xs text-red-600 flex items-center gap-1"
                      >
                        <i className="ri-error-warning-line" aria-hidden="true"></i>
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      inputMode="email"
                      onBlur={(e) => handleBlur('email', e.target.value, validateEmail)}
                      onChange={() => {
                        if (touched.email) setFieldError('email', undefined);
                      }}
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                      className={`w-full px-4 py-3 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
                        fieldErrors.email
                          ? 'border-red-300 focus:ring-red-400 focus:border-transparent'
                          : 'border-gray-300 focus:ring-blue-900 focus:border-transparent'
                      }`}
                      placeholder="john@example.com"
                    />
                    {fieldErrors.email && (
                      <p
                        id="email-error"
                        className="mt-1.5 text-xs text-red-600 flex items-center gap-1"
                      >
                        <i className="ri-error-warning-line" aria-hidden="true"></i>
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone + Service */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      autoComplete="tel"
                      inputMode="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-colors"
                      placeholder="+234 803 456 7890"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="service"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      What's this about?
                    </label>
                    <select
                      id="service"
                      name="service"
                      defaultValue=""
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-colors"
                    >
                      <option value="">General inquiry</option>
                      {SERVICES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Preferred contact method */}
                <div>
                  <span className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred contact method
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {['Email', 'Phone', 'WhatsApp'].map((method) => (
                      <label
                        key={method}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:border-blue-400 hover:bg-blue-50 has-[:checked]:border-blue-900 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-900 has-[:checked]:font-semibold transition-colors"
                      >
                        <input
                          type="radio"
                          name="preferred"
                          value={method}
                          defaultChecked={method === 'Email'}
                          className="sr-only"
                        />
                        {method}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    maxLength={SUBJECT_MAX}
                    onBlur={(e) => handleBlur('subject', e.target.value, validateSubject)}
                    onChange={() => {
                      if (touched.subject) setFieldError('subject', undefined);
                    }}
                    aria-invalid={Boolean(fieldErrors.subject)}
                    aria-describedby={fieldErrors.subject ? 'subject-error' : undefined}
                    className={`w-full px-4 py-3 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
                      fieldErrors.subject
                        ? 'border-red-300 focus:ring-red-400 focus:border-transparent'
                        : 'border-gray-300 focus:ring-blue-900 focus:border-transparent'
                    }`}
                    placeholder="How can we help?"
                  />
                  {fieldErrors.subject && (
                    <p
                      id="subject-error"
                      className="mt-1.5 text-xs text-red-600 flex items-center gap-1"
                    >
                      <i className="ri-error-warning-line" aria-hidden="true"></i>
                      {fieldErrors.subject}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Message <span className="text-red-500">*</span>
                    </label>
                    <span
                      className={`text-xs tabular-nums ${
                        messageRemaining < 50 ? 'text-amber-600' : 'text-gray-400'
                      }`}
                      aria-live="polite"
                    >
                      {messageLength}/{MESSAGE_MAX}
                    </span>
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    maxLength={MESSAGE_MAX}
                    onBlur={(e) => handleBlur('message', e.target.value, validateMessage)}
                    onChange={(e) => {
                      setMessageLength(e.target.value.length);
                      if (touched.message) setFieldError('message', undefined);
                    }}
                    aria-invalid={Boolean(fieldErrors.message)}
                    aria-describedby={fieldErrors.message ? 'message-error' : 'message-hint'}
                    className={`w-full px-4 py-3 border rounded-lg text-sm resize-y transition-colors focus:outline-none focus:ring-2 ${
                      fieldErrors.message
                        ? 'border-red-300 focus:ring-red-400 focus:border-transparent'
                        : 'border-gray-300 focus:ring-blue-900 focus:border-transparent'
                    }`}
                    placeholder="Tell us more about your inquiry — the more detail you share, the faster we can help."
                  />
                  {fieldErrors.message ? (
                    <p
                      id="message-error"
                      className="mt-1.5 text-xs text-red-600 flex items-center gap-1"
                    >
                      <i className="ri-error-warning-line" aria-hidden="true"></i>
                      {fieldErrors.message}
                    </p>
                  ) : (
                    <p id="message-hint" className="mt-1.5 text-xs text-gray-500">
                      Please do not include sensitive personal or financial information.
                    </p>
                  )}
                </div>

                {/* Success */}
                {status === 'success' && (
                  <div
                    role="status"
                    className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3"
                  >
                    <i
                      className="ri-checkbox-circle-fill text-green-600 text-2xl flex-shrink-0"
                      aria-hidden="true"
                    ></i>
                    <div>
                      <h4 className="font-semibold text-green-900">Message sent successfully!</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Thank you for reaching out. We'll reply within 24 business hours.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error */}
                {status === 'error' && (
                  <div
                    role="alert"
                    className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
                  >
                    <i
                      className="ri-error-warning-fill text-red-600 text-2xl flex-shrink-0"
                      aria-hidden="true"
                    ></i>
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900">
                        We couldn't send your message
                      </h4>
                      <p className="text-sm text-red-700 mt-1">
                        Please try again, or reach us directly at{' '}
                        <a href="tel:+2348162411941" className="font-semibold underline">
                          +234 816 241 1941
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  aria-busy={status === 'submitting'}
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-lg font-semibold hover:shadow-xl hover:from-blue-800 hover:to-blue-700 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  {status === 'submitting' ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin" aria-hidden="true"></i>
                      Sending...
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2">
                      <i className="ri-send-plane-fill" aria-hidden="true"></i>
                      Send Message
                    </span>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By sending this message you agree to our{' '}
                  <Link to="/privacy" className="text-blue-900 hover:underline">
                    privacy policy
                  </Link>
                  .
                </p>
              </form>
            </div>

            {/* Map + Social */}
            <div>
              <span className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full mb-4 tracking-wide uppercase">
                Visit our office
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Find Us Here</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Prefer to talk in person? Our specialists are available during working hours to
                discuss your needs face to face.
              </p>

              <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100 mb-4">
                <iframe
                  src="https://www.google.com/maps?q=123%20Ahmadu%20Bello%20Way,%20Kano%20700001,%20Nigeria&output=embed"
                  width="100%"
                  height="360"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Miftah Edu-Trade Hub Location"
                ></iframe>
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=123+Ahmadu+Bello+Way+Kano+Nigeria"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 mb-8 bg-white text-blue-900 border border-gray-200 rounded-lg font-medium hover:border-blue-900 hover:bg-blue-50 transition-colors"
              >
                <i className="ri-route-line" aria-hidden="true"></i>
                Get Directions
              </a>

              <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-2xl p-8 border border-blue-100">
                <h3 className="text-xl font-bold text-blue-900 mb-3">Connect With Us</h3>
                <p className="text-gray-700 mb-6 text-sm leading-relaxed">
                  Follow us for updates on international trade, scholarship deadlines, travel
                  tips, and currency rates.
                </p>
                <div className="flex flex-wrap gap-3">
                  {socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 ${social.tone} text-white rounded-full flex items-center justify-center transition-all hover:scale-105 cursor-pointer`}
                      aria-label={social.label}
                    >
                      <i className={`${social.icon} text-xl`} aria-hidden="true"></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-white text-blue-800 text-xs font-semibold rounded-full mb-4 tracking-wide uppercase">
              Before You Write
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Quick Answers
            </h2>
            <p className="text-gray-600">
              You might find your answer below — saving you a round-trip.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-blue-900 pr-4">{faq.q}</h3>
                  <i
                    className="ri-arrow-down-s-line text-2xl text-blue-900 group-open:rotate-180 transition-transform flex-shrink-0"
                    aria-hidden="true"
                  ></i>
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Immediate assistance */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 bg-yellow-400/20 text-yellow-300 text-xs font-semibold rounded-full mb-6 tracking-wide uppercase">
            Urgent?
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Need Immediate Assistance?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Our support team is available during working hours for urgent inquiries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+2348162411941"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:shadow-2xl transition-all whitespace-nowrap cursor-pointer"
            >
              <i className="ri-phone-line mr-2" aria-hidden="true"></i>
              Call +234 816 241 1941
            </a>
            <a
              href="https://wa.me/2348162411941"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-500 text-white rounded-lg font-semibold text-lg hover:bg-green-600 hover:shadow-2xl transition-all whitespace-nowrap cursor-pointer"
            >
              <i className="ri-whatsapp-line mr-2" aria-hidden="true"></i>
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}