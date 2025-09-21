import image from '../assets/image3.jpg';
import Breadcrumb from '../components/Breadcrumb';

const TermsOfTradePage = () => {
  return (
    <div className="relative overflow-hidden py-16">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${image})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-lime/90 via-brand-chartreuse/80 to-transparent" />
      <div className="container-gxt relative z-10">
        <h1 className="text-3xl font-semibold text-brand-deep">Terms of Trade</h1>
        <p className="mt-4 max-w-3xl text-sm text-slate-600">
          Insert contractual and commercial terms covering payment modalities, INCOTERMS, dispute
          resolution, and compliance obligations. This placeholder ensures routing works while content is
          authored.
        </p>
      </div>
      <Breadcrumb />
    </div>
  );
};

export default TermsOfTradePage;
