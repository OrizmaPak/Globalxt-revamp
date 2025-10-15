import { useState } from 'react';
import type { FormEvent } from 'react';
import { useContent } from '../context/ContentProvider';
import image from '../assets/image3.jpg';
import Breadcrumb from '../components/Breadcrumb';
import SEO from '../components/SEO';
import { canonicalForPath } from '../utils/seo';

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const { content } = useContent();
  const contactChannels = content?.contactChannels ?? [];
  const companyInfo = content?.companyInfo ?? { address: '' } as any;
  const heroBg = content?.pageImages?.defaultHero ?? image;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-white">
      <SEO
        title="Contact | Global XT Limited"
        description="Get in touch to discuss your agro commodity sourcing, export consulting, and training needs."
        pathname={'/contact'}
        canonical={canonicalForPath('/contact')}
      />
      <section className="relative overflow-hidden py-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroBg})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-lime/95 via-brand-chartreuse/90 to-transparent" />
        <div className="container-gxt relative z-10">
          <span
            className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary"
            data-content-path="pageCopy.contact.hero.badge"
          >
            Contact
          </span>
          <h1
            className="mt-4 text-3xl font-semibold text-brand-deep"
            data-content-path="pageCopy.contact.hero.title"
          >
            Let's build your export program
          </h1>
          <p
            className="mt-4 max-w-3xl text-sm text-slate-600"
            data-content-path="pageCopy.contact.hero.description"
          >
            Reach out via phone, WhatsApp, or the contact form. A member of our commercial team will
            respond within one business day.
          </p>
        </div>
      </section>
      <Breadcrumb />

      <section className="container-gxt grid gap-8 py-16 lg:grid-cols-[1.1fr,0.9fr] lg:items-start">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-deep" data-content-path="pageCopy.contact.form.title">Send us a message</h2>
          <p className="mt-2 text-xs text-slate-500" data-content-path="pageCopy.contact.form.acknowledgement">
            CAPTCHA integration placeholder - production build will connect to reCAPTCHA/Turnstile.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-primary focus:outline-none"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-primary focus:outline-none"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Phone / WhatsApp
              </label>
              <input
                id="phone"
                name="phone"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="company" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Company
              </label>
              <input
                id="company"
                name="company"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-primary focus:outline-none"
              placeholder="Share product requirements, volumes, and destination market."
            />
          </div>
          <button
            type="submit"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:bg-brand-lime"
          >
            <span data-content-path="pageCopy.contact.form.submitLabel">Submit enquiry</span>
          </button>
          {submitted && (
            <p className="mt-4 rounded-2xl bg-brand-lime/10 px-4 py-3 text-sm text-brand-primary" data-content-path="pageCopy.contact.form.successMessage">
              Thank you. Our team will reach out shortly. This is a placeholder acknowledgement until the
              live backend endpoint is connected.
            </p>
          )}
        </form>
        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-deep" data-content-path="pageCopy.contact.directContactTitle">Direct contact</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {contactChannels.map((channel, i) => (
                <li key={channel.label}>
                  <a href={channel.href} className="font-semibold text-brand-primary hover:text-brand-lime">
                    <span data-content-path={`contactChannels.${i}.label`}>{channel.label}</span>: <span data-content-path={`contactChannels.${i}.value`}>{channel.value}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              WhatsApp widget integration placeholder. Embed script will go here during production setup.
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
            <iframe
              title={"Global XT Limited map"}
              src={`https://www.google.com/maps?q=${encodeURIComponent(companyInfo.address)}&output=embed`}
              className="h-64 w-full rounded-2xl"
              loading="lazy"
            />
          </div>
        </aside>
      </section>
    </div>
  );
};

export default ContactPage;


