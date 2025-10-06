import { useContent } from '../context/ContentProvider';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import image from '../assets/image3.jpg';
import Breadcrumb from '../components/Breadcrumb';
import heroLogistics from '../assets/images/hero_logistics.jpg';
import catSeedsGrains from '../assets/images/cat_seeds_grains.jpg';
import catSpicesHerbs from '../assets/images/cat_spices_herbs.jpg';
import catNutsMore from '../assets/images/cat_nuts_more.jpg';

const industryThumb: Record<string, string> = {
  fmcgs: catSpicesHerbs,
  'agro-processors': catSeedsGrains,
  'export-markets': heroLogistics,
  'commodity-brokers': catNutsMore,
};

const IndustriesPage = () => {
  const { content } = useContent();
  const industrySegments = content?.industrySegments ?? [];
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
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary">
            Industries
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-brand-deep">Partnerships across the agro value chain</h1>
          <p className="mt-4 max-w-3xl text-sm text-slate-600">
            We collaborate with manufacturers, processors, brokers, and institutional buyers to build
            predictable supply programs with embedded risk management and documentation support.
          </p>
        </div>
      </section>
      <Breadcrumb />

      <section className="container-gxt py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {industrySegments.map((segment) => (
            <article
              id={segment.slug}
              key={segment.slug}
              className="grid h-full grid-rows-[auto,1fr] overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
            >
              <img src={industryThumb[segment.slug] ?? catSeedsGrains} alt="Industry" className="h-40 w-full object-cover" />
              <div className="flex items-center gap-3 p-6">
                <BuildingOffice2Icon className="h-8 w-8 text-brand-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-brand-deep">{segment.name}</h2>
                  <p className="text-sm text-slate-500">{segment.summary}</p>
                </div>
              </div>
              <ul className="px-6 pb-2 pt-0 space-y-3 text-sm text-slate-600">
                {segment.opportunities.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-lime" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="px-6 pb-6">
                <a href={`/industries/${segment.slug}`} className="text-sm font-semibold text-brand-primary underline">
                  Learn more
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default IndustriesPage;
