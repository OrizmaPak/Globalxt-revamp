import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentProvider';

const Footer = () => {
  const year = new Date().getFullYear();
  const { content } = useContent();
  const companyInfo = content?.companyInfo ?? { address: '', socialLinks: [] as any[] } as any;
  const productCategories = content?.productCategories ?? [];
  const quickLinks = content?.quickLinks ?? [];
  const contactChannels = content?.contactChannels ?? [];
  return (
    <footer className="bg-brand-deep text-white">
      <div className="container-gxt grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-yellow">
            Global XT Limited
          </p>
          <p className="mt-4 text-lg font-semibold text-white">
            Delivering Africa's finest agro commodities to global supply chains.
          </p>
          <p className="mt-4 text-sm text-brand-chartreuse/80">
            {companyInfo.address}
          </p>
          <div className="mt-6 flex gap-3">
            {companyInfo.socialLinks.map((social: { label: string; href: string }) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-sm font-semibold text-white/80 transition hover:bg-white hover:text-brand-deep"
              >
                {social.label.slice(0, 2)}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-chartreuse">
            Product Focus
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {productCategories.map((category) => (
              <li key={category.slug}>
                <Link to={'/products/' + category.slug} className="hover:text-brand-chartreuse">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-chartreuse">
            Company
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {quickLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className="hover:text-brand-chartreuse">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-chartreuse">
            Contact
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {contactChannels.map((channel) => (
              <li key={channel.label}>
                <a href={channel.href} className="hover:text-brand-chartreuse">
                  <span className="font-semibold text-white">{channel.label}:</span> {channel.value}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-white/60">
            Secure contact form with CAPTCHA integration coming soon.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/70">
        &copy; {year} Global XT Limited. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

