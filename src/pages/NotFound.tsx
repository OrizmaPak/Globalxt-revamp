import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-white text-center">
      <h1 className="text-4xl font-semibold text-brand-deep">Page not found</h1>
      <p className="mt-4 max-w-md text-sm text-slate-600">
        The page you requested could not be located. Please return home or explore our product catalog.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:bg-brand-lime"
        >
          Go home
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-full border border-brand-primary px-6 py-3 text-sm font-semibold text-brand-primary hover:bg-brand-lime/10"
        >
          View products
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
