import type { SiteContent } from '../../lib/contentTypes';
import { XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';

interface ContentPreviewProps {
  content: SiteContent;
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
}

const ContentPreview = ({ content, isOpen, onClose, activeSection }: ContentPreviewProps) => {
  if (!isOpen) return null;

  const renderPreviewContent = () => {
    switch (activeSection) {
      case 'home':
        return renderHomePreview();
      case 'about':
        return renderAboutPreview();
      case 'company':
        return renderCompanyPreview();
      case 'hero':
        return renderHeroPreview();
      case 'contact':
        return renderContactPreview();
      case 'products':
        return renderProductsPreview();
      default:
        return <div>Preview not available for this section</div>;
    }
  };

  const renderHomePreview = () => {
    const home = content.pageCopy?.home;
    if (!home) return <div>No home content to preview</div>;

    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">Home Page Preview</h2>
        
        {/* Export Excellence Section */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-4">
            {home.exportExcellence?.badge}
          </div>
          <h3 className="text-xl font-semibold mb-3">{home.exportExcellence?.title}</h3>
          <div 
            className="text-gray-700 mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: home.exportExcellence?.description || '' }}
          />
          {home.exportExcellence?.bullets && (
            <ul className="space-y-2 mb-4">
              {home.exportExcellence.bullets.map((bullet, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700">{bullet}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {home.exportExcellence?.primaryCta}
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
              {home.exportExcellence?.secondaryCta}
            </button>
          </div>
        </div>

        {/* Product Universe Section */}
        <div className="bg-green-50 rounded-lg p-6">
          <div className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-4">
            {home.productUniverse?.badge}
          </div>
          <h3 className="text-xl font-semibold mb-3">{home.productUniverse?.title}</h3>
          <div 
            className="text-gray-700 mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: home.productUniverse?.description || '' }}
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            {home.productUniverse?.browseCta}
          </button>
        </div>

        {/* Bottom CTA Section */}
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold mb-3">{home.bottomCta?.title}</h3>
          <div 
            className="text-gray-700 mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: home.bottomCta?.description || '' }}
          />
          <div className="flex justify-center gap-3">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium">
              {home.bottomCta?.primaryCta}
            </button>
            <span className="self-center text-gray-500">{home.bottomCta?.secondaryCtaPrefix}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderAboutPreview = () => {
    const about = content.pageCopy?.about;
    if (!about) return <div>No about content to preview</div>;

    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">About Page Preview</h2>
        
        {/* Hero Section */}
        <div className="bg-purple-50 rounded-lg p-6">
          <div className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-4">
            {about.hero?.badge}
          </div>
          <h3 className="text-xl font-semibold mb-3">{about.hero?.title}</h3>
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: about.hero?.description || '' }}
          />
        </div>

        {/* Company Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">{about.company?.title}</h3>
          {about.company?.description && about.company.description.map((paragraph, index) => (
            <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-3">{about.visionMission?.visionTitle}</h4>
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: about.visionMission?.visionDescription || '' }}
            />
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-3">{about.visionMission?.missionTitle}</h4>
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: about.visionMission?.missionDescription || '' }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderCompanyPreview = () => {
    const company = content.companyInfo;
    if (!company) return <div>No company info to preview</div>;

    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">Company Information Preview</h2>
        
        {/* Basic Info */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-blue-800 mb-2">{company.name}</h3>
          <p className="text-blue-600 text-lg italic mb-4">{company.tagline}</p>
        </div>

        {/* Contact Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Phone:</span>
                <span>{company.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">WhatsApp:</span>
                <span>{company.whatsapp}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{company.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Hours:</span>
                <span>{company.hours}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Legal Information</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">RC Number:</span>
                <span>{company.rcNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Export License:</span>
                <span>{company.exportLicense}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-3">Address</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{company.address}</p>
        </div>
      </div>
    );
  };

  const renderHeroPreview = () => {
    const heroSlides = content.heroSlides || [];
    if (heroSlides.length === 0) return <div>No hero slides to preview</div>;

    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">Hero Slides Preview</h2>
        
        <div className="space-y-6">
          {heroSlides.map((slide, index) => (
            <div key={slide.id} className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white relative overflow-hidden">
              {slide.image && (
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
              )}
              <div className="relative z-10">
                <div className="text-sm opacity-75 mb-2">Slide {index + 1}</div>
                <h3 className="text-3xl font-bold mb-3">{slide.title}</h3>
                <p className="text-xl mb-6 opacity-90">{slide.subtitle}</p>
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  {slide.ctaLabel}
                </button>
                <div className="mt-4 text-sm opacity-75">Link: {slide.ctaHref}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContactPreview = () => {
    const contact = content.pageCopy?.contact;
    if (!contact) return <div>No contact content to preview</div>;

    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">Contact Page Preview</h2>
        
        {/* Hero Section */}
        <div className="bg-green-50 rounded-lg p-6">
          <div className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-4">
            {contact.hero?.badge}
          </div>
          <h3 className="text-xl font-semibold mb-3">{contact.hero?.title}</h3>
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: contact.hero?.description || '' }}
          />
        </div>

        {/* Contact Form Preview */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">{contact.form?.title}</h3>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Name" 
              className="w-full p-3 border rounded-lg" 
              disabled 
            />
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full p-3 border rounded-lg" 
              disabled 
            />
            <textarea 
              placeholder={contact.form?.placeholder} 
              rows={4}
              className="w-full p-3 border rounded-lg resize-none" 
              disabled 
            />
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
              {contact.form?.submitLabel}
            </button>
          </div>
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded border-l-4 border-green-500">
            <div className="font-medium">Success Message Preview:</div>
            <div>{contact.form?.successMessage}</div>
          </div>
        </div>

        {/* Section Titles */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold">{contact.directContactTitle}</h4>
            <p className="text-gray-600 mt-2">Direct contact section would appear here</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold">{contact.mapTitle}</h4>
            <p className="text-gray-600 mt-2">Map section would appear here</p>
          </div>
        </div>
      </div>
    );
  };

  const renderProductsPreview = () => {
    const products = content.pageCopy?.products;
    if (!products) return <div>No products content to preview</div>;

    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">Products Page Preview</h2>
        
        {/* Hero Section */}
        <div className="bg-orange-50 rounded-lg p-6">
          <div className="inline-block bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-4">
            {products.hero?.badge}
          </div>
          <h3 className="text-xl font-semibold mb-3">{products.hero?.title}</h3>
          <div 
            className="text-gray-700 mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: products.hero?.description || '' }}
          />
          <div className="flex gap-3">
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              {products.hero?.primaryCta}
            </button>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
              {products.hero?.secondaryCta}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <EyeIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Content Preview</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderPreviewContent()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              This is a preview of how your content will appear on the website.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPreview;