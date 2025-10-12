import { useEffect, useState } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseApp from '../lib/firebase';
import { useContent } from '../context/ContentProvider';
import type { ProductCategory } from '../types/content';
import ImagePreview from '../components/ImagePreview';
import ImageGalleryPreview from '../components/ImageGalleryPreview';

// Extract a filename from a URL for captions
const filenameFromUrl = (url?: string) => {
  if (!url) return '';
  try {
    const clean = url.split('?')[0];
    const parts = clean.split('/');
    return decodeURIComponent(parts[parts.length - 1] || '');
  } catch {
    return '';
  }
};

// Basic sanitizer to remove undefined/null before Firestore writes
const sanitizeForFirebase = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirebase).filter((x) => x !== null && x !== undefined);
  if (typeof obj === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined && v !== null) {
        const s = sanitizeForFirebase(v);
        if (s !== undefined && s !== null) out[k] = s;
      }
    }
    return out;
  }
  return obj;
};

// Simple comma/line split helpers
const splitByComma = (val: string) => val.split(',').map((s) => s.trim()).filter(Boolean);
const splitByLines = (val: string) => val.split('\n').map((s) => s.trim()).filter(Boolean);

// Cloudinary unsigned upload (client-side)
const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;
  if (!cloudName || !uploadPreset) throw new Error('Missing Cloudinary env: VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET');
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const json = await res.json();
  if (!json.secure_url) throw new Error('Cloudinary response missing secure_url');
  return json.secure_url as string;
};

