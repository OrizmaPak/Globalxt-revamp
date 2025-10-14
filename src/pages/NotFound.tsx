import { Link } from 'react-router-dom';
import image from '../assets/image3.jpg';
import { useContent } from '../context/ContentProvider';
import Breadcrumb from '../components/Breadcrumb';

const NotFoundPage = () => {
  const { content } = useContent();
  const heroBg = content?.pageImages?.defaultHero ?? image;
  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden text-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroBg})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-lime/95 via-brand-chartreuse/90 to-transparent" />
      <div className="relative z-10 flex flex-col items-center justify-center gap-4">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary" data-content-path="pageCopy.notFound.hero.badge">Error</span>
        <h1 className="text-4xl font-semibold text-brand-deep" data-content-path="pageCopy.notFound.hero.title">Page not found</h1>
        <p className="mt-4 max-w-md text-sm text-slate-600" data-content-path="pageCopy.notFound.hero.description">
          The page you requested could not be located. Please return home or explore our product catalog.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:bg-brand-lime"
          >
            <span data-content-path="pageCopy.notFound.ctaLabel">Go home</span>
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-full border border-brand-primary px-6 py-3 text-sm font-semibold text-brand-primary hover:bg-brand-lime/10"
          >
            View products
          </Link>
        </div>
      </div>
      <Breadcrumb />
    </div>
  );
};

export default NotFoundPage;
