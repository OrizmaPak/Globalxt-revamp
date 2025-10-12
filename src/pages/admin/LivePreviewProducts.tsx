import { Link } from 'react-router-dom';
import ImageWithFallback from '../../components/ImageWithFallback';
import image from '../../assets/image3.jpg';
import Breadcrumb from '../../components/Breadcrumb';
import InlineEditWrapper from '../../components/admin/InlineEditWrapper';
import { useAdminEdit } from '../../context/AdminEditProvider';

const LivePreviewProducts = () => {
  const { editedContent, updatePageCopy, updateContent } = useAdminEdit();
  const content = editedContent;
  const productCategories = content?.productCategories ?? [];
  const heroBg = content?.pageImages?.defaultHero ?? image;

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
          <InlineEditWrapper
            value={content?.pageCopy?.products?.hero?.badge || 'Our Products'}
            onSave={(value) => updatePageCopy('products', 'hero', 'badge', value)}
            label="Products Badge"
            className="inline-block"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-primary">
              {content?.pageCopy?.products?.hero?.badge || 'Our Products'}
            </span>
          </InlineEditWrapper>

          <InlineEditWrapper
            value={content?.pageCopy?.products?.hero?.title || 'Curated agro commodities portfolio'}
            onSave={(value) => updatePageCopy('products', 'hero', 'title', value)}
            label="Products Title"
            className="mt-4 block"
          >
            <h1 className="text-3xl font-semibold text-brand-deep">
              {content?.pageCopy?.products?.hero?.title || 'Curated agro commodities portfolio'}
            </h1>
          </InlineEditWrapper>

          <InlineEditWrapper
            value={content?.pageCopy?.products?.hero?.description || 
              'Each category is structured to be data-driven. Once connected to our API, your storefront or ERP can instantly consume product metadata, specifications, logistics notes, and imagery.'}
            onSave={(value) => updatePageCopy('products', 'hero', 'description', value)}
            label="Products Description"
            editType="textarea"
            rows={3}
            className="mt-4 block"
          >
            <p className="max-w-3xl text-sm text-slate-600">
              {content?.pageCopy?.products?.hero?.description ||
                'Each category is structured to be data-driven. Once connected to our API, your storefront or ERP can instantly consume product metadata, specifications, logistics notes, and imagery.'}
            </p>
          </InlineEditWrapper>
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
                <InlineEditWrapper
                  value={category.name}
                  onSave={(value) => {
                    const updatedCategories = productCategories.map((cat, idx) => 
                      idx === categoryIndex ? { ...cat, name: value } : cat
                    );
                    updateContent('productCategories', updatedCategories);
                  }}
                  label={`Category ${categoryIndex + 1} Name`}
                  className="block"
                >
                  <h2 className="text-2xl font-semibold text-brand-deep">{category.name}</h2>
                </InlineEditWrapper>

                <InlineEditWrapper
                  value={category.summary}
                  onSave={(value) => {
                    const updatedCategories = productCategories.map((cat, idx) => 
                      idx === categoryIndex ? { ...cat, summary: value } : cat
                    );
                    updateContent('productCategories', updatedCategories);
                  }}
                  label={`Category ${categoryIndex + 1} Summary`}
                  editType="textarea"
                  rows={2}
                  className="mt-2 block"
                >
                  <p className="text-sm text-slate-600">{category.summary}</p>
                </InlineEditWrapper>

                <InlineEditWrapper
                  value={category.highlights}
                  onSave={(value) => {
                    const updatedCategories = productCategories.map((cat, idx) => 
                      idx === categoryIndex ? { 
                        ...cat, 
                        highlights: Array.isArray(value) ? value : value.split('\n').filter(Boolean) 
                      } : cat
                    );
                    updateContent('productCategories', updatedCategories);
                  }}
                  label={`Category ${categoryIndex + 1} Highlights`}
                  editType="textarea"
                  rows={4}
                  className="mt-4 block"
                >
                  <ul className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    {category.highlights.map((highlight, highlightIndex) => (
                      <li key={highlightIndex} className="rounded-2xl bg-slate-50 px-3 py-2">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </InlineEditWrapper>

                <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-500">
                  {category.products.slice(0, 6).map((product, productIndex) => (
                    <div key={product.slug} className="relative">
                      <InlineEditWrapper
                        value={product.name}
                        onSave={(value) => {
                          const updatedCategories = productCategories.map((cat, catIdx) => 
                            catIdx === categoryIndex ? {
                              ...cat,
                              products: cat.products.map((prod, prodIdx) =>
                                prodIdx === productIndex ? { ...prod, name: value } : prod
                              )
                            } : cat
                          );
                          updateContent('productCategories', updatedCategories);
                        }}
                        label={`Product ${productIndex + 1} Name`}
                        className="block"
                      >
                        <Link
                          to={`/products/${category.slug}/${product.slug}`}
                          className="rounded-full border border-brand-lime/40 px-3 py-1 font-semibold text-brand-primary hover:border-brand-lime"
                        >
                          {product.name}
                        </Link>
                      </InlineEditWrapper>
                    </div>
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
                <InlineEditWrapper
                  value={category.heroImage}
                  onSave={(value) => {
                    const updatedCategories = productCategories.map((cat, idx) => 
                      idx === categoryIndex ? { ...cat, heroImage: value } : cat
                    );
                    updateContent('productCategories', updatedCategories);
                  }}
                  label={`Category ${categoryIndex + 1} Hero Image`}
                  className="block h-full"
                >
                  <ImageWithFallback src={category.heroImage} alt={category.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/70 via-brand-deep/20 to-transparent" />
                </InlineEditWrapper>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LivePreviewProducts;