const AdminPanel = () => {
  const { content } = useContent();
  const [status, setStatus] = useState<string>('Idle');
  const [detail, setDetail] = useState<string>('');
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  // Temporary previews for uploads (object URLs)
  const [heroPreviewUrls, setHeroPreviewUrls] = useState<Record<number, string>>({});
  const [productUploadPreviewUrls, setProductUploadPreviewUrls] = useState<Record<string, string>>({});
  const [productUploadFileNames, setProductUploadFileNames] = useState<Record<string, string>>({});

  // Local editable copies
  useEffect(() => {
    if (content?.productCategories) {
      setCategories(structuredClone(content.productCategories));
    }
  }, [content?.productCategories]);

  const addCategory = () => {
    setCategories((prev) => [
      ...prev,
      {
        slug: '',
        name: 'New Category',
        tagline: '',
        summary: '',
        heroImage: '',
        highlights: [],
        products: [],
      },
    ]);
  };

  const removeCategory = (slug: string) => {
    setCategories((prev) => prev.filter((c) => c.slug !== slug));
  };

  const addProduct = (catIndex: number) => {
    setCategories((prev) => {
      const clone = structuredClone(prev);
      const cat = clone[catIndex];
      cat.products.push({
        slug: '',
        name: 'New Product',
        summary: '',
        description: '',
        image: '',
        images: [],
        origins: [],
        specifications: [],
        packaging: [],
      });
      return clone;
    });
  };

  const removeProduct = (catIndex: number, slug: string) => {
    setCategories((prev) => {
      const clone = structuredClone(prev);
      clone[catIndex].products = clone[catIndex].products.filter((p) => p.slug !== slug);
      return clone;
    });
  };

  const onPickImage = async (catIndex: number, file: File) => {
    // Show an immediate local preview while uploading
    const objectUrl = URL.createObjectURL(file);
    setHeroPreviewUrls((prev) => ({ ...prev, [catIndex]: objectUrl }));
    try {
      setStatus('Uploading');
      setDetail('Uploading category hero image to Cloudinary...');
      const url = await uploadToCloudinary(file);
      setCategories((prev) => {
        const clone = structuredClone(prev);
        clone[catIndex].heroImage = url;
        return clone;
      });
      setStatus('Idle');
      setDetail('');
    } catch (e: any) {
      setStatus('Error');
      setDetail(e?.message ?? String(e));
    } finally {
      // Clean up local preview URL
      try { URL.revokeObjectURL(objectUrl); } catch {}
      setHeroPreviewUrls((prev) => {
        const { [catIndex]: _removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const onPickProductImage = async (catIndex: number, prodIndex: number, file: File, addToGallery = false) => {
    // Immediate local preview while uploading
    const key = `${catIndex}-${prodIndex}-${addToGallery ? 'gallery' : 'main'}`;
    const objectUrl = URL.createObjectURL(file);
    setProductUploadPreviewUrls((prev) => ({ ...prev, [key]: objectUrl }));
    setProductUploadFileNames((prev) => ({ ...prev, [key]: file.name }));
    try {
      setStatus('Uploading');
      setDetail('Uploading product image to Cloudinary...');
      const url = await uploadToCloudinary(file);
      setCategories((prev) => {
        const clone = structuredClone(prev);
        if (addToGallery) {
          clone[catIndex].products[prodIndex].images = [
            ...(clone[catIndex].products[prodIndex].images ?? []),
            url,
          ];
        } else {
          clone[catIndex].products[prodIndex].image = url;
        }
        return clone;
      });
      setStatus('Idle');
      setDetail('');
    } catch (e: any) {
      setStatus('Error');
      setDetail(e?.message ?? String(e));
    } finally {
      // Clean up local preview URL
      try { URL.revokeObjectURL(objectUrl); } catch {}
      setProductUploadPreviewUrls((prev) => {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      });
      setProductUploadFileNames((prev) => {
        const { [key]: _removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const save = async () => {
    try {
      if (!firebaseApp) throw new Error('Firebase not configured');
      setStatus('Saving');
      setDetail('Writing content to Firestore (content/site)...');
      const db = getFirestore(firebaseApp);
      // Merge back into existing content shape
      const payload = sanitizeForFirebase({
        ...(content ?? {}),
        productCategories: categories,
      });
      await setDoc(doc(db, 'content/site'), payload, { merge: false });
      setStatus('Success');
      setDetail('Saved to Firestore. Public site will reflect the changes instantly.');
    } catch (e: any) {
      setStatus('Error');
      setDetail(e?.message ?? String(e));
    }
  };

  const CategoryCard = ({ cat, i }: { cat: ProductCategory; i: number }) => {
    return (
      <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-brand-deep">Category: {cat.name || '(untitled)'}</h3>
          <button className="text-xs text-red-600" onClick={() => removeCategory(cat.slug)}>
            Remove
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">Slug
            <input
              className="mt-1 w-full rounded border px-2 py-1"
              value={cat.slug}
              onChange={(e) => {
                const v = e.target.value;
                setCategories((prev) => {
                  const clone = structuredClone(prev);
                  clone[i].slug = v;
                  return clone;
                });
              }}
              placeholder="spices-and-herbs"
            />
          </label>
          <label className="text-sm">Name
            <input
              className="mt-1 w-full rounded border px-2 py-1"
              value={cat.name}
              onChange={(e) => {
                const v = e.target.value;
                setCategories((prev) => {
                  const clone = structuredClone(prev);
                  clone[i].name = v;
                  return clone;
                });
              }}
              placeholder="Spices & Herbs"
            />
          </label>
          <label className="text-sm">Tagline
            <input
              className="mt-1 w-full rounded border px-2 py-1"
              value={cat.tagline}
              onChange={(e) => {
                const v = e.target.value;
                setCategories((prev) => {
                  const clone = structuredClone(prev);
                  clone[i].tagline = v;
                  return clone;
                });
              }}
              placeholder="Bold flavors, globally trusted supply"
            />
          </label>
          <label className="text-sm">Summary
            <textarea
              className="mt-1 w-full rounded border px-2 py-1"
              rows={3}
              value={cat.summary}
              onChange={(e) => {
                const v = e.target.value;
                setCategories((prev) => {
                  const clone = structuredClone(prev);
                  clone[i].summary = v;
                  return clone;
                });
              }}
            />
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr,auto,auto] items-end">
          <label className="text-sm">Hero Image URL
            <input
              className="mt-1 w-full rounded border px-2 py-1"
              value={cat.heroImage}
              onChange={(e) => {
                const v = e.target.value;
                setCategories((prev) => {
                  const clone = structuredClone(prev);
                  clone[i].heroImage = v;
                  return clone;
                });
              }}
              placeholder="https://res.cloudinary.com/..."
            />
          </label>
          <label className="text-sm inline-flex items-center gap-2">
            <span className="hidden md:inline">or upload</span>
<input type="file" accept="image/*" onChange={async (e) => { if (e.target.files && e.target.files[0]) { await onPickImage(i, e.target.files[0]); e.currentTarget.value = ''; } }} />
          </label>
          <div className="text-sm">
            {heroPreviewUrls[i] && (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-xs text-gray-600">Selected (uploading)</span>
                <ImagePreview src={heroPreviewUrls[i]} alt="Hero preview (local)" width={120} height={80} />
              </div>
            )}
          </div>
        </div>
        {/* Hero Image Preview */}
        <div className="mt-3">
          <ImagePreview 
            src={cat.heroImage} 
            alt={`${cat.name} hero image`}
            width={200}
            height={120}
            placeholder="No hero image set"
          />
        </div>
        <label className="text-sm block">Highlights (one per line)
          <textarea
            className="mt-1 w-full rounded border px-2 py-1"
            rows={3}
            value={cat.highlights.join('\n')}
            onChange={(e) => {
              const vals = splitByLines(e.target.value);
              setCategories((prev) => {
                const clone = structuredClone(prev);
                clone[i].highlights = vals;
                return clone;
              });
            }}
          />
        </label>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-brand-deep">Products</h4>
            <button className="text-xs text-brand-primary" onClick={() => addProduct(i)}>+ Add Product</button>
          </div>
          <div className="grid gap-3">
            {cat.products.map((p, idx) => (
              <div key={p.slug + idx} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{p.name || '(untitled product)'}</div>
                  <button className="text-xs text-red-600" onClick={() => removeProduct(i, p.slug)}>Remove</button>
                </div>
                <div className="grid gap-3 md:grid-cols-2 mt-2">
                  <label className="text-sm">Slug
                    <input className="mt-1 w-full rounded border px-2 py-1" value={p.slug}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCategories((prev) => {
                          const clone = structuredClone(prev);
                          clone[i].products[idx].slug = v;
                          return clone;
                        });
                      }}
                      placeholder="ginger" />
                  </label>
                  <label className="text-sm">Name
                    <input className="mt-1 w-full rounded border px-2 py-1" value={p.name}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCategories((prev) => {
                          const clone = structuredClone(prev);
                          clone[i].products[idx].name = v;
                          return clone;
                        });
                      }} />
                  </label>
                  <label className="text-sm">Summary
                    <input className="mt-1 w-full rounded border px-2 py-1" value={p.summary}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCategories((prev) => {
                          const clone = structuredClone(prev);
                          clone[i].products[idx].summary = v;
                          return clone;
                        });
                      }} />
                  </label>
                  <label className="text-sm">Description
                    <textarea className="mt-1 w-full rounded border px-2 py-1" rows={3} value={p.description}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCategories((prev) => {
                          const clone = structuredClone(prev);
                          clone[i].products[idx].description = v;
                          return clone;
                        });
                      }} />
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-[1fr,auto,auto,auto] items-end mt-2">
                  <label className="text-sm">Main Image URL
                    <input className="mt-1 w-full rounded border px-2 py-1" value={p.image}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCategories((prev) => {
                          const clone = structuredClone(prev);
                          clone[i].products[idx].image = v;
                          return clone;
                        });
                      }} placeholder="https://res.cloudinary.com/..." />
                  </label>
                  <label className="text-sm inline-flex items-center gap-2">
                    <span className="hidden md:inline">or upload</span>
<input type="file" accept="image/*" onChange={async (e) => { if (e.target.files && e.target.files[0]) { await onPickProductImage(i, idx, e.target.files[0], false); e.currentTarget.value = ''; } }} />
                  </label>
                  <label className="text-sm inline-flex items-center gap-2">
                    <span className="hidden md:inline">add gallery</span>
<input type="file" accept="image/*" onChange={async (e) => { if (e.target.files && e.target.files[0]) { await onPickProductImage(i, idx, e.target.files[0], true); e.currentTarget.value = ''; } }} />
                  </label>
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      {productUploadPreviewUrls[`${i}-${idx}-main`] && (
                        <ImagePreview src={productUploadPreviewUrls[`${i}-${idx}-main`]} alt="Main preview (local)" width={100} height={70} />
                      )}
                      {productUploadPreviewUrls[`${i}-${idx}-gallery`] && (
                        <ImagePreview src={productUploadPreviewUrls[`${i}-${idx}-gallery`]} alt="Gallery preview (local)" width={100} height={70} />
                      )}
                    </div>
                  </div>
                </div>
                {/* Main Image Preview */}
                <div className="mt-3 flex gap-4">
                  <div>
                    <div className="text-xs text-gray-600 mb-2">Main Image</div>
                    <ImagePreview 
                      src={productUploadPreviewUrls[`${i}-${idx}-main`] || p.image}
                      alt={`${p.name} main image`}
                      width={120}
                      height={80}
                      placeholder="No main image"
                    />
                    <div className="mt-1 text-[11px] text-slate-500 truncate">
                      {productUploadFileNames[`${i}-${idx}-main`] || filenameFromUrl(p.image)}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {productUploadPreviewUrls[`${i}-${idx}-gallery`] && (
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Uploading to gallery</div>
                        <ImagePreview src={productUploadPreviewUrls[`${i}-${idx}-gallery`]} alt="Gallery preview (local)" width={100} height={70} />
                        <div className="mt-1 text-[11px] text-slate-500 truncate">
                          {productUploadFileNames[`${i}-${idx}-gallery`]}
                        </div>
                      </div>
                    )}
<ImageGalleryPreview 
                      images={p.images || []}
                      extraImages={productUploadPreviewUrls[`${i}-${idx}-gallery`] ? [productUploadPreviewUrls[`${i}-${idx}-gallery`]] : []}
                      onRemoveImage={(imageIndex) => {
                        setCategories((prev) => {
                          const clone = structuredClone(prev);
                          clone[i].products[idx].images = (clone[i].products[idx].images || []).filter((_, index) => index !== imageIndex);
                          return clone;
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2 mt-2">
                  <label className="text-sm">Origins (comma-separated)
                    <input className="mt-1 w-full rounded border px-2 py-1" value={p.origins.join(', ')}
                      onChange={(e) => {
                        const vals = splitByComma(e.target.value);
                        setCategories((prev) => {
                          const clone = structuredClone(prev);
                          clone[i].products[idx].origins = vals;
                          return clone;
                        });
                      }} />
                  </label>
                  <label className="text-sm">Specifications (one per line)
                    <textarea className="mt-1 w-full rounded border px-2 py-1" rows={3} value={p.specifications.join('\n')}
                      onChange={(e) => {
                        const vals = splitByLines(e.target.value);
                        setCategories((prev) => {
                          const clone = structuredClone(prev);
                          clone[i].products[idx].specifications = vals;
                          return clone;
                        });
                      }} />
                  </label>
                  <label className="text-sm">Packaging (one per line)
                    <textarea className="mt-1 w-full rounded border px-2 py-1" rows={2} value={p.packaging.join('\n')}
                      onChange={(e) => {
                        const vals = splitByLines(e.target.value);
                        setCategories((prev) => {
                          const clone = structuredClone(prev);
                          clone[i].products[idx].packaging = vals;
                          return clone;
                        });
                      }} />
                  </label>
                  <label className="text-sm">Logistics (optional, one per line)
                    <textarea className="mt-1 w-full rounded border px-2 py-1" rows={2} value={(p.logistics ?? []).join('\n')}
                      onChange={(e) => {
                        const vals = splitByLines(e.target.value);
                        setCategories((prev) => {
                          const clone = structuredClone(prev);
                          clone[i].products[idx].logistics = vals;
                          return clone;
                        });
                      }} />
                  </label>
                  <label className="text-sm">Applications (optional, one per line)
                    <textarea className="mt-1 w-full rounded border px-2 py-1" rows={2} value={(p.applications ?? []).join('\n')}
                      onChange={(e) => {
                        const vals = splitByLines(e.target.value);
                        setCategories((prev) => {
                          const clone = structuredClone(prev);
                          clone[i].products[idx].applications = vals;
                          return clone;
                        });
                      }} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <button
          onClick={save}
          className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Save Changes
        </button>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Manage product categories and products. Images are uploaded to Cloudinary and only the URLs are saved to Firestore.
      </p>
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Categories</h2>
          <button className="text-sm text-brand-primary" onClick={addCategory}>+ Add Category</button>
        </div>
        <div className="grid gap-4">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.slug + i} cat={cat} i={i} />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="font-medium">Status: {status}</div>
        {detail && (
          <pre className="mt-2 p-3 bg-gray-100 rounded text-sm whitespace-pre-wrap">{detail}</pre>
        )}
      </div>

      {import.meta.env.PROD && (
        <div className="mt-8 p-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded">
          Reminder: protect /admin with Firebase Auth before deploying to production.
        </div>
      )}
    </div>
  );
};

export default AdminPanel;