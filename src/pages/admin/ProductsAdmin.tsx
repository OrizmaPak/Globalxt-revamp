import { useEffect, useMemo, useRef, useState } from 'react';
import { useContent } from '../../context/ContentProvider';
import { useAdminNotifications } from '../../context/AdminNotificationProvider';
import type { Product, ProductCategory } from '../../types/content';
import { sanitizeForFirebase, splitByComma, splitByLines, uploadToCloudinary, saveContentSite } from './adminUtils';
import ImagePreview from '../../components/ImagePreview';
import ImageGalleryPreview from '../../components/ImageGalleryPreview';

const GALLERY_SLOTS = 10;

interface FlatProduct extends Product {
  categorySlug: string;
}

const getGallerySlots = (images?: string[]) => {
  const slots = [...(images ?? [])];
  while (slots.length < GALLERY_SLOTS) {
    slots.push('');
  }
  return slots.slice(0, GALLERY_SLOTS);
};


const findNextAvailableSlot = (images: string[] | undefined, startFrom = 0) => {
  const slots = getGallerySlots(images);
  for (let index = Math.max(0, startFrom); index < slots.length; index += 1) {
    const candidate = slots[index];
    if (!candidate || candidate.trim().length === 0) {
      return index;
    }
  }
  return -1;
};


