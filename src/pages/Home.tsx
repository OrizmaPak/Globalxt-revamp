import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel';
import ImageWithFallback from '../components/ImageWithFallback';
import { useContent } from '../context/ContentProvider';
import {
  ShieldCheckIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  SparklesIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';

const iconRegistry = {
  ShieldCheckIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  SparklesIcon,
};
const highlightMetrics = [
  { value: '45+', label: 'Agro SKUs', description: 'Seasonally curated commodities from spices, grains, nuts, oils, and botanicals.' },
  { value: '18', label: 'Export Destinations', description: 'Active shipments supported across Europe, Asia, and the Middle East.' },
  { value: '72h', label: 'Quote Turnaround', description: 'Average response time for compliant pricing and documentation packs.' },
];


const HomePage = () => {
  const { content } = useContent();
  const companyInfo = content?.companyInfo ?? { whatsapp: '', phone: '' } as any;
  const productCategories = content?.productCategories ?? [];
  const industrySegments = content?.industrySegments ?? [];
  const whyChooseUs = content?.whyChooseUs ?? [];
  const resourceArticles = content?.resourceArticles ?? [];
  return (
    <div className="bg-white">
      <HeroCarousel />

      <section className="relative -mt-4 py-20 sm:-mt-6">
        <div className="px-0 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-none border border-brand-primary/20 bg-white/95 px-6 py-12 shadow-[0_45px_140px_-70px_rgba(12,54,24,0.5)] backdrop-blur sm:rounded-[2.75rem] sm:px-12">
              <div className="pointer-events-none absolute -left-32 top-[-140px] h-64 w-64 rounded-full bg-brand-chartreuse/18 blur-3xl" />
              <div className="pointer-events-none absolute bottom-[-160px] right-[-120px] h-72 w-72 rounded-full bg-brand-primary/12 blur-3xl" />
              <div className="relative grid gap-10 lg:grid-cols-[1.4fr,0.6fr]">
                <div className="space-y-7">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-brand-primary">
                    Export Excellence
                  </span>
                  <h2 className="text-3xl font-semibold text-brand-deep sm:text-4xl">
                    Precision sourcing, intelligence-led trading, and compliant logistics for ambitious agro brands.
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-slate-600">
                    We orchestrate farmer aggregation, processing oversight, inspection, and global fulfilment so that partners can focus on market growth. Each programme is built on transparent data, predictable lead times, and audit-ready documentation.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      'Field-to-port visibility with digitally signed quality checkpoints.',
                      'Dedicated compliance desk managing export permits, SGS, and phytosanitary certificates.',
                      'Structured finance and hedging advisory for high-volume transactions.',
                      'Arrival support with buyer onboarding playbooks in 18 destinations.',
                    ].map((line) => (
                      <div key={line} className="flex items-start gap-3 rounded-2xl border border-brand-primary/30 bg-white/70 p-4 text-sm text-slate-600 shadow-sm transition hover:border-brand-primary hover:bg-brand-lime/10">
                        <CheckCircleIcon className="mt-1 h-5 w-5 flex-shrink-0 text-brand-primary" />
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-lime"
                    >
                      Request a discovery call
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                    <a
                      href={`https://wa.me/${companyInfo.whatsapp.replace('+', '')}`}
                      className="inline-flex items-center gap-2 rounded-full border border-brand-primary px-6 py-3 text-sm font-semibold text-brand-primary transition hover:bg-brand-lime/10"
                    >
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
                <div className="flex flex-col gap-5 rounded-[2rem] border border-brand-primary/25 bg-white/80 p-6 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.6rem] font-semibold uppercase tracking-[0.42em] text-brand-primary">Core categories</span>
                    <div className="text-[0.6rem] uppercase tracking-[0.34em] text-brand-primary/60">API ready</div>
                  </div>
                  <div className="max-h-fit space-y-3 overflow-y-auto pr-1">
                    {productCategories.map((category) => (
                      <Link
                        key={category.slug}
                        to={`/products/${category.slug}`}
                        className="group flex flex-col items-center justify-between rounded-2xl border border-transparent bg-white px-4 py-3 text-sm text-brand-deep transition hover:border-brand-primary/40 hover:bg-brand-lime/10"
                      >
                        <div className="w-full flex justify-center">
                          <div className="w-full max-w-xs h-32 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-center">
                            <ImageWithFallback src={category.heroImage} alt={category.name} className="w-full h-full object-contain" />
                          </div>
                        </div>
                        <div className="mt-3 w-full text-left">
                          <p className="font-semibold text-brand-deep group-hover:text-brand-primary truncate">{category.name}</p>
                          <p className="text-xs text-slate-500 group-hover:text-brand-primary/70 truncate">{category.tagline}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
                {highlightMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-3xl border border-brand-primary/20 bg-white/80 p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-brand-primary hover:shadow-lg"
                  >
                    <p className="text-3xl font-semibold text-brand-deep">{metric.value}</p>
                    <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500">{metric.label}</p>
                    <p className="mt-2 text-xs text-slate-500">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container-gxt">
          <div className="flex flex-col gap-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary">
              Product Universe
            </span>
            <h2 className="text-3xl font-semibold text-brand-deep">Trusted agro commodities</h2>
            <p className="mx-auto max-w-3xl text-sm text-slate-600">
              Our structured data layer enables quick integration with your ERP or marketplace. Each
              product profile includes specifications, origin traceability, and logistics notes for a
              frictionless onboarding when you switch to live API feeds.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {productCategories.map((category) => (
              <Link
                key={category.slug}
                to={`/products/${category.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback src={category.heroImage} alt={category.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/70 via-brand-deep/30 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold text-brand-deep group-hover:text-brand-primary">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{category.summary}</p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-500">
                    {category.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-lime" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
                    Browse catalog
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-gxt py-16">
        <div className="flex flex-col gap-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary">
            Industries
          </span>
          <h2 className="text-3xl font-semibold text-brand-deep">Who we serve</h2>
          <p className="mx-auto max-w-3xl text-sm text-slate-600">
            From FMCG brands to commodity brokers, we plug into your operations as an extension of
            your sourcing, QA, and logistics teams.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {industrySegments.map((segment) => (
            <div
              key={segment.slug}
              className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-lime hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <BuildingOffice2Icon className="h-8 w-8 text-brand-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-brand-deep">{segment.name}</h3>
                  <p className="text-sm text-slate-500">{segment.summary}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {segment.opportunities.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-lime" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 py-16 text-white">
        <div className="container-gxt">
          <div className="flex flex-col gap-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-yellow">
              Why Global XT
            </span>
            <h2 className="text-3xl font-semibold text-white">
              Designed for compliance, speed, and trust
            </h2>
            <p className="mx-auto max-w-3xl text-sm text-white/70">
              Every engagement is anchored on measurable quality benchmarks and transparent
              communication so you can trade with confidence.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item) => {
              const Icon = iconRegistry[item.icon as keyof typeof iconRegistry] ?? ShieldCheckIcon;
              return (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <Icon className="h-8 w-8 text-brand-yellow" />
                  <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-gxt py-16">
        <div className="flex flex-col gap-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary">
            Insights
          </span>
          <h2 className="text-3xl font-semibold text-brand-deep">Latest resources</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {resourceArticles.map((article) => (
            <div
              key={article.slug}
              className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary">
                {article.category}
              </p>
              <h3 className="mt-4 text-lg font-semibold text-brand-deep">{article.title}</h3>
              <p className="mt-3 flex-1 text-sm text-slate-600">{article.summary}</p>
              <p className="mt-4 text-xs text-slate-400">{article.publishedOn}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 rounded-full border border-brand-primary px-6 py-3 text-sm font-semibold text-brand-primary transition hover:bg-brand-lime/10"
          >
            Visit the knowledge hub
          </Link>
        </div>
      </section>

      <section className="bg-brand-deep py-16 text-white">
        <div className="container-gxt flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
          <div>
            <h2 className="text-3xl font-semibold">Ready to co-create your supply strategy?</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/80">
              Book a consultation to align on product specifications, shipment schedules, and
              documentation workflows tailored to your business.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/consulting"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-deep shadow-md transition hover:bg-brand-lime hover:text-brand-deep"
            >
              Explore our consulting suite
            </Link>
            <a
              href={`tel:${companyInfo.phone}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
            >
              Call {companyInfo.phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

