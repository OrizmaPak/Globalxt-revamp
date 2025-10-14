import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useContent } from '../context/ContentProvider';
import heroTraining from '../assets/images/hero_training.jpg';
import heroQuality from '../assets/images/hero_quality.jpg';
import heroLogistics from '../assets/images/hero_logistics.jpg';
import articleExports from '../assets/images/article_exports.jpg';
import Breadcrumb from '../components/Breadcrumb';

const serviceImages: Record<string, string[]> = {
  'world-class-export-consulting-service': [heroLogistics, heroQuality, articleExports],
  'export-training': [heroTraining, heroQuality, articleExports],
  'trade-licence-registrations': [articleExports, heroQuality, heroLogistics],
  'brokerage-program': [heroLogistics, heroQuality, heroTraining],
};

const ConsultingDetailPage = () => {
  const { slug } = useParams();
  const { content } = useContent();
  const serviceOfferings = content?.serviceOfferings ?? [];
  const serviceIndex = useMemo(
    () => serviceOfferings.findIndex((s) => s.slug === slug),
    [serviceOfferings, slug]
  );
  const service = serviceIndex >= 0 ? serviceOfferings[serviceIndex] : undefined;

  const images = service ? serviceImages[service.slug] ?? [heroQuality] : [heroQuality];

  if (!service) {
    return (
      <div className="container-gxt py-24">
        <h1 className="text-2xl font-semibold text-brand-deep">Service not found</h1>
        <p className="mt-3 text-slate-600">The consulting service you’re looking for does not exist.</p>
        <Link to="/consulting" className="mt-6 inline-block text-brand-primary underline">
          Back to Consulting
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden py-16">
        <div className="container-gxt">
          <span
            className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary"
            data-content-path="pageCopy.consultingDetail.heroBadge"
          >
            Consulting
          </span>
          <h1
            className="mt-3 text-3xl font-semibold text-brand-deep"
            data-content-path={`serviceOfferings.${serviceIndex}.name`}
          >
            {service.name}
          </h1>
          <p
            className="mt-3 max-w-3xl text-sm text-slate-600"
            data-content-path={`serviceOfferings.${serviceIndex}.summary`}
          >
            {service.summary}
          </p>
        </div>
      </section>
      <Breadcrumb />

      <section className="container-gxt grid gap-8 py-10 lg:grid-cols-[1.4fr,0.6fr]">
        <article className="space-y-5 text-slate-700">
          <p>
            Global XT partners closely with stakeholders across the export value chain — farmers,
            processors, logistics providers, inspection agencies, and international buyers — to deliver
            audit‑ready programs that scale. Our approach blends on‑ground execution with data‑driven
            decision making so every milestone, from sourcing to shipment, is documented and verifiable.
          </p>
          <p>
            This service focuses on translating market requirements into workable playbooks for African
            agro commodities. We tailor our frameworks to your product mix, destination regulations, and
            financing model. Expect clear SOPs, compliance checklists, quality gates, and communication
            cadences that remove friction and reduce lead‑time variability.
          </p>
          <p>
            Engagements typically include supplier due diligence, field aggregation oversight, moisture
            and defect controls, third‑party inspections (SGS, Cotecna, Bureau Veritas), and export
            documentation support. Where required, we facilitate banking instruments and trade finance
            advisory, integrating with your internal controls to keep risk Low and throughput High.
          </p>
          <h2 className="pt-2 text-xl font-semibold text-brand-deep" data-content-path="pageCopy.consultingDetail.deliverablesTitle">Programme Deliverables</h2>
          <ul className="list-disc space-y-2 pl-6">
            {service.details.map((d, di) => (
              <li key={d} data-content-path={`serviceOfferings.${serviceIndex}.details.${di}`}>{d}</li>
            ))}
            <li>Export documentation library (NEPC, SONCAP, Phytosanitary, CO, BL/AWB).</li>
            <li>QA templates and sampling plans aligned to destination regulations.</li>
            <li>Logistics critical-path with role clarity for all parties.</li>
            <li>Weekly reporting pack with KPIs and risk register.</li>
          </ul>
          <h2 className="pt-2 text-xl font-semibold text-brand-deep" data-content-path="pageCopy.consultingDetail.whyTitle">Why Global XT</h2>
          <p>
            We combine reach across Nigeria and West Africa with disciplined execution. Our teams
            maintain long‑standing supplier relationships, enabling dependable lots at competitive
            pricing. The result is a predictable export engine that compounds value across seasons.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/contact" className="rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white">
              <span data-content-path="pageCopy.consultingDetail.ctaPrimary">Start a discovery call</span>
            </Link>
            <Link to="/consulting" className="rounded-full border border-brand-primary px-5 py-2 text-sm font-semibold text-brand-primary">
              <span data-content-path="pageCopy.consultingDetail.ctaSecondary">View all services</span>
            </Link>
          </div>
        </article>
        <aside className="grid gap-4 self-start">
          {images.map((src, i) => (
            <img key={i} src={src} alt="Consulting visual" className="w-full rounded-2xl object-cover" />
          ))}
        </aside>
      </section>
    </div>
  );
};

export default ConsultingDetailPage;
