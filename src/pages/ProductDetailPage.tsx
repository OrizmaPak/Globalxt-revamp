import { Link, useParams } from 'react-router-dom';
import { useContent } from '../context/ContentProvider';
import image from '../assets/image3.jpg';
import Breadcrumb from '../components/Breadcrumb';
import AddToEnquiryButton from '../components/AddToEnquiryButton';
import { useState } from 'react';
import type { Product } from '../types/content';

const ProductDetailPage = () => {
  const { categorySlug, productSlug } = useParams();
  const { content } = useContent();
  const productCategories = content?.productCategories ?? [];
  const heroBg = content?.pageImages?.defaultHero ?? image;
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
      <section className="relative overflow-hidden py-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroBg})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-lime/95 via-brand-chartreuse/90 to-transparent" />
        <div className="container-gxt relative z-10">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary">
            {category.name}
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-brand-deep">{product.name}</h1>
          <p className="mt-4 max-w-3xl text-sm text-slate-600">{product.summary}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-600">
            {product.origins.map((origin) => (
              <span key={origin} className="rounded-full border border-slate-300 px-3 py-1">
                Origin: {origin}
              </span>
            ))}
          </div>
        </div>
      </section>
      <Breadcrumb />

      <section className="container-gxt grid gap-8 py-16 lg:grid-cols-[320px,1fr,0.8fr] lg:items-start">
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
        {/* Quote/Contact Aside with Gallery at the Top */}
        <aside className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-start-3">
          {/* Gallery Section */}
          <GalleryInAside product={product} />
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
              href={`mailto:${'hello@globalxtlimited.com'}?subject=${encodeURIComponent('Product Inquiry - ' + product.name)}`}
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
  const [mainImg, setMainImg] = useState(product.image);
  // Simulate 10 images by duplicating the main image
  const images = Array(10).fill(product.image);
  return (
    <div className="mb-6">
      <h2 className="text-base font-semibold text-brand-deep mb-3">Gallery</h2>
      <div className="flex flex-col gap-3 items-center">
        <img
          src={mainImg}
          alt={product.name}
          className="rounded-2xl object-cover max-h-56 w-full border border-slate-200 shadow-md mb-2"
        />
        <div className="flex flex-wrap gap-2 justify-center">
          {images.map((img, idx) => (
            <img
              key={idx}
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
