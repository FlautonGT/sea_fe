'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Menu, User, Moon, Sun, LogOut, ChevronRight, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocale, useTranslation } from '@/contexts/LocaleContext';
import { generateInitials, cn } from '@/lib/utils';
import CurrencyLanguageModal from '@/components/modals/CurrencyLanguageModal';
import Logo from '@/components/ui/Logo';
import { getProducts } from '@/lib/api';
import { Product } from '@/types';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { regionCode, currency, flagUrl, getLocalizedPath } = useLocale();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [displayLimit, setDisplayLimit] = useState(5);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        setShowResults(true);
        setDisplayLimit(5); // Reset limit on new search
        try {
          // Pass 'search' param to getProducts
          const response = await getProducts(regionCode, undefined, undefined, searchQuery);
          if (response.data && Array.isArray(response.data)) {
            setSearchResults(response.data); // Store all results
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, regionCode]);

  // Focus mobile search input when opened
  useEffect(() => {
    if (showMobileSearch && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [showMobileSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(true);
      // No redirect, just ensure results are shown
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    router.push(getLocalizedPath('/'));
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        {/* Top colored bar */}
        <div className="h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href={getLocalizedPath('/')} className="flex-shrink-0">
              <Logo className="h-8 w-auto" />
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8 relative" ref={searchContainerRef}>
              <form
                onSubmit={handleSearch}
                className="w-full relative"
              >
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchQuery.length >= 2) setShowResults(true);
                    }}
                    placeholder={t('searchPlaceholder')}
                    className="w-full pl-4 pr-10 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {isSearching ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </form>

              {/* Live Search Results Dropdown */}
              {showResults && (searchResults.length > 0 || isSearching) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 max-h-96 overflow-y-auto z-[100]">
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.slice(0, displayLimit).map((product) => (
                        <Link
                          key={product.code}
                          href={getLocalizedPath(`/${product.slug}`)}
                          onClick={() => {
                            setShowResults(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b last:border-0 border-gray-50 dark:border-gray-700/50"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                            <Image
                              src={product.thumbnail}
                              alt={product.title}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {product.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {product.publisher}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </Link>
                      ))}
                      {searchResults.length > displayLimit && (
                        <button
                          onClick={() => setDisplayLimit(prev => prev + 5)}
                          className="w-full block text-center py-3 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          {t('seeAll')} ({searchResults.length - displayLimit}+)
                        </button>
                      )}
                    </div>
                  ) : !isSearching && searchQuery.length >= 2 && (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Navigation Links - Desktop */}
              <nav className="hidden lg:flex items-center gap-6">
                <Link
                  href={getLocalizedPath('/')}
                  className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  {t('home')}
                </Link>
                <Link
                  href={getLocalizedPath('/invoice')}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  {t('checkTransaction')}
                </Link>
              </nav>

              {/* Mobile Search Button */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Currency/Region Selector */}
              <button
                onClick={() => setShowCurrencyModal(true)}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  {regionCode}/{currency}
                </span>
                <Image
                  src={flagUrl}
                  alt={regionCode}
                  width={20}
                  height={15}
                  className="rounded-sm"
                />
              </button>

              {/* User Section */}
              {isAuthenticated && user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {user.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt={user.firstName}
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                        {generateInitials(user.firstName, user.lastName)}
                      </div>
                    )}
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-dropdown border border-gray-200 dark:border-gray-700 py-2 animate-scale-in">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('hi')} <span className="font-semibold text-gray-900 dark:text-white">{user.firstName} {user.lastName}!</span>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {t('welcomeBack')}
                        </p>
                      </div>

                      <div className="py-2">
                        <Link
                          href={getLocalizedPath('/dashboard')}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          {t('dashboard')}
                        </Link>

                        <Link
                          href={getLocalizedPath('/profile')}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <User className="w-4 h-4" />
                          {t('myAccount')}
                        </Link>

                        <button
                          onClick={toggleTheme}
                          className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <span className="flex items-center gap-3">
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            {t('enableDarkMode')}
                          </span>
                          <div className={cn(
                            "w-10 h-5 rounded-full transition-colors relative",
                            theme === 'dark' ? "bg-primary-500" : "bg-gray-300"
                          )}>
                            <div className={cn(
                              "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                              theme === 'dark' ? "translate-x-5" : "translate-x-0.5"
                            )} />
                          </div>
                        </button>
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={getLocalizedPath('/login')}
                  className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  {t('login')} <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Search Bar - Expandable */}
          {showMobileSearch && (
            <div className="md:hidden pb-3 animate-slide-down relative">
              <form onSubmit={handleSearch} className="relative">
                <input
                  ref={mobileSearchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.length >= 2) setShowResults(true);
                  }}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-4 pr-20 py-2.5 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="submit"
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {isSearching ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMobileSearch(false)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Mobile Live Search Results Dropdown */}
              {showResults && (searchResults.length > 0 || isSearching) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 max-h-96 overflow-y-auto z-[100]">
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.slice(0, displayLimit).map((product) => (
                        <Link
                          key={product.code}
                          href={getLocalizedPath(`/${product.slug}`)}
                          onClick={() => {
                            setShowResults(false);
                            setSearchQuery('');
                            setShowMobileSearch(false);
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b last:border-0 border-gray-50 dark:border-gray-700/50"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                            <Image
                              src={product.thumbnail}
                              alt={product.title}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {product.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {product.publisher}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </Link>
                      ))}
                      {searchResults.length > displayLimit && (
                        <button
                          onClick={() => setDisplayLimit(prev => prev + 5)}
                          className="w-full block text-center py-3 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          {t('seeAll')} ({searchResults.length - displayLimit}+)
                        </button>
                      )}
                    </div>
                  ) : !isSearching && searchQuery.length >= 2 && (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <CurrencyLanguageModal
        isOpen={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
      />
    </>
  );
}
