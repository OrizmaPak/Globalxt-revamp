import { industrySegments } from '../data/siteContent';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import image from '../assets/image3.jpg';
import Breadcrumb from '../components/Breadcrumb';

const IndustriesPage = () => {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden py-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${image})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-lime/90 via-brand-chartreuse/80 to-transparent" />
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
              className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <BuildingOffice2Icon className="h-8 w-8 text-brand-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-brand-deep">{segment.name}</h2>
                  <p className="text-sm text-slate-500">{segment.summary}</p>
                </div>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-slate-600">
                {segment.opportunities.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-lime" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default IndustriesPage;
