// NavBar/index.tsx
import DesktopNav from './DesktopNav'
import MobileNav from  './MobileNav'

const NavBar = () => {
  return (
    <>
      <DesktopNav />
      <MobileNav />
    </>
  )
}

export default NavBar
```

```tsx
// NavBar/DesktopNav.tsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, UserIcon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuthUser, useIsAuthenticated } from '../store/authStore';

interface NavItem {
  href: string;
  label: string;
  subItems?: NavItem[];
}

const navLinks: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'My Journey' },
  {
    href: '/learn',
    label: 'Learn',
    subItems: [
      { href: '/learn/my-path', label: 'My Learning Path' },
      { href: '/learn/challenges', label: 'Challenges' },
      { href: '/learn', label: 'Content Library' },
      { href: '/learn/glossary', label: 'Glossary' }
    ]
  },
  {
    href: '/practice',
    label: 'Practice',
    subItems: [
      { href: '/portfolio-monitor', label: 'Virtual Portfolio' },
      { href: '/practice/sandbox', label: 'Investment Sandbox' }
    ]
  },
  {
    href: '/tools',
    label: 'Tools',
    subItems: [
      { href: '/fractional-share-calculator', label: 'Fractional Share Calculator' },
      { href: '/risk-assessment', label: 'Risk Assessment' },
      { href: '/esg-screener', label: 'ESG Screener' }
    ]
  },
  {
    href: '/community',
    label: 'Community',
    subItems: [
      { href: '/community/leaderboards', label: 'Leaderboards' },
      { href: '/community/achievements', label: 'Achievements' },
      { href: '/community/discussions', label: 'Discussions' }
    ]
  }
];

const DesktopNav = () => {
  const pathname = usePathname();
  const user = useAuthUser();
  const isAuthenticated = useIsAuthenticated();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    if (activeDropdown) {
      document.addEventListener('mousedown', onClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [activeDropdown]);

  useEffect(() => {
    setActiveDropdown(null);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  return (
    <nav className="relative bg-white border-b border-indigo-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BIH</span>
              </div>
              <span className="text-xl font-bold text-indigo-700 hidden sm:block">
                Beginner Investor Hub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
            {navLinks.map(link => (
              <div key={link.href} className="relative">
                {link.subItems ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(link.label)}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                        pathname.startsWith(link.href) && link.href !== '/'
                          ? 'bg-indigo-50 text-indigo-800'
                          : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'
                      }`}
                      aria-haspopup="true"
                      aria-expanded={activeDropdown === link.label}
                      aria-controls={`dropdown-${link.label.replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                      <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                        activeDropdown === link.label ? 'rotate-180' : ''
                      }`} />
                    </button>
                    {activeDropdown === link.label && (
                      <div
                        id={`dropdown-${link.label.replace(/\s+/g, '-')}`}
                        role="menu"
                        className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                      >
                        {link.subItems.map(subItem => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`block px-4 py-2 text-sm transition-colors duration-150 ${
                              pathname === subItem.href
                                ? 'bg-indigo-50 text-indigo-800'
                                : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                            }`}
                            onClick={() => setActiveDropdown(null)}
                            role="menuitem"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                      pathname === link.href
                        ? 'bg-indigo-50 text-indigo-800'
                        : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right side: Search, Notifications, Profile */}
          <div className="flex items-center space-x-3">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search content, tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </form>

            {isAuthenticated && (
              <>
                {/* Notifications */}
                <button
                  className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors duration-150"
                  aria-label="View notifications, 3 unread"
                >
                  <BellIcon className="h-5 w-5" />
                  {/* Notification badge */}
                  <span
                    className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                    aria-hidden="true"
                  >
                    3
                  </span>
                </button>

                {/* User Profile */}
                <Link href="/profile" className="flex items-center space-x-2 p-2 rounded-md hover:bg-indigo-50 transition-colors duration-150" aria-label="View profile and settings">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="h-8 w-8 rounded-full" />
                  ) : (
                    <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.displayName || 'Profile'}
                  </span>
                </Link>
              </>
            )}

            {!isAuthenticated && (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors duration-150"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-150"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DesktopNav;
```

```tsx
// NavBar/MobileNav.tsx
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Bars3Icon, XMarkIcon, MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuthUser, useIsAuthenticated } from '../store/authStore';

interface NavItem {
  href: string;
  label: string;
  subItems?: NavItem[];
}

const navLinks: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'My Journey' },
  {
    href: '/learn',
    label: 'Learn',
    subItems: [
      { href: '/learn/my-path', label: 'My Learning Path' },
      { href: '/learn/challenges', label: 'Challenges' },
      { href: '/learn', label: 'Content Library' },
      { href: '/learn/glossary', label: 'Glossary' }
    ]
  },
  {
    href: '/practice',
    label: 'Practice',
    subItems: [
      { href: '/portfolio-monitor', label: 'Virtual Portfolio' },
      { href: '/practice/sandbox', label: 'Investment Sandbox' }
    ]
  },
  {
    href: '/tools',
    label: 'Tools',
    subItems: [
      { href: '/fractional-share-calculator', label: 'Fractional Share Calculator' },
      { href: '/risk-assessment', label: 'Risk Assessment' },
      { href: '/esg-screener', label: 'ESG Screener' }
    ]
  },
  {
    href: '/community',
    label: 'Community',
    subItems: [
      { href: '/community/leaderboards', label: 'Leaderboards' },
      { href: '/community/achievements', label: 'Achievements' },
      { href: '/community/discussions', label: 'Discussions' }
    ]
  }
];

const MobileNav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', onClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [menuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <nav className="lg:hidden">
      {/* Mobile menu button */}
      <button
        ref={buttonRef}
        onClick={() => setMenuOpen(open => !open)}
        className="flex items-center p-2 text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors duration-150"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
      >
        {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
      </button>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div 
          id="mobile-menu"
          className="absolute top-full left-0 w-full bg-white shadow-lg z-50 border-t border-gray-200"
          role="dialog"
          aria-labelledby="mobile-menu-title"
          aria-modal="true"
        >
          <div className="px-4 py-3 space-y-1">
            <div id="mobile-menu-title" className="sr-only">Mobile Navigation Menu</div>
            {/* Mobile Search */
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <label htmlFor="mobile-search" className="sr-only">Search content and tools</label>
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                <input
                  id="mobile-search"
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-autocomplete="list"
                />
              </div>
            </form>

            {/* Mobile Navigation Links */}
            {navLinks.map((link) => (
              <div key={link.href}>
                <Link
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
                {link.subItems && (
                  <div className="ml-4 mt-1 space-y-1">
                    {link.subItems.map(subItem => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`block px-3 py-1 text-sm rounded-md transition-colors duration-150`}
                        onClick={() => setMenuOpen(false)}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Mobile Auth Links */}
            {!useIsAuthenticated() && (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link
                  href="/login"
                  className="block px-3 py-2 text-base font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors duration-150"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 text-base font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-150"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}

            {useIsAuthenticated() && (
              <div className="pt-4 border-t border-gray-200">
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-indigo-50 rounded-md transition-colors duration-150"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserIcon className="h-5 w-5 mr-2" />
                  Profile & Settings
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default MobileNav;
