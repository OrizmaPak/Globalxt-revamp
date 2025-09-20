import { Fragment, useEffect, useState } from 'react';
import { Popover, Transition, Disclosure } from '@headlessui/react';
import {
  Bars3Icon,
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';

import { companyInfo, navItems } from '../data/siteContent';

const navLinkBase = 'relative px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition';

const DesktopNav = () => {
  return (
    <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
      {navItems.map((item) => {
        if (item.megaMenu) {
          return <MegaMenu key={item.label} item={item} />;
        }

        if (item.children) {
          return <DropdownNavItem key={item.label} item={item} />;
        }

        return (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                navLinkBase,
                'text-white/80 hover:text-white relative',
                isActive &&
                  'text-brand-yellow after:absolute after:left-3 after:right-3 after:bottom-0 after:h-0.5 after:bg-brand-lime'
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

type NavConfig = (typeof navItems)[number];

type MegaMenuProps = {
  item: NavConfig;
};

const MegaMenu = ({ item }: MegaMenuProps) => {
  const [query, setQuery] = useState('');
  const baseColumns = item.megaMenu ?? [];
  const normalizedQuery = query.trim().toLowerCase();

  const filteredColumns = baseColumns
    .map((column) => {
      const items = column.items.filter(({ label, description }) => {
        const haystack = (label + ' ' + (description ?? '')).toLowerCase();
        return haystack.includes(normalizedQuery);
      });
      return { ...column, items };
    })
    .filter((column) => column.items.length > 0);

  const shouldFilter = normalizedQuery.length > 0;
  const columnsToRender = shouldFilter ? filteredColumns : baseColumns;

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={clsx(
              navLinkBase,
              'flex items-center gap-2 text-white/80 hover:text-white',
              open && 'text-brand-yellow'
            )}
          >
            {item.label}
            <ChevronDownIcon
              className={clsx('h-4 w-4 transition-transform', open ? 'rotate-180' : '')}
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
            <Popover.Panel className="absolute left-1/2 top-full z-40 mt-4 w-[960px] -translate-x-1/2 rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-100">
              <div className="space-y-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search products"
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand-primary focus:bg-white"
                  />
                </div>
                <div className="max-h-80 overflow-y-auto pr-2">
                  {shouldFilter && columnsToRender.length === 0 ? (
                    <p className="px-2 py-6 text-center text-sm text-slate-500">
                      No matches found. Try another keyword.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                      {columnsToRender.map((column) => (
                        <div key={column.title}>
                          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
                            {column.title}
                          </h3>
                          <ul className="mt-4 space-y-3">
                            {column.items.map((link) => (
                              <li key={link.path}>
                                <NavLink
                                  to={link.path}
                                  className={({ isActive }) =>
                                    clsx(
                                      'block rounded-2xl border border-transparent p-3 transition hover:border-brand-lime/50 hover:bg-brand-lime/10',
                                      isActive && 'border-brand-lime bg-brand-lime/10'
                                    )
                                  }
                                >
                                  <p className="text-sm font-semibold text-slate-900">{link.label}</p>
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
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

type DropdownNavItemProps = {
  item: NavConfig;
};

const DropdownNavItem = ({ item }: DropdownNavItemProps) => {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={clsx(
              navLinkBase,
              'flex items-center gap-2 text-white/80 hover:text-white',
              open && 'text-brand-yellow'
            )}
          >
            {item.label}
            <ChevronDownIcon
              className={clsx('h-4 w-4 transition-transform', open ? 'rotate-180' : '')}
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
            <Popover.Panel className="absolute left-1/2 top-full z-40 mt-4 w-72 -translate-x-1/2 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-100">
              <ul className="space-y-2 overflow-y-auto pr-1">
                {item.children?.map((child) => (
                  <li key={child.path}>
                    <NavLink
                      to={child.path}
                      className={({ isActive }) =>
                        clsx(
                          'block rounded-xl px-3 py-2 text-sm transition hover:bg-brand-lime/10',
                          isActive && 'bg-brand-lime/10 text-brand-primary'
                        )
                      }
                    >
                      <p className="font-semibold text-slate-900">{child.label}</p>
                      {child.description && (
                        <p className="text-xs text-slate-500">{child.description}</p>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

const MobileNav = ({ onNavigate }: { onNavigate: () => void }) => {
  return (
    <div className="space-y-4">
      {navItems.map((item) => {
        const key = item.label;

        if (item.megaMenu || item.children) {
          return (
            <Disclosure key={key}>
              {({ open }) => (
                <div className="rounded-2xl border border-slate-700 bg-slate-800/60">
                  <Disclosure.Button className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                    <span>{item.label}</span>
                    <ChevronDownIcon
                      className={clsx('h-4 w-4 transition-transform', open ? 'rotate-180' : '')}
                    />
                  </Disclosure.Button>
                  <Disclosure.Panel className="space-y-3 border-t border-slate-700 px-4 py-3 text-sm text-white/70">
                    <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                      {item.children?.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={onNavigate}
                          className="block rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-slate-700/60"
                        >
                          {child.label}
                        </NavLink>
                      ))}
                      {item.megaMenu?.map((column) => (
                        <div key={column.title}>
                          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-brand-chartreuse">
                            {column.title}
                          </p>
                          <div className="mt-2 space-y-2">
                            {column.items.map((link) => (
                              <NavLink
                                key={link.path}
                                to={link.path}
                                onClick={onNavigate}
                                className="block rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-slate-700/60"
                              >
                                {link.label}
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      ))}
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
            onClick={onNavigate}
            className="block rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 hover:text-white"
          >
            {item.label}
          </NavLink>
        );
      })}
    </div>
  );
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleGlobalSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Placeholder search handling – integrate with real search service later.
    console.info('Global navigation search query:', searchQuery);
  };

  return (
    <div className="relative z-40 w-full top-0">
      <div className="mx-auto w-full relative max-w-6xl pb-6 px-4 sm:px-6">
        <div className="flex absolute left-1/2 -translate-x-1/2 items-center justify-between rounded-3xl bg-slate-900 px-4 py-2 shadow-lg sm:px-6 min-w-[1000px]">
          <DesktopNav />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              className={clsx(
                'flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white hover:text-brand-yellow',
                searchOpen && 'border-brand-yellow text-brand-yellow'
              )}
              aria-label="Toggle search"
              aria-expanded={searchOpen}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-white hover:text-brand-yellow lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="mx-auto mt-2 w-full max-w-6xl px-4 sm:px-6">
          <form
            onSubmit={handleGlobalSearch}
            className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-lg"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-brand-primary" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search Global XT navigation"
              className="flex-1 border-none text-sm text-slate-700 outline-none"
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

      <Transition
        show={mobileOpen}
        as={Fragment}
        enter="transition duration-150 ease-out"
        enterFrom="opacity-0 -translate-y-4"
        enterTo="opacity-100 translate-y-0"
        leave="transition duration-100 ease-in"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-4"
      >
        <div className="lg:hidden">
          <div className="border-t border-slate-800 bg-slate-900/95 px-4 py-6">
            <div className="flex items-center justify-between pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
                Explore Global XT
              </p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-slate-700 p-2 text-white"
                aria-label="Close navigation"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <MobileNav onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-800/60 p-4 text-white">
              <p className="text-sm font-semibold text-brand-yellow">Need help?</p>
              <a
                href={'tel:' + companyInfo.phone}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-lime px-4 py-2 text-sm font-semibold text-brand-deep"
              >
                Call {companyInfo.phone}
              </a>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default Navbar;
