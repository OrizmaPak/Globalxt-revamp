import IndustriesPage from '../../pages/Industries';
import ProductsPage from '../../pages/Products';
// Add other pages as they become available
// import HomePage from '../../pages/Home';
// import AboutPage from '../../pages/About';
// import ContactPage from '../../pages/Contact';

interface PreviewWrapperProps {
  pageName: string;
}

const PreviewWrapper = ({ pageName }: PreviewWrapperProps) => {
  // This component renders the actual frontend pages without any admin editing capabilities
  // It's used in the left panel to show exactly how the page looks to visitors
  
  const renderPage = () => {
    switch (pageName) {
      case 'industries':
        return <IndustriesPage />;
      case 'products':
        return <ProductsPage />;
      case 'home':
        return (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
            <div className="text-center">
              <span className="text-4xl mb-4 block">🏠</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Home Page Preview</h3>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
            <div className="text-center">
              <span className="text-4xl mb-4 block">📋</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">About Page Preview</h3>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
            <div className="text-center">
              <span className="text-4xl mb-4 block">📞</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Page Preview</h3>
              <p className="text-gray-600">Coming soon...</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
            <div className="text-center">
              <span className="text-4xl mb-4 block">❓</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Page Not Found</h3>
              <p className="text-gray-600">Unknown page: {pageName}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="preview-wrapper">
      {renderPage()}
    </div>
  );
};

export default PreviewWrapper;