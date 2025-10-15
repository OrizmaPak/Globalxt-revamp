import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentProvider';
import image from '../assets/image3.jpg';
import Breadcrumb from '../components/Breadcrumb';
import { pageCopy as defaultPageCopy } from '../data/pageCopy';
import { companyInfo as defaultCompanyInfo, serviceOfferings as defaultServiceOfferings } from '../data/siteContent';
import SEO from '../components/SEO';
import { canonicalForPath } from '../utils/seo';

const tokenPattern = /{(\w+)}/g;

const AboutPage = () => {
  const { content } = useContent();
  const aboutCopy = content?.pageCopy?.about ?? defaultPageCopy.about;
  const serviceOfferings = content?.serviceOfferings ?? defaultServiceOfferings;
  const heroBg = content?.pageImages?.defaultHero ?? image;

  const fallbackContent = {
    companyInfo: defaultCompanyInfo,
    pageCopy: defaultPageCopy,
  } as const;

  const resolveContentValue = (path: string): string => {
    const readPath = (source: any) =>
      path.split('.').reduce((acc: any, key: string) => (acc == null ? undefined : acc[key]), source);

    const primary = readPath(content);
    if (typeof primary === 'string' || typeof primary === 'number') {
      return String(primary);
    }

    const fallback = readPath(fallbackContent);
    if (typeof fallback === 'string' || typeof fallback === 'number') {
      return String(fallback);
    }

    return '';
  };

  const formatWithCompanyTokens = (text: string) =>
    text.replace(tokenPattern, (_match, token) => {
      const value = resolveContentValue(`companyInfo.${token}`);
      return value || `{${token}}`;
    });

  const companyDescriptions = aboutCopy.company.description ?? [];
  const corporateFacts = aboutCopy.corporateFacts ?? [];
  const values = aboutCopy.visionMission.values ?? [];

  return (
    <div className="bg-white">
      <SEO
        title="About | Global XT Limited"
        description={aboutCopy?.hero?.description ?? "Delivering Africa's Finest Agro Products to the World"}
        pathname={'/about'}
        canonical={canonicalForPath('/about')}
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
            data-content-path="pageCopy.about.hero.badge"
          >
            {aboutCopy.hero.badge}
          </span>
          <h1
            className="mt-4 text-3xl font-semibold text-brand-deep"
            data-content-path="pageCopy.about.hero.title"
          >
            {aboutCopy.hero.title}
          </h1>
          <p
            className="mt-4 max-w-3xl text-sm text-slate-600"
            data-content-path="pageCopy.about.hero.description"
          >
            {aboutCopy.hero.description}
          </p>
        </div>
      </section>
      <Breadcrumb />

      <section id="company" className="container-gxt py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <h2
              className="text-2xl font-semibold text-brand-deep"
              data-content-path="pageCopy.about.company.title"
            >
              {aboutCopy.company.title}
            </h2>
            {companyDescriptions.map((paragraph, index) => (
              <p
                key={index}
                className="mt-4 text-sm leading-6 text-slate-600"
                data-content-path={`pageCopy.about.company.description.${index}`}
              >
                {formatWithCompanyTokens(paragraph)}
              </p>
            ))}
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3
              className="text-lg font-semibold text-brand-deep"
              data-content-path="pageCopy.about.corporateFactsTitle"
            >
              {aboutCopy.corporateFactsTitle}
            </h3>
            <dl className="mt-4 space-y-3 text-sm text-slate-600">
              {corporateFacts.map((fact, index) => {
                const labelPath = `pageCopy.about.corporateFacts.${index}.label`;
                const valuePath = fact.valuePath ?? `pageCopy.about.corporateFacts.${index}.value`;
                const factValue = fact.valuePath ? resolveContentValue(fact.valuePath) : fact.value ?? '';

                return (
                  <div key={`${fact.label}-${index}`} className="flex justify-between gap-4">
                    <dt className="font-semibold text-brand-deep" data-content-path={labelPath}>
                      {fact.label}
                    </dt>
                    <dd className="text-right" data-content-path={valuePath}>
                      {factValue}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </section>

      <section id="vision" className="bg-slate-50 py-16">
        <div className="container-gxt grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2
              className="text-2xl font-semibold text-brand-deep"
              data-content-path="pageCopy.about.visionMission.title"
            >
              {aboutCopy.visionMission.title}
            </h2>
            <div className="mt-6 space-y-6">
              <div className="rounded-3xl border border-brand-lime/30 bg-white p-6">
                <h3
                  className="text-lg font-semibold text-brand-primary"
                  data-content-path="pageCopy.about.visionMission.visionTitle"
                >
                  {aboutCopy.visionMission.visionTitle}
                </h3>
                <p
                  className="mt-2 text-sm text-slate-600"
                  data-content-path="pageCopy.about.visionMission.visionDescription"
                >
                  {aboutCopy.visionMission.visionDescription}
                </p>
              </div>
              <div className="rounded-3xl border border-brand-lime/30 bg-white p-6">
                <h3
                  className="text-lg font-semibold text-brand-primary"
                  data-content-path="pageCopy.about.visionMission.missionTitle"
                >
                  {aboutCopy.visionMission.missionTitle}
                </h3>
                <p
                  className="mt-2 text-sm text-slate-600"
                  data-content-path="pageCopy.about.visionMission.missionDescription"
                >
                  {aboutCopy.visionMission.missionDescription}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6">
            <h3
              className="text-lg font-semibold text-brand-deep"
              data-content-path="pageCopy.about.visionMission.valuesTitle"
            >
              {aboutCopy.visionMission.valuesTitle}
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {values.map((value, index) => (
                <li key={`${value}-${index}`} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-lime" />
                  <span data-content-path={`pageCopy.about.visionMission.values.${index}`}>{value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="team" className="container-gxt py-16">
        <div className="max-w-3xl">
          <h2
            className="text-2xl font-semibold text-brand-deep"
            data-content-path="pageCopy.about.leadership.title"
          >
            {aboutCopy.leadership.title}
          </h2>
          <p
            className="mt-4 text-sm text-slate-600"
            data-content-path="pageCopy.about.leadership.description"
          >
            {aboutCopy.leadership.description}
          </p>
        </div>
        <div className="mt-8 rounded-3xl border border-slate-100 bg-slate-50 p-8 text-sm text-slate-600">
          <p data-content-path="pageCopy.about.leadership.ctaDescription">
            {aboutCopy.leadership.ctaDescription}
          </p>
          <Link
            to="/contact"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white hover:bg-brand-lime"
            data-content-path="pageCopy.about.leadership.ctaLabel"
          >
            {aboutCopy.leadership.ctaLabel}
          </Link>
        </div>
      </section>

      <section className="bg-brand-deep py-16 text-white">
        <div className="container-gxt grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2
              className="text-2xl font-semibold"
              data-content-path="pageCopy.about.advisory.title"
            >
              {aboutCopy.advisory.title}
            </h2>
            <p
              className="mt-3 text-sm text-white/80"
              data-content-path="pageCopy.about.advisory.description"
            >
              {aboutCopy.advisory.description}
            </p>
          </div>
          <div className="grid gap-4">
            {serviceOfferings.map((service, index) => (
              <div key={service.slug ?? index} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h3
                  className="text-lg font-semibold text-white"
                  data-content-path={`serviceOfferings.${index}.name`}
                >
                  {service.name}
                </h3>
                <p
                  className="mt-2 text-sm text-white/80"
                  data-content-path={`serviceOfferings.${index}.summary`}
                >
                  {service.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

