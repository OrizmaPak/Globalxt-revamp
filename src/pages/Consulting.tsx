import { Link } from 'react-router-dom';
import { serviceOfferings } from '../data/siteContent';

const ConsultingPage = () => {
  return (
    <div className="bg-white">
      <section className="bg-slate-50 py-16">
        <div className="container-gxt">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary">
            Consulting Suite
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-brand-deep">
            Export advisory, training, and brokerage enablement
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-slate-600">
            Global XT Limited equips businesses with the tools, compliance frameworks, and training
            required to launch or scale agro commodity exports confidently.
          </p>
        </div>
      </section>

      <section className="container-gxt py-16">
        <div className="grid gap-8">
          {serviceOfferings.map((service) => (
            <article
              id={service.slug}
              key={service.slug}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <h2 className="text-2xl font-semibold text-brand-deep">{service.name}</h2>
              <p className="mt-3 text-sm text-slate-600">{service.summary}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {service.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-lime" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-brand-deep py-16 text-white">
        <div className="container-gxt grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold">Custom training programs</h2>
            <p className="mt-3 text-sm text-white/80">
              We deliver workshops tailored to your team, covering export finance, documentation,
              quality systems, and supply-chain risk management. Sessions can be hosted virtually or on
              site across Nigeria and partner markets.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold text-white">Book a strategy call</h3>
            <p className="mt-3 text-sm text-white/70">
              Share your current export goals and challenges. We will prepare a tailored roadmap and
              next-step recommendations.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-brand-deep hover:bg-brand-lime"
              >
                Schedule consultation
              </Link>
              <a
                href="https://wa.me/2348032310051"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white hover:border-white"
              >
                Quick WhatsApp chat
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConsultingPage;
