import image from '../assets/image3.jpg';
import { useContent } from '../context/ContentProvider';
import SEO from '../components/SEO';
import { canonicalForPath } from '../utils/seo';

const PrivacyPolicyPage = () => {
  const { content } = useContent();
  const heroBg = content?.pageImages?.defaultHero ?? image;
  return (
    <div className="relative overflow-hidden py-16">
      <SEO
        title="Privacy Policy | Global XT Limited"
        description="Global XT Limited privacy policy."
        pathname={'/privacy'}
        canonical={canonicalForPath('/privacy')}
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
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary" data-content-path="pageCopy.privacy.hero.badge">Privacy</span>
        <h1 className="text-3xl font-semibold text-brand-deep" data-content-path="pageCopy.privacy.hero.title">Privacy Policy</h1>
        <p className="mt-4 max-w-3xl text-sm text-slate-600" data-content-path="pageCopy.privacy.hero.description">
          This placeholder outlines where Global XT Limited's privacy policy will reside. Update with
          details on data collection, usage, retention, and customer rights once the live content is
          ready.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
