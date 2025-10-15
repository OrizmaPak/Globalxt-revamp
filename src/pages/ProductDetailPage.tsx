import { Link, useParams } from 'react-router-dom';
import { useContent } from '../context/ContentProvider';
import image from '../assets/image3.jpg';
import Breadcrumb from '../components/Breadcrumb';
import AddToEnquiryButton from '../components/AddToEnquiryButton';
import { useEffect, useState } from 'react';
import type { Product } from '../types/content';
import SEO from '../components/SEO';
import { canonicalForPath } from '../utils/seo';

const ProductDetailPage = () => {
  const { categorySlug, productSlug } = useParams();
  const { content } = useContent();
  const productCategories = content?.productCategories ?? [];
  const heroBg = content?.pageImages?.defaultHero ?? image;
  const categoryIndex = productCategories.findIndex((item) => item.slug === categorySlug);
  const category = categoryIndex >= 0 ? productCategories[categoryIndex] : undefined;
  const productIndex = category ? category.products.findIndex((item) => item.slug === productSlug) : -1;
  const product = productIndex >= 0 && category ? category.products[productIndex] : undefined;
  const [layout, setLayout] = useState<'classic' | 'full'>('classic');

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
      <SEO
        title={`${product.name} | ${category.name} | Global XT Limited`}
        description={product.summary}
        image={product.image}
        pathname={`/products/${category.slug}/${product.slug}`}
        canonical={canonicalForPath(`/products/${category.slug}/${product.slug}`)}
        type="product"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.summary,
          image: product.images && product.images.length ? product.images : [product.image],
          brand: {
            '@type': 'Organization',
            name: (content as any)?.companyInfo?.name || 'Global XT Limited',
          },
          category: category.name,
          url: canonicalForPath(`/products/${category.slug}/${product.slug}`),
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
            data-content-path={`productCategories.${categoryIndex}.products.${productIndex}.name`}
          >
            {product.name}
          </h1>
          <p
            className="mt-4 max-w-3xl text-sm text-slate-600"
            data-content-path={`productCategories.${categoryIndex}.products.${productIndex}.summary`}
          >
            {product.summary}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-600">
            {product.origins.map((origin, originIndex) => (
              <span key={origin} className="rounded-full border border-slate-300 px-3 py-1">
                Origin: <span data-content-path={`productCategories.${categoryIndex}.products.${productIndex}.origins.${originIndex}`}>{origin}</span>
              </span>
            ))}
          </div>
        </div>
      </section>
      <Breadcrumb />

      <section className="container-gxt grid gap-8 py-8 lg:grid-cols-[320px,1fr,0.8fr] lg:items-start">
        {/* Sidebar */}
        <aside className="order-1 lg:order-none rounded-3xl border border-slate-100 bg-white p-6 shadow-sm mb-8 lg:mb-0 lg:sticky lg:top-28 lg:max-h-[80vh] lg:overflow-y-auto">
          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary mb-2">Categories</h3>
            <ul className="space-y-1 mb-6">
              {productCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/products/${cat.slug}`}
                    className={`block rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${cat.slug === category.slug ? 'bg-brand-lime/20 text-brand-primary' : 'text-brand-deep hover:bg-brand-lime/10'}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Products in Category */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary mb-2">{category.name} Products</h3>
            <ul className="space-y-1">
              {category.products.map((prod) => (
                <li key={prod.slug}>
                  <Link
                    to={`/products/${category.slug}/${prod.slug}`}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${prod.slug === product.slug ? 'bg-brand-primary text-white' : 'text-brand-deep hover:bg-brand-primary/10'}`}
                  >
                    {prod.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        {/* Main Content */}
        <div className="lg:col-start-2">
          <h2 className="text-xl font-semibold text-brand-deep">Product overview</h2>
          <p
            className="mt-4 text-sm leading-6 text-slate-600"
            data-content-path={`productCategories.${categoryIndex}.products.${productIndex}.description`}
          >
            {product.description}
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
              <h3 className="text-sm font-semibold text-brand-deep">Specifications</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {product.specifications.map((spec, specIndex) => (
                  <li key={spec} data-content-path={`productCategories.${categoryIndex}.products.${productIndex}.specifications.${specIndex}`}>{spec}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
              <h3 className="text-sm font-semibold text-brand-deep">Packaging</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {product.packaging.map((pack, pIndex) => (
                  <li key={pack} data-content-path={`productCategories.${categoryIndex}.products.${productIndex}.packaging.${pIndex}`}>{pack}</li>
                ))}
              </ul>
            </div>
            {product.logistics && (
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
                <h3 className="text-sm font-semibold text-brand-deep">Logistics</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {product.logistics.map((item, lIndex) => (
                    <li key={item} data-content-path={`productCategories.${categoryIndex}.products.${productIndex}.logistics.${lIndex}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {product.applications && (
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
                <h3 className="text-sm font-semibold text-brand-deep">Applications</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {product.applications.map((item, aIndex) => (
                    <li key={item} data-content-path={`productCategories.${categoryIndex}.products.${productIndex}.applications.${aIndex}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        {/* Quote/Contact Aside with Gallery at the Top */}
        <aside className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-start-3">
          {/* Gallery Section */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-brand-deep">Images</h2>
            <div className="flex items-center gap-1" role="group" aria-label="Gallery layout">
              <button
                type="button"
                onClick={() => setLayout('classic')}
                className={`h-8 w-8 rounded-lg border flex items-center justify-center transition ${layout === 'classic' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-primary/50 hover:text-brand-primary'}`}
                title="Box grid"
                aria-label="Box grid"
              >
                {/* 2x2 grid icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="3" y="3" width="8" height="8" rx="1"/>
                  <rect x="13" y="3" width="8" height="8" rx="1"/>
                  <rect x="3" y="13" width="8" height="8" rx="1"/>
                  <rect x="13" y="13" width="8" height="8" rx="1"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setLayout('full')}
                className={`h-8 w-8 rounded-lg border flex items-center justify-center transition ${layout === 'full' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-primary/50 hover:text-brand-primary'}`}
                title="Full horizontal grid"
                aria-label="Full horizontal grid"
              >
                {/* stacked rows icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="4" rx="1"/>
                  <rect x="3" y="10" width="18" height="4" rx="1"/>
                  <rect x="3" y="16" width="18" height="4" rx="1"/>
                </svg>
              </button>
            </div>
          </div>
          {layout === 'classic' ? (
            <GalleryInAside product={product} />
          ) : (
            <FullImagesAside product={product} />
          )}
          <h2 className="text-lg font-semibold text-brand-deep mt-6">Ready to request a quote?</h2>
          <p className="mt-3 text-sm text-slate-600">
            Provide your product specs, target volumes, and INCOTERM preference. Our commercial team
            will respond with pricing, lead times, and documentation requirements.
          </p>
          <div className="mt-6 space-y-3">
            <AddToEnquiryButton
              categorySlug={categorySlug!}
              productSlug={productSlug!}
              productName={product.name}
              productImage={product.image}
              size="lg"
              className="w-full justify-center"
            />
            <Link
              to="/contact"
              className="block rounded-full bg-brand-chartreuse px-5 py-3 text-center text-sm font-semibold text-brand-deep hover:bg-brand-lime"
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
              href={`mailto:${'info@globalxtltd.com'}?subject=${encodeURIComponent('Product Inquiry - ' + product.name)}`}
              className="block rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-600 hover:border-brand-primary hover:text-brand-primary"
            >
              Email product team
            </a>
          </div>
        </aside>
        {/* BottomTabs: span only main+aside columns, not sidebar */}
        <div className="lg:col-start-2 lg:col-end-4">
          <BottomTabs product={product} />
        </div>
      </section>
      {/* Bottom Tab Section */}
    </div>
  );
};

export default ProductDetailPage;

// GalleryInAside component
const GalleryInAside = ({ product }: { product: Product }) => {
  // Always include main image as part of the gallery
  const imagesCombined = [product.image, ...(((product as unknown as { images?: string[] }).images) ?? [])]
    .filter((u) => !!u && String(u).trim().length > 0);
  const images = Array.from(new Set(imagesCombined));
  const [mainImg, setMainImg] = useState(images[0]);
  useEffect(() => {
    setMainImg(images[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.slug]);
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-3 items-center">
        <img
          src={mainImg}
          alt={product.name}
          className="rounded-2xl object-cover max-h-56 w-full border border-slate-200 shadow-md mb-2"
        />
        <div className="flex flex-wrap gap-2 justify-center">
          {images.map((img, idx) => (
            <img
              key={`${img}-${idx}`}
              src={img}
              alt={`${product.name} ${idx + 1}`}
              onClick={() => setMainImg(img)}
              className={`w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-sm hover:scale-105 transition-transform cursor-pointer ${mainImg === img ? 'ring-2 ring-brand-primary' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// FullImagesAside component (layout 2 in aside)
const FullImagesAside = ({ product }: { product: Product }) => {
  const imagesCombined = [product.image, ...(((product as unknown as { images?: string[] }).images) ?? [])]
    .filter((u) => !!u && String(u).trim().length > 0);
  const images = Array.from(new Set(imagesCombined));
  if (!images.length) return null;
  return (
    <div className="mb-6">
      <div className="space-y-3">
        {images.map((src, idx) => (
          <img
            key={`${src}-${idx}`}
            src={src}
            alt={`${product.name} image ${idx + 1}`}
            className="w-full rounded-2xl border border-slate-200 shadow-sm"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
};

// BottomTabs component
const BottomTabs = ({ product }: { product: Product }) => {
  const [tab, setTab] = useState('about');
  return (
    <section className="container-gxt mt-16 mb-12">
      <div className="flex gap-2 border-b border-brand-primary/20 mb-6">
        <button
          className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors ${tab === 'about' ? 'bg-brand-primary text-white' : 'text-brand-deep hover:bg-brand-primary/10'}`}
          onClick={() => setTab('about')}
        >
          About the Product
        </button>
        <button
          className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors ${tab === 'trade' ? 'bg-brand-primary text-white' : 'text-brand-deep hover:bg-brand-primary/10'}`}
          onClick={() => setTab('trade')}
        >
          Trade Process
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm min-h-[120px]">
        {tab === 'about' ? (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-brand-deep">About the Product</h3>
            <p className="text-sm text-slate-600">{product.description}</p>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-brand-deep">Trade Process</h3>
            <p className="text-sm text-slate-600">Our trade process ensures quality, compliance, and timely delivery. (Replace this with your real trade process content.)</p>
          </div>
        )}
      </div>
    </section>
  );
};
