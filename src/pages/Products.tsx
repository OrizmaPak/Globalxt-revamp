import { Link } from 'react-router-dom';
import ImageWithFallback from '../components/ImageWithFallback';
import { productCategories } from '../data/siteContent';

const ProductsPage = () => {
  return (
    <div className="bg-white">
      <section className="bg-slate-50 py-16">
        <div className="container-gxt">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary">
            Our Products
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-brand-deep">Curated agro commodities portfolio</h1>
          <p className="mt-4 max-w-3xl text-sm text-slate-600">
            Each category is structured to be data-driven. Once connected to our API, your storefront or
            ERP can instantly consume product metadata, specifications, logistics notes, and imagery.
          </p>
        </div>
      </section>

      <section className="container-gxt py-16">
        <div className="grid gap-8">
          {productCategories.map((category) => (
            <article
              key={category.slug}
              className="grid gap-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:grid-cols-[1.2fr,0.8fr] lg:items-center"
            >
              <div>
                <h2 className="text-2xl font-semibold text-brand-deep">{category.name}</h2>
                <p className="mt-2 text-sm text-slate-600">{category.summary}</p>
                <ul className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                  {category.highlights.map((highlight) => (
                    <li key={highlight} className="rounded-2xl bg-slate-50 px-3 py-2">
                      {highlight}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-500">
                  {category.products.slice(0, 6).map((product) => (
                    <Link
                      key={product.slug}
                      to={`/products/${category.slug}/${product.slug}`}
                      className="rounded-full border border-brand-lime/40 px-3 py-1 font-semibold text-brand-primary hover:border-brand-lime"
                    >
                      {product.name}
                    </Link>
                  ))}
                  {category.products.length > 6 && (
                    <span className="rounded-full border border-dashed border-slate-200 px-3 py-1 text-brand-primary/60">
                      + {category.products.length - 6} more
                    </span>
                  )}
                </div>
                <div className="mt-6 flex gap-3">
                  <Link
                    to={`/products/${category.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white hover:bg-brand-lime"
                  >
                    View category overview
                  </Link>
                  <Link
                    to={`/products/${category.slug}/${category.products[0]?.slug ?? ''}`}
                    className="inline-flex items-center gap-2 rounded-full border border-brand-primary px-5 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-lime/10"
                  >
                    Open sample product
                  </Link>
                </div>
              </div>
              <div className="relative h-64 overflow-hidden rounded-3xl">
                <ImageWithFallback src={category.heroImage} alt={category.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/40 via-transparent to-transparent" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
