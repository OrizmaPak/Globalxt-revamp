
import { Fragment, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Popover, Transition, Disclosure } from '@headlessui/react';
import {
  Bars3Icon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PhoneArrowUpRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';

import ImageWithFallback from './ImageWithFallback';
import logo from '../assets/logo.png';
import { useContent } from '../context/ContentProvider';
import type { NavItem } from '../types/content';

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};


type NavConfig = NavItem;

type MegaMenuProps = {
  item: NavConfig;
  tone: 'floating' | 'pinned';
};

type MobileNavProps = {
  onNavigate: () => void;
  queries: Record<string, string>;
  onQueryChange: (key: string, value: string) => void;
};

const navLinkBase =
  'relative px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] transition-all duration-300';

const buildMobileSupport = (companyInfo: { phone: string; hours: string; rcNumber: string }) => [
  { label: 'Call us', value: companyInfo.phone, href: 'tel:' + companyInfo.phone },
  { label: 'Opening Hours', value: companyInfo.hours },
  { label: 'RC Number', value: companyInfo.rcNumber },
];

const filterColumns = (columns: NonNullable<NavConfig['megaMenu']>, query: string) => {
  const term = query.trim().toLowerCase();
  if (!term) {
    return columns;
  }
  return columns
    .map((column) => ({
      ...column,
      items: column.items.filter((item) =>
        (item.label + (item.description ?? '')).toLowerCase().includes(term)
      ),
    }))
    .filter((column) => column.items.length > 0);
};

