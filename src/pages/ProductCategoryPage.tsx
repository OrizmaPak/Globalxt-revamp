import { Link, useParams } from 'react-router-dom';
import ImageWithFallback from '../components/ImageWithFallback';
import { productCategories } from '../data/siteContent';

const ProductCategoryPage = () => {
  const { categorySlug } = useParams();
  const category = productCategories.find((item) => item.slug === categorySlug);

  if (!category) {
    return (
      <div className="container-gxt py-24 text-center">
        <h1 className="text-2xl font-semibold text-brand-deep">Category not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The category you are looking for does not exist. Please explore our full catalog.
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
        <div className="relative h-72 w-full">
          <ImageWithFallback src={category.heroImage} alt={category.name} />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-deep via-brand-deep/70 to-brand-deep/40" />
        </div>
        <div className="absolute inset-0 bg-brand-deep/60" />
        <div className="relative py-14 text-white">
          <div className="container-gxt">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-yellow">
              {category.name}
            </span>
            <h1 className="mt-4 text-3xl font-semibold">{category.tagline}</h1>
            <p className="mt-4 max-w-3xl text-sm text-white/80">{category.summary}</p>
          </div>
        </div>
      </section>

      <section className="container-gxt py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {category.highlights.map((highlight) => (
            <div key={highlight} className="rounded-3xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-600">
              {highlight}
            </div>
          ))}
        </div>
      </section>

      <section className="container-gxt pb-16">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-2xl font-semibold text-brand-deep">Available products</h2>
          <p className="mx-auto max-w-3xl text-sm text-slate-600">
            Each product profile is structured for dynamic loading. When your application connects to the
            live endpoint, the UI automatically hydrates with real-time specs and pricing.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {category.products.map((product) => (
            <Link
              key={product.slug}
              to={`/products/${category.slug}/${product.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand-lime hover:shadow-lg"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback src={product.image} alt={product.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/40 via-transparent to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-semibold text-brand-deep group-hover:text-brand-primary">
                  {product.name}
                </h3>
                <p className="mt-2 flex-1 text-sm text-slate-600">{product.summary}</p>
                <span className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
                  View specs
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductCategoryPage;
