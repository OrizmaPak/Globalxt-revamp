import { Link, useParams } from 'react-router-dom';
import ImageWithFallback from '../components/ImageWithFallback';
import AddToEnquiryButton from '../components/AddToEnquiryButton';
import { useContent } from '../context/ContentProvider';
import image from '../assets/image3.jpg';
import Breadcrumb from '../components/Breadcrumb';
import SEO from '../components/SEO';
import { canonicalForPath } from '../utils/seo';

const ProductCategoryPage = () => {
  const { categorySlug } = useParams();
  const { content } = useContent();
  const productCategories = content?.productCategories ?? [];
  const heroBg = content?.pageImages?.defaultHero ?? image;
  const categoryIndex = productCategories.findIndex((item) => item.slug === categorySlug);
  const category = categoryIndex >= 0 ? productCategories[categoryIndex] : undefined;

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
      <SEO
        title={`${category.name} | Products | Global XT Limited`}
        description={category.summary}
        image={category.heroImage}
        pathname={`/products/${category.slug}`}
        canonical={canonicalForPath(`/products/${category.slug}`)}
        type="website"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Products', item: canonicalForPath('/products') },
            { '@type': 'ListItem', position: 2, name: category.name, item: canonicalForPath(`/products/${category.slug}`) },
          ],
        }}
      />
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
            data-content-path={`productCategories.${categoryIndex}.name`}
          >
            {category.name}
          </span>
          <h1
            className="mt-4 text-3xl font-semibold text-brand-deep"
            data-content-path={`productCategories.${categoryIndex}.tagline`}
          >
            {category.tagline}
          </h1>
          <p
            className="mt-4 max-w-3xl text-sm text-slate-600"
            data-content-path={`productCategories.${categoryIndex}.summary`}
          >
            {category.summary}
          </p>
        </div>
      </section>
      <Breadcrumb />

      <section className="container-gxt py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {category.highlights.map((highlight, hi) => (
            <div
              key={highlight}
              className="rounded-3xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-600"
              data-content-path={`productCategories.${categoryIndex}.highlights.${hi}`}
            >
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
          {category.products.map((product, productIndex) => (
            <div
              key={product.slug}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand-lime hover:shadow-lg"
            >
              <Link
                to={`/products/${category.slug}/${product.slug}`}
                className="relative h-48 overflow-hidden"
              >
                <ImageWithFallback src={product.image} alt={product.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/70 via-brand-deep/20 to-transparent" />
              </Link>
              <div className="flex flex-1 flex-col p-6">
                <Link to={`/products/${category.slug}/${product.slug}`}>
                  <h3
                    className="text-lg font-semibold text-brand-deep group-hover:text-brand-primary"
                    data-content-path={`productCategories.${categoryIndex}.products.${productIndex}.name`}
                  >
                    {product.name}
                  </h3>
                </Link>
                <p
                  className="mt-2 flex-1 text-sm text-slate-600"
                  data-content-path={`productCategories.${categoryIndex}.products.${productIndex}.summary`}
                >
                  {product.summary}
                </p>
                
                <div className="mt-4 space-y-3">
                  <AddToEnquiryButton
                    categorySlug={category.slug}
                    productSlug={product.slug}
                    productName={product.name}
                    productImage={product.image}
                    size="md"
                    className="w-full justify-center"
                    showSuccessMessage={false}
                  />
                  <Link
                    to={`/products/${category.slug}/${product.slug}`}
                    className="block text-center text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary hover:text-brand-deep"
                  >
                    View specs →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductCategoryPage;
