import { useEffect, useState } from 'react';
import { useContent } from '../../context/ContentProvider';
import type { ProductCategory } from '../../types/content';
import { useAdminNotifications } from '../../context/AdminNotificationProvider';
import { sanitizeForFirebase, splitByLines, uploadToCloudinary, saveContentSite } from './adminUtils';

const createEmptyCategory = (): ProductCategory => ({
  slug: '',
  name: 'New Category',
  tagline: '',
  summary: '',
  heroImage: '',
  highlights: [],
  products: [],
});

const CategoriesAdmin = () => {
  const { notify } = useAdminNotifications();
  const { content } = useContent();
  const [status, setStatus] = useState('Idle');
  const [detail, setDetail] = useState('');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (content?.productCategories) {
      const cloned = structuredClone(content.productCategories);
      setCategories(cloned);
      setSelectedIndex((prev) => {
        if (!cloned.length) return null;
        if (prev === null) return 0;
        return Math.min(prev, cloned.length - 1);
      });
    } else {
      setCategories([]);
      setSelectedIndex(null);
    }
  }, [content?.productCategories]);

  useEffect(() => {
    setSelectedIndex((prev) => {
      if (!categories.length) return null;
      if (prev === null || prev >= categories.length) return 0;
      return prev;
    });
  }, [categories.length]);

  const selectedCategory = selectedIndex !== null ? categories[selectedIndex] : null;

  const markDraft = (message = 'Unsaved changes') => {
    setStatus('Draft');
    setDetail(message);
  };

  const updateCategory = (index: number, updater: (category: ProductCategory) => void) => {
    setCategories((prev) => {
      const next = structuredClone(prev);
      updater(next[index]);
      return next;
    });
    markDraft();
  };

  const addCategory = () => {
    setCategories((prev) => [createEmptyCategory(), ...prev]);
    setSelectedIndex(0);
    markDraft('Draft category created at the top of the list.');
  };

  const removeCategory = (index: number) => {
    setCategories((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      setSelectedIndex((current) => {
        if (current === null) return next.length ? 0 : null;
        if (current === index) return next.length ? Math.min(index, next.length - 1) : null;
        if (current > index) return current - 1;
        return current;
      });
      return next;
    });
    markDraft('Category removed. Remember to save to persist the change.');
  };

  const onPickHero = async (index: number, file: File) => {
    try {
      setStatus('Uploading');
      setDetail('Uploading hero image to Cloudinary...');
      const url = await uploadToCloudinary(file);
      updateCategory(index, (category) => {
        category.heroImage = url;
      });
      setStatus('Draft');
      setDetail('Hero image uploaded. Unsaved changes pending.');
    } catch (error: any) {
      setStatus('Error');
      setDetail(error?.message ?? String(error));
    }
  };

  const save = async () => {
    try {
      setStatus('Saving');
      setDetail('Writing categories to Firestore...');
      const payload = sanitizeForFirebase({ ...(content ?? {}), productCategories: categories });
      await saveContentSite(payload);
      setStatus('Success');
      setDetail('Categories saved successfully.');
      notify({ type: 'success', title: 'Categories saved', message: 'Categories saved successfully.' });
    } catch (error: any) {
      setStatus('Error');
      const message = error?.message ?? String(error);
      setDetail(message);
      notify({ type: 'error', title: 'Save failed', message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-brand-deep">Categories</h1>
          <p className="text-sm text-slate-600">
            Browse category previews on the left, then fine-tune the details on the right.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addCategory}
            className="rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-lime"
          >
            + New Category
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500">
              <p className="text-base font-medium">No categories yet</p>
              <p className="mt-2 text-sm">
                Start by creating a category. The preview will appear here.
              </p>
            </div>
          )}
          {categories.map((category, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <article
                key={`${category.slug || 'category'}-${idx}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedIndex(idx)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedIndex(idx);
                  }
                }}
                className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-primary ${
                  isSelected ? 'border-brand-primary shadow-lg ring-2 ring-brand-primary/30' : 'border-slate-200'
                }`}
              >
                <div className="relative h-40 bg-slate-100">
                  {category.heroImage ? (
                    <img
                      src={category.heroImage}
                      alt={`${category.name} hero`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      No hero image yet
                    </div>
                  )}
                  <div className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-brand-deep shadow">
                    {category.products.length} {category.products.length === 1 ? 'product' : 'products'}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-brand-primary/80">
                      {category.slug || 'no-slug-yet'}
                    </div>
                    <h3 className="text-lg font-semibold text-brand-deep">{category.name || 'Untitled category'}</h3>
                    {category.tagline && (
                      <p className="mt-1 max-h-12 overflow-hidden text-sm text-slate-600">{category.tagline}</p>
                    )}
                  </div>
                  <p className="max-h-16 overflow-hidden text-xs text-slate-500">{category.summary || 'No summary yet.'}</p>
                  <div className="mt-auto flex flex-wrap gap-1 text-[11px] text-slate-500">
                    {(category.highlights ?? []).slice(0, 3).map((highlight, highlightIdx) => (
                      <span
                        key={`${category.slug || idx}-highlight-${highlightIdx}`}
                        className="rounded-full bg-slate-100 px-2 py-1"
                      >
                        {highlight || 'Highlight'}
                      </span>
                    ))}
                    {category.highlights && category.highlights.length > 3 && (
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        +{category.highlights.length - 3} more
                      </span>
                    )}
                    {(!category.highlights || category.highlights.length === 0) && (
                      <span className="rounded-full bg-slate-100 px-2 py-1">Add highlights</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="space-y-4 xl:sticky xl:top-24">
          {selectedCategory ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Editing</div>
                  <h2 className="text-xl font-semibold text-brand-deep">{selectedCategory.name || 'Untitled category'}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => removeCategory(selectedIndex!)}
                  className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="grid gap-4">
                  <label className="text-sm font-medium text-brand-deep">
                    Slug
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={selectedCategory.slug}
                      onChange={(event) =>
                        updateCategory(selectedIndex!, (category) => {
                          category.slug = event.target.value;
                        })
                      }
                      placeholder="e.g. premium-talc"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-deep">
                    Name
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={selectedCategory.name}
                      onChange={(event) =>
                        updateCategory(selectedIndex!, (category) => {
                          category.name = event.target.value;
                        })
                      }
                      placeholder="Category name"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-deep">
                    Tagline
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={selectedCategory.tagline}
                      onChange={(event) =>
                        updateCategory(selectedIndex!, (category) => {
                          category.tagline = event.target.value;
                        })
                      }
                      placeholder="Short punchy intro"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-deep">
                    Summary
                    <textarea
                      rows={4}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={selectedCategory.summary}
                      onChange={(event) =>
                        updateCategory(selectedIndex!, (category) => {
                          category.summary = event.target.value;
                        })
                      }
                      placeholder="High-level overview that appears on listings."
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium text-brand-deep">Hero image</div>
                  <div className="h-40 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                    {selectedCategory.heroImage ? (
                      <img
                        src={selectedCategory.heroImage}
                        alt="Hero preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        Upload or paste an image URL
                      </div>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={selectedCategory.heroImage}
                      onChange={(event) =>
                        updateCategory(selectedIndex!, (category) => {
                          category.heroImage = event.target.value;
                        })
                      }
                      placeholder="https://res.cloudinary.com/..."
                    />
                    <label className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-brand-deep transition hover:border-brand-primary/50 hover:text-brand-primary">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          if (event.target.files?.[0]) {
                            onPickHero(selectedIndex!, event.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <label className="text-sm font-medium text-brand-deep">
                  Highlights (one per line)
                  <textarea
                    rows={4}
                    className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    value={(selectedCategory.highlights ?? []).join('\n')}
                    onChange={(event) =>
                      updateCategory(selectedIndex!, (category) => {
                        category.highlights = splitByLines(event.target.value);
                      })
                    }
                    placeholder={'Low oil absorption\nUltra-fine particle size\nHigh brightness index'}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
              Select a category preview to start editing.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
        <div className="font-medium text-brand-deep">Status: {status}</div>
        {detail && <div className="mt-1 whitespace-pre-wrap text-slate-600">{detail}</div>}
      </div>
    </div>
  );
};

export default CategoriesAdmin;
