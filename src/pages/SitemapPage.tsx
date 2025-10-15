import image from '../assets/image3.jpg';
import { useContent } from '../context/ContentProvider';
import Breadcrumb from '../components/Breadcrumb';
import SEO from '../components/SEO';
import { canonicalForPath } from '../utils/seo';

const SitemapPage = () => {
  const { content } = useContent();
  const heroBg = content?.pageImages?.defaultHero ?? image;
  return (
    <div className="relative overflow-hidden py-16">
      <SEO
        title="Sitemap | Global XT Limited"
        description="HTML sitemap overview."
        pathname={'/sitemap'}
        canonical={canonicalForPath('/sitemap')}
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
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary" data-content-path="pageCopy.sitemap.hero.badge">Sitemap</span>
        <h1 className="text-3xl font-semibold text-brand-deep" data-content-path="pageCopy.sitemap.hero.title">Sitemap</h1>
        <p className="mt-4 max-w-3xl text-sm text-slate-600" data-content-path="pageCopy.sitemap.hero.description">
          A structured sitemap will be generated programmatically when the CMS and API are connected. Use
          this placeholder to verify navigation links in the interim build.
        </p>
      </div>
      <Breadcrumb />
    </div>
  );
};

export default SitemapPage;
