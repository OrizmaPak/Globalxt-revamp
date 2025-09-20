import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { resourceArticles } from '../data/siteContent';

const faqs = [
  {
    question: 'Can I integrate your product catalog via API?',
    answer:
      'Yes. This prototype uses a mocked data layer that mirrors the upcoming API structure. Once the endpoint is ready, product data, images, and metadata will hydrate dynamically.',
  },
  {
    question: 'Do you support private label packaging?',
    answer:
      'We coordinate with certified processors to deliver custom packaging formats, labeling, and documentation that align with destination market requirements.',
  },
  {
    question: 'Which INCOTERMS do you work with?',
    answer:
      'FOB, CFR, CIF, and DAP are available depending on the commodity, destination, and buyer preferences.',
  },
];

const ResourcesPage = () => {
  return (
    <div className="bg-white">
      <section className="bg-slate-50 py-16">
        <div className="container-gxt">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary">
            Knowledge Hub
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-brand-deep">Insights, guides, and market intelligence</h1>
          <p className="mt-4 max-w-3xl text-sm text-slate-600">
            Stay ahead with curated briefings, sourcing guides, and regulatory updates across the agro
            export ecosystem.
          </p>
        </div>
      </section>

      <section id="blog" className="container-gxt py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {resourceArticles.map((article) => (
            <article
              key={article.slug}
              className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary">
                {article.category}
              </p>
              <h2 className="mt-4 text-lg font-semibold text-brand-deep">{article.title}</h2>
              <p className="mt-3 flex-1 text-sm text-slate-600">{article.summary}</p>
              <p className="mt-4 text-xs text-slate-400">Published {article.publishedOn}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="faqs" className="bg-slate-50 py-16">
        <div className="container-gxt">
          <h2 className="text-2xl font-semibold text-brand-deep">Frequently asked questions</h2>
          <div className="mt-6 space-y-3">
            {faqs.map((faq) => (
              <Disclosure key={faq.question}>
                {({ open }) => (
                  <div className="rounded-3xl border border-slate-100 bg-white">
                    <Disclosure.Button className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-brand-deep">
                      <span>{faq.question}</span>
                      <ChevronDownIcon
                        className={(open ? 'rotate-180 ' : '') + 'h-5 w-5 text-brand-primary transition-transform'}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 pb-4 text-sm text-slate-600">
                      {faq.answer}
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResourcesPage;
