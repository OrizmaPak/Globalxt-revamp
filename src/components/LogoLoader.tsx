import logo from '../assets/logo.png';
import { useContent } from '../context/ContentProvider';

const LogoLoader = () => {
  const { content } = useContent();
  const name = content?.companyInfo?.name;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-white">
      <div className="flex flex-col items-center">
        <img
          src={logo}
          alt="Global XT logo loading"
          className="h-20 w-20 animate-bounce select-none"
          draggable={false}
        />
        <div className="mt-4 text-center select-none">
          <p className="text-base font-semibold text-brand-deep">{name || 'Global XT Limited.'}</p>
        </div>
      </div>
    </div>
  );
};

export default LogoLoader;
