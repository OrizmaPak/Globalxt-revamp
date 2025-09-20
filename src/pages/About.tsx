import { Link } from 'react-router-dom';
import { companyInfo, serviceOfferings } from '../data/siteContent';

const AboutPage = () => {
  return (
    <div className="bg-white">
      <section className="bg-slate-50 py-16">
        <div className="container-gxt">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary">
            About Global XT
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-brand-deep">From local aggregators to global export partners</h1>
          <p className="mt-4 max-w-3xl text-sm text-slate-600">
            Since inception, Global XT Limited has bridged trusted African producers with global food
            and manufacturing companies. We combine on-ground sourcing expertise, quality assurance,
            and export compliance to deliver commodities that meet international standards.
          </p>
        </div>
      </section>

      <section id="company" className="container-gxt py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-2xl font-semibold text-brand-deep">Our Company</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Registered in Nigeria (RC {companyInfo.rcNumber}) with export license {companyInfo.exportLicense},
              Global XT Limited manages a portfolio of agro commodities spanning spices, grains, nuts,
              botanicals, and natural oils. We operate a distributed network of aggregation hubs across
              Nigeria ensuring farm-level traceability and seasonally aligned supply.
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Our export desk coordinates inspection, documentation, and freight across major Nigerian
              ports including Lagos and Port Harcourt. We work with SGS, Bureau Veritas, and other
              internationally recognized inspection agencies to certify every shipment.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-brand-deep">Corporate Facts</h3>
            <dl className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-brand-deep">Registered Name</dt>
                <dd>Global XT Limited</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-brand-deep">Head Offices</dt>
                <dd>{companyInfo.address}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-brand-deep">Trading Focus</dt>
                <dd>Agro commodities, training, and export consulting</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-brand-deep">Operational Footprint</dt>
                <dd>West Africa supply clusters with global buyer network</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section id="vision" className="bg-slate-50 py-16">
        <div className="container-gxt grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-brand-deep">Vision & Mission</h2>
            <div className="mt-6 space-y-6">
              <div className="rounded-3xl border border-brand-lime/30 bg-white p-6">
                <h3 className="text-lg font-semibold text-brand-primary">Vision</h3>
                <p className="mt-2 text-sm text-slate-600">
                  To be Africa's most reliable partner for sourcing, processing, and exporting agro
                  commodities that power sustainable value chains worldwide.
                </p>
              </div>
              <div className="rounded-3xl border border-brand-lime/30 bg-white p-6">
                <h3 className="text-lg font-semibold text-brand-primary">Mission</h3>
                <p className="mt-2 text-sm text-slate-600">
                  We empower growers, processors, and buyers with transparent data, finance-friendly
                  documentation, and agile logistics so they can scale confidently in global markets.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-100 bg-white p-6">
            <h3 className="text-lg font-semibold text-brand-deep">Core Values</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {[
                'Integrity and transparency in every trade lane.',
                'Quality obsession backed by data-driven monitoring.',
                'Partnership mindset with growers, processors, and buyers.',
                'Sustainability through responsible sourcing and farmer empowerment.',
              ].map((value) => (
                <li key={value} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-lime" />
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="team" className="container-gxt py-16">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold text-brand-deep">Leadership</h2>
          <p className="mt-4 text-sm text-slate-600">
            Our leadership team blends export compliance, commodity trading, and logistics operations
            experience. Detailed profiles and governance structure can be shared upon request as part of
            due diligence packs.
          </p>
        </div>
        <div className="mt-8 rounded-3xl border border-slate-100 bg-slate-50 p-8 text-sm text-slate-600">
          <p>
            Interested investors and partners can request our latest corporate profile, organizational
            chart, and ESG framework.
          </p>
          <Link
            to="/contact"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white hover:bg-brand-lime"
          >
            Request profile pack
          </Link>
        </div>
      </section>

      <section className="bg-brand-deep py-16 text-white">
        <div className="container-gxt grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold">Expert advisory for export-ready organizations</h2>
            <p className="mt-3 text-sm text-white/80">
              Our consulting practice guides companies through export readiness assessments, trade
              license registration, and hands-on training.
            </p>
          </div>
          <div className="grid gap-4">
            {serviceOfferings.map((service) => (
              <div key={service.slug} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                <p className="mt-2 text-sm text-white/80">{service.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
