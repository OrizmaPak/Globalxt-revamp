import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useContent } from '../context/ContentProvider';
import heroLogistics from '../assets/images/hero_logistics.jpg';
import catSeedsGrains from '../assets/images/cat_seeds_grains.jpg';
import catSpicesHerbs from '../assets/images/cat_spices_herbs.jpg';
import catNutsMore from '../assets/images/cat_nuts_more.jpg';
import Breadcrumb from '../components/Breadcrumb';

const industryImages: Record<string, string[]> = {
  fmcgs: [catSpicesHerbs, catNutsMore, catSeedsGrains],
  'agro-processors': [catSeedsGrains, heroLogistics, catNutsMore],
  'export-markets': [heroLogistics, catSeedsGrains, catSpicesHerbs],
  'commodity-brokers': [heroLogistics, catNutsMore, catSpicesHerbs],
};

const IndustryDetailPage = () => {
  const { slug } = useParams();
  const { content } = useContent();
  const industrySegments = content?.industrySegments ?? [];
  const segment = useMemo(() => industrySegments.find((i) => i.slug === slug), [industrySegments, slug]);
  const images = segment ? industryImages[segment.slug] ?? [heroLogistics] : [heroLogistics];

  if (!segment) {
    return (
      <div className="container-gxt py-24">
        <h1 className="text-2xl font-semibold text-brand-deep">Industry not found</h1>
        <p className="mt-3 text-slate-600">The industry page you requested does not exist.</p>
        <Link to="/industries" className="mt-6 inline-block text-brand-primary underline">
          Back to Industries
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden py-16">
        <div className="container-gxt">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary">
            Industries
          </span>
          <h1 className="mt-3 text-3xl font-semibold text-brand-deep">{segment.name}</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">{segment.summary}</p>
        </div>
      </section>
      <Breadcrumb />

      <section className="container-gxt grid gap-8 py-10 lg:grid-cols-[1.4fr,0.6fr]">
        <article className="space-y-5 text-slate-700">
          <p>
            Global XT integrates seamlessly with {segment.name.toLowerCase()} by aligning commodity
            specifications, logistics windows, and compliance obligations to your operating realities.
            Our programs de-risk supply through field aggregation oversight, QA checkpoints, and
            third-party inspections, while preserving cost competitiveness.
          </p>
          <p>
            We deliver transparent documentation and milestone visibility from farm to port — enabling
            faster onboarding with your internal stakeholders and downstream customers. With a
            multi-market perspective, we also advise on destination-specific regulatory changes and
            preferred inspection regimes.
          </p>
          <h2 className="pt-2 text-xl font-semibold text-brand-deep">Where We Add Value</h2>
          <ul className="list-disc space-y-2 pl-6">
            {segment.opportunities.map((o) => (
              <li key={o}>{o}</li>
            ))}
            <li>Export documentation packs tailored per shipment and destination.</li>
            <li>Quality frameworks to maintain moisture, FM, and defect thresholds.</li>
            <li>Coordinated logistics with forwarders for on-time dispatch.</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/contact" className="rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white">
              Discuss your requirements
            </Link>
            <Link to="/industries" className="rounded-full border border-brand-primary px-5 py-2 text-sm font-semibold text-brand-primary">
              View all industries
            </Link>
          </div>
        </article>
        <aside className="grid gap-4 self-start">
          {images.map((src, i) => (
            <img key={i} src={src} alt="Industry visual" className="w-full rounded-2xl object-cover" />
          ))}
        </aside>
      </section>
    </div>
  );
};

export default IndustryDetailPage;
