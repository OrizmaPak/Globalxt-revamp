import { Link, useParams } from 'react-router-dom';
import ImageWithFallback from '../components/ImageWithFallback';
import { productCategories } from '../data/siteContent';

const ProductDetailPage = () => {
  const { categorySlug, productSlug } = useParams();
  const category = productCategories.find((item) => item.slug === categorySlug);
  const product = category?.products.find((item) => item.slug === productSlug);

  if (!category || !product) {
    return (
      <div className="container-gxt py-24 text-center">
        <h1 className="text-2xl font-semibold text-brand-deep">Product not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          Please return to the catalog and select an available product.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white hover:bg-brand-lime"
        >
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden">
        <div className="relative h-80 w-full">
          <ImageWithFallback src={product.image} alt={product.name} />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-deep via-brand-deep/70 to-brand-deep/40" />
        </div>
        <div className="absolute inset-0 bg-brand-deep/60" />
        <div className="relative py-14 text-white">
          <div className="container-gxt">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-yellow">
              {category.name}
            </span>
            <h1 className="mt-4 text-3xl font-semibold">{product.name}</h1>
            <p className="mt-4 max-w-3xl text-sm text-white/80">{product.summary}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/80">
              {product.origins.map((origin) => (
                <span key={origin} className="rounded-full border border-white/30 px-3 py-1">
                  Origin: {origin}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-gxt grid gap-8 py-16 lg:grid-cols-[1.2fr,0.8fr] lg:items-start">
        <div>
          <h2 className="text-xl font-semibold text-brand-deep">Product overview</h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">{product.description}</p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
              <h3 className="text-sm font-semibold text-brand-deep">Specifications</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {product.specifications.map((spec) => (
                  <li key={spec}>{spec}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
              <h3 className="text-sm font-semibold text-brand-deep">Packaging</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {product.packaging.map((pack) => (
                  <li key={pack}>{pack}</li>
                ))}
              </ul>
            </div>
            {product.logistics && (
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
                <h3 className="text-sm font-semibold text-brand-deep">Logistics</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {product.logistics.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {product.applications && (
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
                <h3 className="text-sm font-semibold text-brand-deep">Applications</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {product.applications.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <aside className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-deep">Ready to request a quote?</h2>
          <p className="mt-3 text-sm text-slate-600">
            Provide your product specs, target volumes, and INCOTERM preference. Our commercial team
            will respond with pricing, lead times, and documentation requirements.
          </p>
          <div className="mt-6 space-y-3">
            <Link
              to="/contact"
              className="block rounded-full bg-brand-primary px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-lime"
            >
              Request a quote
            </Link>
            <Link
              to={`/products/${category.slug}`}
              className="block rounded-full border border-brand-primary px-5 py-3 text-center text-sm font-semibold text-brand-primary hover:bg-brand-lime/10"
            >
              View category overview
            </Link>
            <a
              href={`mailto:${'hello@globalxtlimited.com'}?subject=${encodeURIComponent('Product Inquiry - ' + product.name)}`}
              className="block rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-600 hover:border-brand-primary hover:text-brand-primary"
            >
              Email product team
            </a>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default ProductDetailPage;
