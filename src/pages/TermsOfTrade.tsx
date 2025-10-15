import image from '../assets/image3.jpg';
import { useContent } from '../context/ContentProvider';
import Breadcrumb from '../components/Breadcrumb';
import SEO from '../components/SEO';
import { canonicalForPath } from '../utils/seo';

const TermsOfTradePage = () => {
  const { content } = useContent();
  const heroBg = content?.pageImages?.defaultHero ?? image;
  return (
    <div className="relative overflow-hidden py-16">
      <SEO
        title="Terms of Trade | Global XT Limited"
        description="Terms of trade for Global XT Limited."
        pathname={'/terms'}
        canonical={canonicalForPath('/terms')}
        noindex
      />
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroBg})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-lime/95 via-brand-chartreuse/90 to-transparent" />
      <div className="container-gxt relative z-10">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary" data-content-path="pageCopy.terms.hero.badge">Terms of Trade</span>
        <h1 className="text-3xl font-semibold text-brand-deep" data-content-path="pageCopy.terms.hero.title">Terms of Trade</h1>
        <p className="mt-4 max-w-3xl text-sm text-slate-600" data-content-path="pageCopy.terms.hero.description">
          Insert contractual and commercial terms covering payment modalities, INCOTERMS, dispute
          resolution, and compliance obligations. This placeholder ensures routing works while content is
          authored.
        </p>
      </div>
      <Breadcrumb />
    </div>
  );
};

export default TermsOfTradePage;