const ProductsAdmin = () => {
  const { notify } = useAdminNotifications();
  const { content } = useContent();
  const [status, setStatus] = useState('Idle');
  const [detail, setDetail] = useState('');
  const [, setUploadProgress] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  const [flat, setFlat] = useState<FlatProduct[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // Track temporary file names for blob: object URLs so we can show a proper caption under previews
  const tempNameMapRef = useRef<Map<string, string>>(new Map());
  // Stage local files to upload on Save (defer Cloudinary until Save)
  const stagedMainRef = useRef<Map<number, File>>(new Map());
  const stagedGalleryRef = useRef<Map<number, Map<number, File>>>(new Map());

  useEffect(() => {
    if (content?.productCategories) {
      const clonedCategories = structuredClone(content.productCategories);
      setCategories(clonedCategories);
      const items: FlatProduct[] = [];
      clonedCategories.forEach((category) => {
        category.products.forEach((product) => {
          items.push({ ...structuredClone(product), categorySlug: category.slug });
        });
      });
      setFlat(items);
      setSelectedIndex((prev) => {
        if (!items.length) return null;
        if (prev === null) return 0;
        return Math.min(prev, items.length - 1);
      });
    } else {
      setCategories([]);
      setFlat([]);
      setSelectedIndex(null);
    }
  }, [content?.productCategories]);

  useEffect(() => {
    setSelectedIndex((prev) => {
      if (!flat.length) return null;
      if (prev === null || prev >= flat.length) return 0;
      return prev;
    });
  }, [flat.length]);

  const selectedProduct = selectedIndex !== null ? flat[selectedIndex] : null;

  const categoryLookup = useMemo(() => {
    const lookup = new Map<string, string>();
    categories.forEach((category) => {
      lookup.set(category.slug, category.name || category.slug || '');
    });
    return lookup;
  }, [categories]);

  const markDraft = (message = 'Unsaved changes') => {
    setStatus('Draft');
    setDetail(message);
  };

  const updateProduct = (index: number, updater: (product: FlatProduct) => void) => {
    setFlat((prev) => {
      const next = structuredClone(prev);
      updater(next[index]);
      return next;
    });
    markDraft();
  };

  const addProduct = () => {
    if (!categories.length) {
      setStatus('Error');
      setDetail('Create a category before adding products.');
      return;
    }

    const template: FlatProduct = {
      categorySlug: categories[0].slug,
      slug: '',
      name: 'New Product',
      summary: '',
      description: '',
      image: '',
      images: [],
      origins: [],
      specifications: [],
      packaging: [],
    };

    setFlat((prev) => [template, ...prev]);
    setSelectedIndex(0);
    markDraft('Draft product created at the top of the list.');
  };

  const removeProduct = (index: number) => {
    setFlat((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      setSelectedIndex((current) => {
        if (current === null) return next.length ? 0 : null;
        if (current === index) return next.length ? Math.min(index, next.length - 1) : null;
        if (current > index) return current - 1;
        return current;
      });
      return next;
    });
    markDraft('Product removed. Remember to save to persist the change.');
  };

    const setGalleryValue = (product: FlatProduct, slot: number, value: string) => {
    const nextImages = [...(product.images ?? [])];
    while (nextImages.length <= slot) {
      nextImages.push('');
    }
    nextImages[slot] = value;
    product.images = nextImages;
  };

  const getDisplayName = (value: string): string => {
    if (!value) return '';
    // If it's a temporary object URL, prefer the captured file name
    if (value.startsWith('blob:')) {
      return tempNameMapRef.current.get(value) ?? 'Selected file';
    }
    try {
      const u = new URL(value);
      const last = u.pathname.split('/').pop() ?? '';
      const clean = decodeURIComponent(last);
      return clean || value;
    } catch {
      const parts = value.split('/');
      return parts[parts.length - 1] || value;
    }
  };

  const clearStagedMain = (productIndex: number) => {
    stagedMainRef.current.delete(productIndex);
  };

  const stageGalleryFile = (productIndex: number, slot: number, file: File) => {
    let inner = stagedGalleryRef.current.get(productIndex);
    if (!inner) {
      inner = new Map<number, File>();
      stagedGalleryRef.current.set(productIndex, inner);
    }
    inner.set(slot, file);
  };

  const clearStagedGallerySlot = (productIndex: number, slot: number) => {
    const inner = stagedGalleryRef.current.get(productIndex);
    if (inner) {
      inner.delete(slot);
      if (inner.size === 0) stagedGalleryRef.current.delete(productIndex);
    }
  };

  const onPickMainImage = async (index: number, file: File) => {
    const snapshot = flat[index];
    if (!snapshot) return;
    const objectUrl = URL.createObjectURL(file);
    // Remember the local file name for the temporary object URL
    tempNameMapRef.current.set(objectUrl, file.name);
    // Stage file for upload on Save and show local preview in UI
    stagedMainRef.current.set(index, file);

    updateProduct(index, (product) => {
      product.image = objectUrl; // show local preview and clear any previous cloud URL implicitly
    });

    setStatus('Draft');
    setDetail('Main image selected locally. It will upload to Cloudinary when you click Save.');
  };

  const processGalleryFiles = async (index: number, startSlot: number, files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    const baseProduct = flat[index];
    if (!baseProduct) return;

    let pointer = Math.max(0, startSlot);
    const workingImages = [...(baseProduct.images ?? [])];

    for (let fileIndex = 0; fileIndex < fileArray.length; fileIndex += 1) {
      const file = fileArray[fileIndex];
      const slot = findNextAvailableSlot(workingImages, pointer);

      if (slot === -1) {
        const skipped = fileArray.length - fileIndex;
        if (skipped > 0) {
          setStatus('Draft');
          setDetail(`Gallery limit reached. Skipped ${skipped} file${skipped > 1 ? 's' : ''}.`);
        }
        break;
      }

      const objectUrl = URL.createObjectURL(file);
      // Remember the local file name for this temporary object URL
      tempNameMapRef.current.set(objectUrl, file.name);
      // Stage this file for upload on Save
      stageGalleryFile(index, slot, file);

      workingImages[slot] = objectUrl;
      updateProduct(index, (product) => {
        setGalleryValue(product, slot, objectUrl);
      });

      pointer = slot + 1;
    }

    setStatus('Draft');
    setDetail('Gallery images selected locally. They will upload to Cloudinary when you click Save.');
  };

const save = async () => {
    try {
      setStatus('Saving');
      setDetail('Preparing uploads...');

      // Work on a clone so we can commit Cloudinary URLs into the UI after save
      const working = structuredClone(flat);

      // Build upload tasks and run with concurrency
      type Task = () => Promise<void>;
      const tasks: Task[] = [];

      // Main image tasks
      stagedMainRef.current.forEach((file, productIndex) => {
        tasks.push(async () => {
          setDetail(`Uploading main image for “${working[productIndex].name || working[productIndex].slug || 'product'}”...`);
          const url = await uploadToCloudinary(file);
          try {
            const prev = working[productIndex].image;
            if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
          } catch {}
          working[productIndex].image = url;
        });
      });

      // Gallery image tasks
      stagedGalleryRef.current.forEach((slotMap, productIndex) => {
        slotMap.forEach((file, slot) => {
          tasks.push(async () => {
            setDetail(`Uploading gallery image for “${working[productIndex].name || working[productIndex].slug || 'product'}” (slot ${slot + 1})...`);
            const url = await uploadToCloudinary(file);
            const prev = (working[productIndex].images ?? [])[slot];
            try {
              if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
            } catch {}
            const nextImages = [...(working[productIndex].images ?? [])];
            while (nextImages.length <= slot) nextImages.push('');
            nextImages[slot] = url;
            working[productIndex].images = nextImages;
          });
        });
      });

      // Initialize progress
      setUploadProgress({ completed: 0, total: tasks.length });

      const runWithConcurrency = async (fns: Task[], limit = 3) => {
        if (fns.length === 0) return;
        let index = 0;
        const workers = Array(Math.min(limit, fns.length))
          .fill(0)
          .map(async () => {
            while (true) {
              const current = index++;
              if (current >= fns.length) break;
              await fns[current]();
              setUploadProgress((p) => ({ completed: p.completed + 1, total: fns.length }));
            }
          });
        await Promise.all(workers);
      };

      if (tasks.length > 0) {
        setDetail('Uploading selected images to Cloudinary...');
        await runWithConcurrency(tasks, 3);
        // Clear staging after successful uploads
        stagedMainRef.current.clear();
        stagedGalleryRef.current.clear();
      }

      setDetail('Merging products into categories and writing to Firestore...');
      const categoriesMap = new Map<string, ProductCategory>();
      categories.forEach((category) => {
        categoriesMap.set(category.slug, structuredClone(category));
      });
      categoriesMap.forEach((category) => {
        category.products = [];
      });

      working.forEach((product) => {
        const category = categoriesMap.get(product.categorySlug);
        if (!category) return;

        const { categorySlug, ...rest } = structuredClone(product);
        const cleaned: Product = {
          ...rest,
          images: (rest.images ?? []).filter((image) => image && image.trim().length > 0),
          origins: rest.origins.filter((origin) => origin.trim().length > 0),
          specifications: rest.specifications.filter((spec) => spec.trim().length > 0),
          packaging: rest.packaging.filter((item) => item.trim().length > 0),
          logistics: (rest.logistics ?? []).filter((item) => item.trim().length > 0),
          applications: (rest.applications ?? []).filter((item) => item.trim().length > 0),
        };

        category.products.push(cleaned);
      });

      const rebuilt = Array.from(categoriesMap.values());
      const payload = sanitizeForFirebase({ ...(content ?? {}), productCategories: rebuilt });
      await saveContentSite(payload);

      // Reflect committed Cloudinary URLs back into editor state
      setFlat(working);

      // Reset progress
      setUploadProgress({ completed: 0, total: 0 });

      setStatus('Success');
      setDetail('Products saved successfully.');
      notify({ type: 'success', title: 'Products saved', message: 'Product catalogue updated successfully.' });
    } catch (error: any) {
      setStatus('Error');
      const message = error?.message ?? String(error);
      setDetail(message);
      setUploadProgress({ completed: 0, total: 0 });
      notify({ type: 'error', title: 'Save failed', message });
    }

  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-brand-deep">Products</h1>
          <p className="text-sm text-slate-600">
            Preview products visually, then edit rich details in the focused panel.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addProduct}
            className="rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-lime"
          >
            + New Product
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,460px)]">
        <div className="grid gap-4 sm:grid-cols-2">
          {flat.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500">
              <p className="text-base font-medium">No products yet</p>
              <p className="mt-2 text-sm">Add a product to see it appear here with a visual preview.</p>
            </div>
          )}
          {flat.map((product, idx) => {
            const isSelected = idx === selectedIndex;
            const previewImage = product.image || (product.images ?? []).find((img) => img);
            const categoryName = categoryLookup.get(product.categorySlug) || 'Uncategorised';
            return (
              <article
                key={`${product.slug || 'product'}-${idx}`}
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
                <div className="relative h-44 bg-slate-100">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={`${product.name} preview`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      Add a main or gallery image
                    </div>
                  )}
                  <div className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-brand-deep shadow">
                    {categoryName || 'Uncategorised'}
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-brand-primary/80">
                      {product.slug || 'no-slug-yet'}
                    </div>
                    <h3 className="text-lg font-semibold text-brand-deep">{product.name || 'Untitled product'}</h3>
                  </div>
                  <p className="max-h-16 overflow-hidden text-sm text-slate-600">{product.summary || 'No summary yet.'}</p>
                  <div className="mt-auto flex flex-wrap gap-1 text-[11px] text-slate-500">
                    {(product.origins ?? []).slice(0, 3).map((origin, originIdx) => (
                      <span key={`${product.slug || idx}-origin-${originIdx}`} className="rounded-full bg-slate-100 px-2 py-1">
                        {origin || 'Origin'}
                      </span>
                    ))}
                    {product.origins && product.origins.length > 3 && (
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        +{product.origins.length - 3} more
                      </span>
                    )}
                    {(!product.origins || product.origins.length === 0) && (
                      <span className="rounded-full bg-slate-100 px-2 py-1">Add origins</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="space-y-4 xl:sticky xl:top-24">
          {selectedProduct ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Editing</div>
                  <h2 className="text-xl font-semibold text-brand-deep">{selectedProduct.name || 'Untitled product'}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(selectedIndex!)}
                  className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>

              <div className="mt-5 space-y-5">
                <div className="grid gap-4">
                  <label className="text-sm font-medium text-brand-deep">
                    Category
                    <select
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={selectedProduct.categorySlug}
                      onChange={(event) =>
                        updateProduct(selectedIndex!, (product) => {
                          product.categorySlug = event.target.value;
                        })
                      }
                    >
                      {categories.map((category) => (
                        <option key={category.slug || category.name} value={category.slug}>
                          {category.name || category.slug || 'Untitled category'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-brand-deep">
                    Slug
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={selectedProduct.slug}
                      onChange={(event) =>
                        updateProduct(selectedIndex!, (product) => {
                          product.slug = event.target.value;
                        })
                      }
                      placeholder="e.g. micronized-talc"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-deep">
                    Name
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={selectedProduct.name}
                      onChange={(event) =>
                        updateProduct(selectedIndex!, (product) => {
                          product.name = event.target.value;
                        })
                      }
                      placeholder="Product name"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-deep">
                    Summary
                    <textarea
                      rows={3}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={selectedProduct.summary}
                      onChange={(event) =>
                        updateProduct(selectedIndex!, (product) => {
                          product.summary = event.target.value;
                        })
                      }
                      placeholder="Short overview shown in listings."
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-deep">
                    Description
                    <textarea
                      rows={5}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={selectedProduct.description}
                      onChange={(event) =>
                        updateProduct(selectedIndex!, (product) => {
                          product.description = event.target.value;
                        })
                      }
                      placeholder="Full product description displayed on the detail page."
                    />
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm font-medium text-brand-deep">
                    <span>Main image</span>
                    <button
                      type="button"
                      onClick={() => {
                        updateProduct(selectedIndex!, (product) => {
                          product.image = '';
                        });
                        clearStagedMain(selectedIndex!);
                        setStatus('Draft');
                        setDetail('Main image cleared. Unsaved changes pending.');
                      }}
                      className="text-xs font-medium text-rose-500 transition hover:text-rose-600"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3">
                    <ImagePreview
                      src={selectedProduct.image || ''}
                      alt="Main image preview"
                      width={320}
                      height={200}
                      className="w-full"
                      placeholder="No main image"
                      caption={getDisplayName(selectedProduct.image || '')}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={selectedProduct.image}
                      onChange={(event) => {
                        const val = event.target.value;
                        updateProduct(selectedIndex!, (product) => {
                          product.image = val;
                        });
                        // If a manual URL is provided, clear any staged main file
                        if (!val.startsWith('blob:')) {
                          clearStagedMain(selectedIndex!);
                        }
                      }}
                      placeholder="https://res.cloudinary.com/..."
                    />
                    <label className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-brand-deep transition hover:border-brand-primary/50 hover:text-brand-primary">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            await onPickMainImage(selectedIndex!, file);
                            event.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-brand-deep">Gallery images (up to {GALLERY_SLOTS})</div>
                    <label className="flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-brand-deep transition hover:border-brand-primary/50 hover:text-brand-primary">
                      Upload batch
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (event) => {
                          const files = event.target.files;
                          if (!files?.length) return;
                          const firstEmpty = findNextAvailableSlot(selectedProduct.images, 0);
                          if (firstEmpty === -1) {
                            setStatus('Draft');
                            setDetail('Gallery is full. Remove an image before uploading more.');
                            event.target.value = '';
                            return;
                          }
                          await processGalleryFiles(selectedIndex!, firstEmpty, files);
                          event.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {getGallerySlots(selectedProduct.images).map((value, slot) => {
                      const livePreview = value;

                      return (
                        <div key={`gallery-slot-${slot}`} className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-3">
                          <div className="flex items-center justify-between text-xs font-medium text-brand-deep">
                            <span>Image {slot + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                updateProduct(selectedIndex!, (product) => {
                                  const nextImages = [...(product.images ?? [])];
                                  while (nextImages.length <= slot) {
                                    nextImages.push('');
                                  }
                                  nextImages[slot] = '';
                                  product.images = nextImages;
                                });
                                clearStagedGallerySlot(selectedIndex!, slot);
                                setStatus('Draft');
                                setDetail('Gallery image cleared. Unsaved changes pending.');
                              }}
                              className="text-rose-500 transition hover:text-rose-600"
                            >
                              Clear
                            </button>
                          </div>
                          <div className="overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 p-2">
                            <ImagePreview
                              src={livePreview || ''}
                              alt={`Gallery slot ${slot + 1}`}
                              width={200}
                              height={130}
                              className="w-full"
                              placeholder="No image"
                              caption={getDisplayName(livePreview || '')}
                            />
                          </div>
                          <input
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                            value={value}
                            onChange={(event) => {
                              const val = event.target.value;
                              updateProduct(selectedIndex!, (product) => {
                                const nextImages = [...(product.images ?? [])];
                                while (nextImages.length <= slot) {
                                  nextImages.push('');
                                }
                                nextImages[slot] = val;
                                product.images = nextImages;
                              });
                              if (!val.startsWith('blob:')) {
                                clearStagedGallerySlot(selectedIndex!, slot);
                              }
                            }}
                            placeholder="https://res.cloudinary.com/..."
                          />
                          <label className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-medium text-brand-deep transition hover:border-brand-primary/50 hover:text-brand-primary">
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={async (event) => {
                                const files = event.target.files;
                                if (!files?.length) return;
                                await processGalleryFiles(selectedIndex!, slot, files);
                                event.target.value = '';
                              }}
                            />
                          </label>
                        </div>
                      );
                    })}
                  </div>
<ImageGalleryPreview 
                    images={(selectedProduct.images ?? []).filter((image) => image && image.trim().length > 0)}
                    className="border-t border-slate-200 pt-3"
                    onRemoveImage={(imageIndex) => {
                      updateProduct(selectedIndex!, (product) => {
                        const nextImages = [...(product.images ?? [])];
                        if (imageIndex < nextImages.length) {
                          nextImages.splice(imageIndex, 1);
                        }
                        product.images = nextImages;
                      });
                      setStatus('Draft');
                      setDetail('Gallery image removed. Unsaved changes pending.');
                    }}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium text-brand-deep">
                    Origins (comma separated)
                    <input
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={selectedProduct.origins.join(', ')}
                      onChange={(event) =>
                        updateProduct(selectedIndex!, (product) => {
                          product.origins = splitByComma(event.target.value);
                        })
                      }
                      placeholder="USA, Brazil, Spain"
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-deep">
                    Specifications (one per line)
                    <textarea
                      rows={4}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={selectedProduct.specifications.join('\n')}
                      onChange={(event) =>
                        updateProduct(selectedIndex!, (product) => {
                          product.specifications = splitByLines(event.target.value);
                        })
                      }
                      placeholder={'Moisture: <0.2%\nWhiteness: >96%\nOil Absorption: 28g/100g'}
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-deep">
                    Packaging (one per line)
                    <textarea
                      rows={3}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={selectedProduct.packaging.join('\n')}
                      onChange={(event) =>
                        updateProduct(selectedIndex!, (product) => {
                          product.packaging = splitByLines(event.target.value);
                        })
                      }
                      placeholder={'25kg valve bags\n1 MT jumbo bags'}
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-deep">
                    Logistics (optional, one per line)
                    <textarea
                      rows={3}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={(selectedProduct.logistics ?? []).join('\n')}
                      onChange={(event) =>
                        updateProduct(selectedIndex!, (product) => {
                          product.logistics = splitByLines(event.target.value);
                        })
                      }
                      placeholder={'Lead time: 3 weeks\nShips from: Rotterdam'}
                    />
                  </label>
                  <label className="text-sm font-medium text-brand-deep">
                    Applications (optional, one per line)
                    <textarea
                      rows={3}
                      className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm shadow-inner transition focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                      value={(selectedProduct.applications ?? []).join('\n')}
                      onChange={(event) =>
                        updateProduct(selectedIndex!, (product) => {
                          product.applications = splitByLines(event.target.value);
                        })
                      }
                      placeholder={'Ceramics\nCoatings\nAutomotive plastics'}
                    />
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
              Select a product preview to start editing.
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

export default ProductsAdmin;