const DesktopNav = ({ tone, items }: { tone: 'floating' | 'pinned'; items: NavConfig[] }) => {
  const baseColorClasses =
    tone === 'floating'
      ? 'text-brand-deep/90 hover:text-brand-primary'
      : 'text-brand-deep/90 hover:text-brand-primary';

  return (
    <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
      {items.map((item) => {
        if (item.megaMenu) {
          return <MegaMenu key={item.label} item={item} tone={tone} />;
        }

        if (item.children) {
          return <DropdownNavItem key={item.label} item={item} tone={tone} />;
        }

        return (
          <NavLink
            key={item.label}
            to={item.path}
            onClick={scrollToTop}
            className={({ isActive }) =>
              clsx(
                navLinkBase,
                baseColorClasses,
                'rounded-lg transition-all duration-300 hover:bg-white/10',
                'after:absolute after:left-4 after:right-4 after:bottom-1 after:h-[2px] after:rounded-full after:opacity-0 after:transition-opacity',
                isActive &&
                  'text-brand-primary after:opacity-100 after:bg-brand-primary/90 bg-white/10'
              )
            }
          >
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
};

const MegaMenu = ({ item, tone }: MegaMenuProps) => {
  const [query, setQuery] = useState('');
  const columns = useMemo(() => item.megaMenu ?? [], [item]);
  const filtered = useMemo(() => filterColumns(columns, query), [columns, query]);
  const showEmptyState = query.trim().length > 0 && filtered.length === 0;

  const panelTone = 'border-brand-primary/20 bg-white';

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button
            className={clsx(
              navLinkBase,
              'flex items-center gap-2 rounded-lg transition-all duration-300 hover:bg-white/20',
              tone === 'floating'
                ? 'text-brand-deep/90 hover:text-brand-primary'
                : 'text-brand-deep/90 hover:text-brand-primary',
              open && 'text-brand-primary bg-white/20'
            )}
          >
            <span>{item.label}</span>
            <ChevronDownIcon
              className={clsx('h-4 w-4 transition-transform duration-200', open ? 'rotate-180' : '')}
            />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute left-1/2 top-full z-40 mt-5 w-[min(95vw,960px)] -translate-x-1/2">
              <div
                className={clsx(
                  'overflow-hidden rounded-[28px] border px-6 py-6 shadow-[0_40px_120px_-60px_rgba(14,45,18,0.35)] backdrop-blur-xl transition-colors duration-200',
                  panelTone
                )}
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-brand-primary">
                        Browse {item.label}
                      </p>
                    </div>
                    <div className="relative w-full max-w-[15rem] sm:max-w-[18rem]">
                      <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-primary/60" />
                      <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={`Search ${item.label.toLowerCase()}`}
                        className="w-full rounded-full border border-brand-primary/30 bg-white/80 py-2 pl-10 pr-3 text-sm text-brand-deep shadow-inner outline-none transition focus:border-brand-primary focus:bg-white"
                      />
                    </div>
                  </div>
                  <div className="max-h-80 space-y-6 overflow-y-auto pr-1">
                    {showEmptyState ? (
                      <div className="rounded-2xl border border-dashed border-brand-primary/40 bg-white/70 py-6 text-center text-sm text-brand-deep/60">
                        No matches yet. Try another keyword.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                          {filtered.map((column: any) => (
                          <div key={column.title} className="space-y-4">
                            <div>
                              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.4em] text-brand-primary">
                                {column.title}
                              </p>
                              <div className="mt-2 h-[2px] w-9 rounded-full bg-brand-primary/40" />
                            </div>
                            <ul className="space-y-3">
                                {column.items.map((link: any) => (
                                <li key={link.path}>
                                   <NavLink
                                     to={link.path}
                                     onClick={() => {
                                       close();
                                       scrollToTop();
                                     }}
                                     className={({ isActive }) =>
                                       clsx(
                                         'block rounded-2xl border border-transparent p-4 transition-colors duration-200 hover:border-brand-primary/40 hover:bg-brand-primary/5',
                                         isActive && 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                       )
                                     }
                                   >
                                    <p className="text-sm font-semibold text-brand-deep">{link.label}</p>
                                    {link.description && (
                                      <p className="mt-1 text-xs text-slate-500">{link.description}</p>
                                    )}
                                  </NavLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

type DropdownNavItemProps = {
  item: NavConfig;
  tone: 'floating' | 'pinned';
};

const DropdownNavItem = ({ item, tone }: DropdownNavItemProps) => {
  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button
            className={clsx(
              navLinkBase,
              'flex items-center gap-2 rounded-lg transition-all duration-300 hover:bg-white/20',
              tone === 'floating'
                ? 'text-brand-deep/90 hover:text-brand-primary'
                : 'text-brand-deep/90 hover:text-brand-primary',
              open && 'text-brand-primary bg-white/20'
            )}
          >
            <span>{item.label}</span>
            <ChevronDownIcon
              className={clsx('h-4 w-4 transition-transform duration-200', open ? 'rotate-180' : '')}
            />
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
             <Popover.Panel className="absolute left-1/2 top-full z-40 mt-5 w-72 -translate-x-1/2">
               <div className="max-h-72 overflow-y-auto rounded-2xl border border-brand-primary/20 bg-white p-4 shadow-xl">
                <ul className="space-y-2">
                  {item.children?.map((child) => (
                    <li key={child.path}>
                       <NavLink
                         to={child.path}
                         onClick={() => {
                           close();
                           scrollToTop();
                         }}
                         className={({ isActive }) =>
                           clsx(
                             'block rounded-xl border border-transparent px-3 py-2 text-sm text-brand-deep/70 transition hover:border-brand-primary/40 hover:text-brand-primary',
                             isActive && 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                           )
                         }
                       >
                        <p className="font-semibold text-brand-deep">{child.label}</p>
                        {child.description && (
                          <p className="text-xs text-slate-500">{child.description}</p>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

const MobileNav = ({ onNavigate, queries, onQueryChange, items }: MobileNavProps & { items: NavConfig[] }) => {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const key = item.label;
        const query = queries[key] ?? '';
        const columns = item.megaMenu ?? [];
        const filtered = filterColumns(columns, query);

        if (item.megaMenu || item.children) {
          return (
            <Disclosure key={key}>
              {({ open }) => (
                <div className="rounded-2xl border border-brand-primary/20 bg-white/95 p-4 shadow-sm">
                  <Disclosure.Button className="flex w-full items-center justify-between px-2 py-2 text-left text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-brand-deep/80">
                    <span>{item.label}</span>
                    <ChevronDownIcon
                      className={clsx('h-4 w-4 transition-transform duration-200', open ? 'rotate-180' : '')}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="space-y-3 border-t border-brand-primary/20 pt-4">
                    {item.megaMenu && (
                      <div className="relative">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-primary/60" />
                        <input
                          type="search"
                          value={query}
                          onChange={(event) => onQueryChange(key, event.target.value)}
                          placeholder={`Search ${item.label.toLowerCase()}`}
                          className="w-full rounded-full border border-brand-primary/30 bg-white py-2 pl-9 pr-3 text-xs text-brand-deep outline-none"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      {item.children?.map((child) => (
                         <NavLink
                           key={child.path}
                           to={child.path}
                           onClick={() => {
                             onNavigate();
                             scrollToTop();
                           }}
                           className="block rounded-xl border border-transparent bg-brand-lime/10 px-4 py-3 text-sm text-brand-deep/80 transition hover:border-brand-primary/40 hover:bg-brand-primary/10 hover:text-brand-primary"
                         >
                          {child.label}
                        </NavLink>
                      ))}
                      {item.megaMenu && (
                        <div className="space-y-3">
                          {filtered.map((column: any) => (
                            <div key={column.title}>
                              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-brand-primary">
                                {column.title}
                              </p>
                              <div className="mt-2 space-y-1">
                                {column.items.map((link: any) => (
                                   <NavLink
                                     key={link.path}
                                     to={link.path}
                                     onClick={() => {
                                       onNavigate();
                                       scrollToTop();
                                     }}
                                     className="block rounded-lg border border-transparent px-3 py-2 text-sm text-brand-deep/70 transition hover:border-brand-primary/40 hover:bg-brand-primary/10 hover:text-brand-primary"
                                   >
                                    {link.label}
                                  </NavLink>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>
          );
        }

        return (
          <NavLink
            key={key}
            to={item.path}
            onClick={() => {
              onNavigate();
              scrollToTop();
            }}
            className="block rounded-2xl border border-brand-primary/20 bg-white/95 px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-brand-deep/80 transition hover:border-brand-primary/40 hover:bg-brand-primary/10 hover:text-brand-primary"
          >
            {item.label}
          </NavLink>
        );
      })}
    </div>
  );
};

const Navbar = () => {
  const { pathname } = useLocation();
  const { content } = useContent();
  const items: NavConfig[] = content?.navItems ?? [];
  const company = content?.companyInfo ?? { phone: '', hours: '', rcNumber: '', exportLicense: '' } as any;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileQueries, setMobileQueries] = useState<Record<string, string>>({});
  const [isPinned, setIsPinned] = useState(false);

  
  useEffect(() => {
    const onScroll = () => {
      setIsPinned(window.scrollY > 120);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleGlobalSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.info('Global navigation search query:', searchQuery);
  };

  const navTone: 'floating' | 'pinned' = isPinned ? 'pinned' : 'floating';

  return (
    <div className="sticky top-0 h-7 z-40">
      <div
        className={clsx(
          'transition-all duration-500 h-[0px]',
          isPinned ? ' shadow-[0_20px_80px_-40px_rgba(10,45,18,0.3)] backdrop-blur-md' : 'bg-white'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 ">
          <div
            className={clsx(
              'relative flex items-center bg-white/95 justify-between gap-4 rounded-[28px] borde px-6 py-3 transition-all duration-500',
              isPinned
                ? 'mt-3 border-brand-primary/20 bg-white/98 shadow-lg'
                : 'top-[60px] -translate-y-16 border-brand-primary/30 bg-white/95 shadow-[0_50px_140px_-60px_rgba(10,45,18,0.4)] backdrop-blur-sm'
            )}
          >
            <NavLink to="/" className="flex items-center gap-3 text-brand-deep/80 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-primary/30 bg-white shadow-sm">
                <ImageWithFallback src={logo} alt="Global XT" className="h-6 w-6 object-contain" />
              </div>
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em]">Export Licence {company.exportLicense}</span>
            </NavLink>
            <DesktopNav tone={navTone} items={items} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen((prev) => !prev)}
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-brand-primary/30 bg-white/20 text-brand-primary transition hover:border-brand-primary hover:bg-white/30 hover:text-brand-primary/70 lg:flex"
                aria-label="Toggle search"
                aria-expanded={searchOpen}
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-primary/30 bg-white/20 text-brand-primary transition hover:border-brand-primary hover:bg-white/30 hover:text-brand-primary/70 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="mx-auto max-w-6xl px-4 pb-4 pt-3 sm:px-6">
            <form
              onSubmit={handleGlobalSearch}
              className="flex items-center gap-3 rounded-full border border-brand-primary/25 bg-white px-4 py-3 shadow-[0_28px_60px_-45px_rgba(10,45,18,0.45)]"
            >
              <MagnifyingGlassIcon className="h-5 w-5 text-brand-primary" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search Global XT navigation"
                className="flex-1 border-none text-sm text-brand-deep outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-brand-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-brand-lime"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      <Transition
        show={mobileOpen}
        as={Fragment}
        enter="transition duration-200 ease-out"
        enterFrom="opacity-0 -translate-y-4"
        enterTo="opacity-100 translate-y-0"
        leave="transition duration-150 ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-4"
      >
        <div className="lg:hidden">
          <div className="h-screen overflow-y-auto border-t border-brand-primary/20 bg-gradient-to-b from-brand-primary/5 to-white px-4 py-6 shadow-[0_25px_90px_-60px_rgba(10,45,18,0.45)] backdrop-blur-md">
            <div className="flex items-center justify-between pb-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-brand-deep/70">
                Explore Global XT
              </p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-slate-200 p-2 text-brand-deep"
                aria-label="Close navigation"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <MobileNav onNavigate={() => setMobileOpen(false)} queries={mobileQueries} onQueryChange={(key, value) => setMobileQueries((prev) => ({ ...prev, [key]: value }))} items={items} />
            <div className="mt-6 space-y-3 text-xs uppercase tracking-[0.32em] text-brand-deep/60">
              {buildMobileSupport(company).map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-brand-primary/20 bg-brand-lime/10 px-4 py-3 text-[0.7rem]">
                  <span>{item.label}</span>
                  {item.href ? (
                    <a href={item.href} className="font-semibold text-brand-primary">
                      {item.value}
                    </a>
                  ) : (
                    <span className="font-semibold text-brand-primary">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-brand-primary/20 bg-gradient-to-r from-brand-primary/5 to-brand-lime/10 p-4 text-brand-deep">
              <p className="text-sm font-semibold text-brand-primary">Need help?</p>
              <a
                href={'tel:' + company.phone}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-lime"
              >
                <PhoneArrowUpRightIcon className="h-4 w-4" />
                Call {company.phone}
              </a>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default Navbar;








