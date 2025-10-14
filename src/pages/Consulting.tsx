import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentProvider';
import image from '../assets/image3.jpg';
import Breadcrumb from '../components/Breadcrumb';
import heroTraining from '../assets/images/hero_training.jpg';
import heroQuality from '../assets/images/hero_quality.jpg';
import articleExports from '../assets/images/article_exports.jpg';
import heroLogistics from '../assets/images/hero_logistics.jpg';

const serviceThumb: Record<string, string> = {
  'world-class-export-consulting-service': heroLogistics,
  'export-training': heroTraining,
  'trade-licence-registrations': articleExports,
  'brokerage-program': heroQuality,
};

const ConsultingPage = () => {
  const { content } = useContent();
  const serviceOfferings = content?.serviceOfferings ?? [];
  const heroBg = content?.pageImages?.defaultHero ?? image;
  return (
    <div className="bg-white">
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
            data-content-path="pageCopy.consulting.hero.badge"
          >
            Consulting Suite
          </span>
          <h1
            className="mt-4 text-3xl font-semibold text-brand-deep"
            data-content-path="pageCopy.consulting.hero.title"
          >
            Export advisory, training, and brokerage enablement
          </h1>
          <p
            className="mt-4 max-w-3xl text-sm text-slate-600"
            data-content-path="pageCopy.consulting.hero.description"
          >
            Global XT Limited equips businesses with the tools, compliance frameworks, and training
            required to launch or scale agro commodity exports confidently.
          </p>
        </div>
      </section>
      <Breadcrumb />

      <section className="container-gxt py-16">
        <div className="grid gap-8">
          {serviceOfferings.map((service, serviceIndex) => (
            <article
              id={service.slug}
              key={service.slug}
              className="grid gap-6 overflow-hidden rounded-3xl border border-slate-100 bg-white p-0 shadow-sm sm:grid-cols-[0.6fr,1.4fr]"
            >
              <img src={serviceThumb[service.slug] ?? heroQuality} alt="Service" className="h-full w-full object-cover" />
              <div className="p-6">
                <h2
                  className="text-2xl font-semibold text-brand-deep"
                  data-content-path={`serviceOfferings.${serviceIndex}.name`}
                >
                  {service.name}
                </h2>
                <p
                  className="mt-3 text-sm text-slate-600"
                  data-content-path={`serviceOfferings.${serviceIndex}.summary`}
                >
                  {service.summary}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {service.details.map((detail, di) => (
                    <li key={detail} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-lime" />
                      <span data-content-path={`serviceOfferings.${serviceIndex}.details.${di}`}>{detail}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/consulting/${service.slug}`}
                  className="mt-5 inline-block text-sm font-semibold text-brand-primary underline"
                >
                  Learn more
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-brand-deep py-16 text-white">
        <div className="container-gxt grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold" data-content-path="pageCopy.consulting.programsTitle">Custom training programs</h2>
            <p className="mt-3 text-sm text-white/80" data-content-path="pageCopy.consulting.training.description">
              We deliver workshops tailored to your team, covering export finance, documentation,
              quality systems, and supply-chain risk management. Sessions can be hosted virtually or on
              site across Nigeria and partner markets.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold text-white" data-content-path="pageCopy.consulting.training.bookTitle">Book a strategy call</h3>
            <p className="mt-3 text-sm text-white/70" data-content-path="pageCopy.consulting.training.bookDescription">
              Share your current export goals and challenges. We will prepare a tailored roadmap and
              next-step recommendations.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-brand-deep hover:bg-brand-lime"
              >
                <span data-content-path="pageCopy.consulting.training.scheduleCta">Schedule consultation</span>
              </Link>
              <a
                href="https://wa.me/2348032310051"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white hover:border-white"
              >
                <span data-content-path="pageCopy.consulting.training.whatsappCta">Quick WhatsApp chat</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConsultingPage;
