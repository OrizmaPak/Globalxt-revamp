import { Link } from 'react-router-dom';
import ImageWithFallback from '../components/ImageWithFallback';
import { useContent } from '../context/ContentProvider';
import image from '../assets/image3.jpg';
import Breadcrumb from '../components/Breadcrumb';

const ProductsPage = () => {
  const title = 'Products | Global XT Limited';
  const desc = 'Explore our core agro commodity categories with specifications, origins, and packaging options.';
  const { content } = useContent();
  const productCategories = content?.productCategories ?? [];
  const heroBg = content?.pageImages?.defaultHero ?? image;
  return (
    <div className="bg-white">
      <SEO title={title} description={desc} pathname={'/products'} canonical={canonicalForPath('/products')} type="website" />
      <section className="relative overflow-hidden py-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroBg})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-lime/95 via-brand-chartreuse/90 to-transparent" />
        <div className="container-gxt relative z-10">
          <span
            className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary"
            data-content-path="pageCopy.products.hero.badge"
          >
            Our Products
          </span>
          <h1
            className="mt-4 text-3xl font-semibold text-brand-deep"
            data-content-path="pageCopy.products.hero.title"
          >
            Curated agro commodities portfolio
          </h1>
          <p
            className="mt-4 max-w-3xl text-sm text-slate-600"
            data-content-path="pageCopy.products.hero.description"
          >
            Each category is structured to be data-driven. Once connected to our API, your storefront or
            ERP can instantly consume product metadata, specifications, logistics notes, and imagery.
          </p>
        </div>
      </section>
      <Breadcrumb />

      <section className="container-gxt py-16">
        <div className="grid gap-8">
          {productCategories.map((category, categoryIndex) => (
            <article
              key={category.slug}
              className="grid gap-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:grid-cols-[1.2fr,0.8fr] lg:items-center"
            >
              <div>
                <h2
                  className="text-2xl font-semibold text-brand-deep"
                  data-content-path={`productCategories.${categoryIndex}.name`}
                >
                  {category.name}
                </h2>
                <p
                  className="mt-2 text-sm text-slate-600"
                  data-content-path={`productCategories.${categoryIndex}.summary`}
                >
                  {category.summary}
                </p>
                <ul className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                  {category.highlights.map((highlight, hi) => (
                    <li
                      key={highlight}
                      className="rounded-2xl bg-slate-50 px-3 py-2"
                      data-content-path={`productCategories.${categoryIndex}.highlights.${hi}`}
                    >
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
                    <span data-content-path="pageCopy.products.hero.primaryCta">View category overview</span>
                  </Link>
                  <Link
                    to={`/products/${category.slug}/${category.products[0]?.slug ?? ''}`}
                    className="inline-flex items-center gap-2 rounded-full border border-brand-primary px-5 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-lime/10"
                  >
                    <span data-content-path="pageCopy.products.hero.secondaryCta">Open sample product</span>
                  </Link>
                </div>
              </div>
              <div className="relative h-64 overflow-hidden rounded-3xl">
                <ImageWithFallback src={category.heroImage} alt={category.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/70 via-brand-deep/20 to-transparent" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
import SEO from '../components/SEO';
import { canonicalForPath } from '../utils/seo';
