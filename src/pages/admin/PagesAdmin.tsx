import { useState, useEffect } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseApp from '../../lib/firebase';
import { useContent } from '../../context/ContentProvider';
import type { SiteContent } from '../../lib/contentTypes';
import InlineTextEditor from '../../components/admin/InlineTextEditor';
import InlineRichEditor from '../../components/admin/InlineRichEditor';
import InlineImageEditor from '../../components/admin/InlineImageEditor';
import ContentPreview from '../../components/admin/ContentPreview';
import { 
  EyeIcon, 
  CloudArrowUpIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

type ContentSection = 'home' | 'about' | 'company' | 'hero' | 'contact' | 'products';

const PagesAdmin = () => {
  const { content } = useContent();
  const [activeSection, setActiveSection] = useState<ContentSection>('home');
  const [editedContent, setEditedContent] = useState<SiteContent | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [status, setStatus] = useState<string>('Ready');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Initialize editable content
  useEffect(() => {
    if (content && !editedContent) {
      setEditedContent(structuredClone(content));
    }
  }, [content]);

  useEffect(() => {
    if (content && editedContent) {
      const hasChanges = JSON.stringify(content) !== JSON.stringify(editedContent);
      setHasUnsavedChanges(hasChanges);
    }
  }, [content, editedContent]);

  const updateContent = <T extends keyof SiteContent>(section: T, updates: Partial<SiteContent[T]>) => {
    if (!editedContent) return;
    setEditedContent(prev => ({
      ...prev!,
      [section]: {
        ...prev![section],
        ...updates
      }
    }));
  };

  const updatePageCopy = (page: string, section: string, field: string, value: any) => {
    if (!editedContent?.pageCopy) return;
    setEditedContent(prev => {
      if (!prev) return null;
      
      const currentPageCopy = prev.pageCopy[page as keyof typeof prev.pageCopy] as any;
      const currentSection = currentPageCopy?.[section] || {};
      
      return {
        ...prev,
        pageCopy: {
          ...prev.pageCopy,
          [page]: {
            ...currentPageCopy,
            [section]: {
              ...currentSection,
              [field]: value
            }
          }
        }
      };
    });
  };

  const saveChanges = async () => {
    if (!editedContent || !firebaseApp) {
      setStatus('Error: Firebase not configured');
      return;
    }

    try {
      setStatus('Saving changes...');
      const db = getFirestore(firebaseApp);
      
      // Sanitize content before saving
      const sanitizeForFirebase = (obj: any): any => {
        if (obj === null || obj === undefined) return null;
        if (Array.isArray(obj)) return obj.map(sanitizeForFirebase).filter(item => item !== null && item !== undefined);
        if (typeof obj === 'object') {
          const cleaned: any = {};
          for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined && value !== null) {
              const sanitized = sanitizeForFirebase(value);
              if (sanitized !== undefined && sanitized !== null) {
                cleaned[key] = sanitized;
              }
            }
          }
          return cleaned;
        }
        return obj;
      };

      const cleanContent = sanitizeForFirebase(editedContent);
      await setDoc(doc(db, 'content/site'), cleanContent, { merge: false });
      
      setStatus('Changes saved successfully!');
      setHasUnsavedChanges(false);
      
      setTimeout(() => setStatus('Ready'), 3000);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      setTimeout(() => setStatus('Ready'), 5000);
    }
  };

  const sections = [
    { id: 'home' as ContentSection, label: 'Home Page', icon: '🏠' },
    { id: 'about' as ContentSection, label: 'About Page', icon: '📋' },
    { id: 'company' as ContentSection, label: 'Company Info', icon: '🏢' },
    { id: 'hero' as ContentSection, label: 'Hero Slides', icon: '🎭' },
    { id: 'contact' as ContentSection, label: 'Contact Page', icon: '📞' },
    { id: 'products' as ContentSection, label: 'Products Page', icon: '📦' },
  ];

  if (!editedContent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-deep">Pages & Content</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage static content, hero slides, and page copy across your website.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            {hasUnsavedChanges ? (
              <>
                <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
                <span className="text-amber-600">Unsaved changes</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                <span className="text-green-600">All changes saved</span>
              </>
            )}
          </div>
          
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <EyeIcon className="h-4 w-4" />
            Preview Content
          </button>
          
          <button
            onClick={saveChanges}
            disabled={!hasUnsavedChanges}
            className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            <CloudArrowUpIcon className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Status Bar */}
      {status !== 'Ready' && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
          status.includes('Error') 
            ? 'bg-red-50 text-red-700 border border-red-200'
            : status.includes('successfully')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {status}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeSection === section.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Sections */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        {renderContentSection()}
      </div>
      
      {/* Content Preview Modal */}
      {editedContent && (
        <ContentPreview
          content={editedContent}
          isOpen={previewMode}
          onClose={() => setPreviewMode(false)}
          activeSection={activeSection}
        />
      )}
    </div>
  );

  function renderContentSection() {
    if (!editedContent) return null;

    switch (activeSection) {
      case 'home':
        return renderHomeContent();
      case 'about':
        return renderAboutContent();
      case 'company':
        return renderCompanyContent();
      case 'hero':
        return renderHeroContent();
      case 'contact':
        return renderContactContent();
      case 'products':
        return renderProductsContent();
      default:
        return null;
    }
  }

  function renderHomeContent() {
    const home = editedContent?.pageCopy?.home;
    if (!home) return <div>No home content found</div>;

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-brand-deep mb-6">Home Page Content</h2>
          
          {/* Export Excellence Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Excellence Section</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <InlineTextEditor
                label="Badge Text"
                value={home.exportExcellence?.badge || ''}
                onChange={(value) => updatePageCopy('home', 'exportExcellence', 'badge', value)}
                placeholder="Export Excellence"
              />
              <InlineTextEditor
                label="Primary CTA"
                value={home.exportExcellence?.primaryCta || ''}
                onChange={(value) => updatePageCopy('home', 'exportExcellence', 'primaryCta', value)}
                placeholder="Request a discovery call"
              />
            </div>
            
            <div className="mt-4">
              <InlineTextEditor
                label="Main Title"
                value={home.exportExcellence?.title || ''}
                onChange={(value) => updatePageCopy('home', 'exportExcellence', 'title', value)}
                placeholder="Main headline for export excellence section"
                multiline
              />
            </div>
            
            <div className="mt-4">
              <InlineRichEditor
                label="Description"
                value={home.exportExcellence?.description || ''}
                onChange={(value) => updatePageCopy('home', 'exportExcellence', 'description', value)}
                placeholder="Detailed description of export excellence..."
              />
            </div>
            
            <div className="mt-4">
              <InlineTextEditor
                label="Bullet Points (one per line)"
                value={home.exportExcellence?.bullets?.join('\n') || ''}
                onChange={(value) => updatePageCopy('home', 'exportExcellence', 'bullets', value.split('\n').filter(Boolean))}
                placeholder="• First bullet point\n• Second bullet point\n• Third bullet point"
                multiline
              />
            </div>
          </div>

          {/* Core Categories Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Core Categories Section</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <InlineTextEditor
                label="Badge Text"
                value={home.coreCategories?.badge || ''}
                onChange={(value) => updatePageCopy('home', 'coreCategories', 'badge', value)}
                placeholder="Core categories"
              />
              <InlineTextEditor
                label="API Label"
                value={home.coreCategories?.apiLabel || ''}
                onChange={(value) => updatePageCopy('home', 'coreCategories', 'apiLabel', value)}
                placeholder="API ready"
              />
            </div>
          </div>

          {/* Product Universe Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Universe Section</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <InlineTextEditor
                label="Badge Text"
                value={home.productUniverse?.badge || ''}
                onChange={(value) => updatePageCopy('home', 'productUniverse', 'badge', value)}
                placeholder="Product Universe"
              />
              <InlineTextEditor
                label="Browse CTA"
                value={home.productUniverse?.browseCta || ''}
                onChange={(value) => updatePageCopy('home', 'productUniverse', 'browseCta', value)}
                placeholder="Browse all products"
              />
            </div>
            
            <div className="mt-4 grid gap-6 md:grid-cols-1">
              <InlineTextEditor
                label="Title"
                value={home.productUniverse?.title || ''}
                onChange={(value) => updatePageCopy('home', 'productUniverse', 'title', value)}
                placeholder="Product universe section title"
              />
              <InlineRichEditor
                label="Description"
                value={home.productUniverse?.description || ''}
                onChange={(value) => updatePageCopy('home', 'productUniverse', 'description', value)}
                placeholder="Description of your product universe..."
              />
            </div>
          </div>

          {/* Bottom CTA Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Bottom Call-to-Action</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <InlineTextEditor
                label="Primary CTA"
                value={home.bottomCta?.primaryCta || ''}
                onChange={(value) => updatePageCopy('home', 'bottomCta', 'primaryCta', value)}
                placeholder="Get Started"
              />
              <InlineTextEditor
                label="Secondary CTA Prefix"
                value={home.bottomCta?.secondaryCtaPrefix || ''}
                onChange={(value) => updatePageCopy('home', 'bottomCta', 'secondaryCtaPrefix', value)}
                placeholder="Or"
              />
            </div>
            
            <div className="mt-4 grid gap-6 md:grid-cols-1">
              <InlineTextEditor
                label="Title"
                value={home.bottomCta?.title || ''}
                onChange={(value) => updatePageCopy('home', 'bottomCta', 'title', value)}
                placeholder="Bottom CTA title"
                multiline
              />
              <InlineRichEditor
                label="Description"
                value={home.bottomCta?.description || ''}
                onChange={(value) => updatePageCopy('home', 'bottomCta', 'description', value)}
                placeholder="Compelling description for final call-to-action..."
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderAboutContent() {
    const about = editedContent?.pageCopy?.about;
    if (!about) return <div>No about content found</div>;

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-brand-deep mb-6">About Page Content</h2>
          
          {/* Hero Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Hero Section</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <InlineTextEditor
                label="Badge Text"
                value={about.hero?.badge || ''}
                onChange={(value) => updatePageCopy('about', 'hero', 'badge', value)}
                placeholder="About Us"
              />
              <InlineTextEditor
                label="Title"
                value={about.hero?.title || ''}
                onChange={(value) => updatePageCopy('about', 'hero', 'title', value)}
                placeholder="About page title"
              />
            </div>
            
            <div className="mt-4">
              <InlineRichEditor
                label="Description"
                value={about.hero?.description || ''}
                onChange={(value) => updatePageCopy('about', 'hero', 'description', value)}
                placeholder="About page hero description..."
              />
            </div>
          </div>

          {/* Company Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h3>
            <div className="grid gap-6 md:grid-cols-1">
              <InlineTextEditor
                label="Company Title"
                value={about.company?.title || ''}
                onChange={(value) => updatePageCopy('about', 'company', 'title', value)}
                placeholder="Our Company"
              />
              <InlineRichEditor
                label="Company Description"
                value={about.company?.description?.join('\n\n') || ''}
                onChange={(value) => updatePageCopy('about', 'company', 'description', value.split('\n\n').filter(Boolean))}
                placeholder="Detailed company description..."
              />
            </div>
          </div>

          {/* Vision & Mission Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Vision & Mission</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <InlineTextEditor
                label="Section Title"
                value={about.visionMission?.title || ''}
                onChange={(value) => updatePageCopy('about', 'visionMission', 'title', value)}
                placeholder="Our Vision & Mission"
              />
              <InlineTextEditor
                label="Vision Title"
                value={about.visionMission?.visionTitle || ''}
                onChange={(value) => updatePageCopy('about', 'visionMission', 'visionTitle', value)}
                placeholder="Our Vision"
              />
            </div>
            
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <InlineRichEditor
                label="Vision Description"
                value={about.visionMission?.visionDescription || ''}
                onChange={(value) => updatePageCopy('about', 'visionMission', 'visionDescription', value)}
                placeholder="Our vision statement..."
              />
              <InlineRichEditor
                label="Mission Description"
                value={about.visionMission?.missionDescription || ''}
                onChange={(value) => updatePageCopy('about', 'visionMission', 'missionDescription', value)}
                placeholder="Our mission statement..."
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderCompanyContent() {
    const company = editedContent?.companyInfo;
    if (!company) return <div>No company info found</div>;

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-brand-deep mb-6">Company Information</h2>
          
          {/* Basic Info */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <InlineTextEditor
                label="Company Name"
                value={company.name || ''}
                onChange={(value) => updateContent('companyInfo', { name: value })}
                placeholder="Global XT"
                required
              />
              <InlineTextEditor
                label="Tagline"
                value={company.tagline || ''}
                onChange={(value) => updateContent('companyInfo', { tagline: value })}
                placeholder="Your company tagline"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <InlineTextEditor
                label="Phone Number"
                value={company.phone || ''}
                onChange={(value) => updateContent('companyInfo', { phone: value })}
                placeholder="+234 123 456 7890"
              />
              <InlineTextEditor
                label="WhatsApp Number"
                value={company.whatsapp || ''}
                onChange={(value) => updateContent('companyInfo', { whatsapp: value })}
                placeholder="+234 123 456 7890"
              />
              <InlineTextEditor
                label="Email Address"
                value={company.email || ''}
                onChange={(value) => updateContent('companyInfo', { email: value })}
                placeholder="info@globalxt.com"
              />
              <InlineTextEditor
                label="Business Hours"
                value={company.hours || ''}
                onChange={(value) => updateContent('companyInfo', { hours: value })}
                placeholder="Mon-Fri 9AM-5PM"
              />
            </div>
            
            <div className="mt-4">
              <InlineTextEditor
                label="Physical Address"
                value={company.address || ''}
                onChange={(value) => updateContent('companyInfo', { address: value })}
                placeholder="123 Business St, Lagos, Nigeria"
                multiline
              />
            </div>
          </div>

          {/* Legal Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Legal Information</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <InlineTextEditor
                label="RC Number"
                value={company.rcNumber || ''}
                onChange={(value) => updateContent('companyInfo', { rcNumber: value })}
                placeholder="RC123456"
              />
              <InlineTextEditor
                label="Export License"
                value={company.exportLicense || ''}
                onChange={(value) => updateContent('companyInfo', { exportLicense: value })}
                placeholder="EXP/123456/2024"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderHeroContent() {
    const heroSlides = editedContent?.heroSlides || [];

    const addSlide = () => {
      const newSlide = {
        id: `slide-${Date.now()}`,
        title: 'New Hero Slide',
        subtitle: 'Compelling subtitle here',
        ctaLabel: 'Learn More',
        ctaHref: '/products',
        image: ''
      };
      updateContent('heroSlides', [...heroSlides, newSlide]);
    };

    const removeSlide = (slideId: string) => {
      const filtered = heroSlides.filter(slide => slide.id !== slideId);
      updateContent('heroSlides', filtered);
    };

    const updateSlide = (slideId: string, field: string, value: string) => {
      const updated = heroSlides.map(slide => 
        slide.id === slideId ? { ...slide, [field]: value } : slide
      );
      updateContent('heroSlides', updated);
    };

    return (
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-brand-deep">Hero Slides</h2>
            <button
              onClick={addSlide}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-lime transition-colors"
            >
              + Add Slide
            </button>
          </div>
          
          {heroSlides.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500 mb-4">No hero slides configured</p>
              <button
                onClick={addSlide}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-lime transition-colors"
              >
                + Create First Slide
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {heroSlides.map((slide, index) => (
                <div key={slide.id} className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Slide {index + 1}: {slide.title || 'Untitled'}
                    </h3>
                    <button
                      onClick={() => removeSlide(slide.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove Slide
                    </button>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 mb-6">
                    <InlineTextEditor
                      label="Title"
                      value={slide.title}
                      onChange={(value) => updateSlide(slide.id, 'title', value)}
                      placeholder="Compelling hero title"
                    />
                    <InlineTextEditor
                      label="Subtitle"
                      value={slide.subtitle}
                      onChange={(value) => updateSlide(slide.id, 'subtitle', value)}
                      placeholder="Supporting subtitle"
                    />
                    <InlineTextEditor
                      label="CTA Label"
                      value={slide.ctaLabel}
                      onChange={(value) => updateSlide(slide.id, 'ctaLabel', value)}
                      placeholder="Learn More"
                    />
                    <InlineTextEditor
                      label="CTA Link"
                      value={slide.ctaHref}
                      onChange={(value) => updateSlide(slide.id, 'ctaHref', value)}
                      placeholder="/products"
                    />
                  </div>
                  
                  <InlineImageEditor
                    label="Hero Image"
                    value={slide.image}
                    onChange={(value) => updateSlide(slide.id, 'image', value)}
                    placeholder="Upload hero slide image"
                    width={400}
                    height={240}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderContactContent() {
    const contact = editedContent?.pageCopy?.contact;
    if (!contact) return <div>No contact content found</div>;

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-brand-deep mb-6">Contact Page Content</h2>
          
          {/* Hero Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Hero Section</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <InlineTextEditor
                label="Badge Text"
                value={contact.hero?.badge || ''}
                onChange={(value) => updatePageCopy('contact', 'hero', 'badge', value)}
                placeholder="Contact Us"
              />
              <InlineTextEditor
                label="Title"
                value={contact.hero?.title || ''}
                onChange={(value) => updatePageCopy('contact', 'hero', 'title', value)}
                placeholder="Get in touch"
              />
            </div>
            
            <div className="mt-4">
              <InlineRichEditor
                label="Description"
                value={contact.hero?.description || ''}
                onChange={(value) => updatePageCopy('contact', 'hero', 'description', value)}
                placeholder="Contact page description..."
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Form</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <InlineTextEditor
                label="Form Title"
                value={contact.form?.title || ''}
                onChange={(value) => updatePageCopy('contact', 'form', 'title', value)}
                placeholder="Send us a message"
              />
              <InlineTextEditor
                label="Submit Button"
                value={contact.form?.submitLabel || ''}
                onChange={(value) => updatePageCopy('contact', 'form', 'submitLabel', value)}
                placeholder="Send Message"
              />
            </div>
            
            <div className="mt-4 grid gap-6 md:grid-cols-1">
              <InlineTextEditor
                label="Form Placeholder"
                value={contact.form?.placeholder || ''}
                onChange={(value) => updatePageCopy('contact', 'form', 'placeholder', value)}
                placeholder="Tell us about your project..."
                multiline
              />
              <InlineTextEditor
                label="Success Message"
                value={contact.form?.successMessage || ''}
                onChange={(value) => updatePageCopy('contact', 'form', 'successMessage', value)}
                placeholder="Thank you! We'll get back to you soon."
                multiline
              />
            </div>
          </div>

          {/* Section Titles */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Section Titles</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <InlineTextEditor
                label="Direct Contact Title"
                value={contact.directContactTitle || ''}
                onChange={(value) => updatePageCopy('contact', 'directContactTitle', '', value)}
                placeholder="Direct Contact"
              />
              <InlineTextEditor
                label="Map Section Title"
                value={contact.mapTitle || ''}
                onChange={(value) => updatePageCopy('contact', 'mapTitle', '', value)}
                placeholder="Find Us"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderProductsContent() {
    const products = editedContent?.pageCopy?.products;
    if (!products) return <div>No products content found</div>;

    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-brand-deep mb-6">Products Page Content</h2>
          
          {/* Hero Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Hero Section</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <InlineTextEditor
                label="Badge Text"
                value={products.hero?.badge || ''}
                onChange={(value) => updatePageCopy('products', 'hero', 'badge', value)}
                placeholder="Our Products"
              />
              <InlineTextEditor
                label="Title"
                value={products.hero?.title || ''}
                onChange={(value) => updatePageCopy('products', 'hero', 'title', value)}
                placeholder="Discover our products"
              />
            </div>
            
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <InlineTextEditor
                label="Primary CTA"
                value={products.hero?.primaryCta || ''}
                onChange={(value) => updatePageCopy('products', 'hero', 'primaryCta', value)}
                placeholder="Browse Products"
              />
              <InlineTextEditor
                label="Secondary CTA"
                value={products.hero?.secondaryCta || ''}
                onChange={(value) => updatePageCopy('products', 'hero', 'secondaryCta', value)}
                placeholder="Request Catalog"
              />
            </div>
            
            <div className="mt-4">
              <InlineRichEditor
                label="Description"
                value={products.hero?.description || ''}
                onChange={(value) => updatePageCopy('products', 'hero', 'description', value)}
                placeholder="Products page description..."
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default PagesAdmin;
