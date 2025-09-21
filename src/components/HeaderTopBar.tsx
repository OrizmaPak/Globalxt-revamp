import {
  BuildingOffice2Icon,
  ClockIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import ImageWithFallback from './ImageWithFallback';
import logo from '../assets/logo.png';
import { companyInfo } from '../data/siteContent';

const infoItems = [
  {
    label: 'Call us',
    value: companyInfo.phone,
    href: 'tel:' + companyInfo.phone,
    Icon: PhoneIcon,
  },
  {
    label: 'Opening Hours',
    value: companyInfo.hours,
    Icon: ClockIcon,
  },
  {
    label: 'RC Number',
    value: companyInfo.rcNumber,
    Icon: BuildingOffice2Icon,
  },
  {
    label: 'Export Licence No.',
    value: companyInfo.exportLicense,
    Icon: ShieldCheckIcon,
  },
];

const HeaderTopBar = () => {
  return (
    <div className="border-b border-slate-100 bg-white">
      <div className="container-gxt flex flex-col gap-4 py-1 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="h-20 w-20">
            <ImageWithFallback src={logo} alt="Global XT Limited" className="object-contain p-3 " />
          </div>
          {/* <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-primary">
            Africa's Agro Export Powerhouse
          </p> */}
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-slate-700 relative">
          {infoItems.map(({ label, value, href, Icon }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-lime/40 bg-brand-lime/10 text-brand-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {label}
                </p>
                {href ? (
                  <a href={href} className="font-semibold text-brand-deep hover:text-brand-primary">
                    {value}
                  </a>
                ) : (
                  <p className="font-semibold text-brand-deep">{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeaderTopBar;
