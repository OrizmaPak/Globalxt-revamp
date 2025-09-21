import { Link, useLocation } from 'react-router-dom';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex py-4 px-4 sm:px-8 text-sm text-gray-500" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link to="/" className="inline-flex items-center text-brand-primary hover:underline font-semibold">
            Home
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          return (
            <li key={to} className="inline-flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              {isLast ? (
                <span className="text-brand-deep font-semibold">{capitalize(decodeURIComponent(value))}</span>
              ) : (
                <Link to={to} className="text-brand-primary hover:underline">
                  {capitalize(decodeURIComponent(value))}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
