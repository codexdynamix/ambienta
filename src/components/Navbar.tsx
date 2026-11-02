import React from 'react';
import { ShoppingBag, Shield, Sparkles } from 'lucide-react';
import { StoreCategory } from '../types/pharmacy';

interface NavbarProps {
  onNavigateHome: () => void;
  onNavigateAdmin: () => void;
  openCart: () => void;
  cartCount: number;
  onSelectCategory?: (category: StoreCategory | 'All Products') => void;
  selectedCategory?: StoreCategory | 'All Products';
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateHome,
  onNavigateAdmin,
  openCart,
  cartCount,
  onSelectCategory,
  selectedCategory,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top micro bar for pharmacy certification & admin link */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Licensed Clinical Pharmacy &amp; Wellness Store #049-21841</span>
            <span className="text-slate-600">·</span>
            <span>Free Express Delivery on Orders Over $35</span>
          </div>

          <button
            onClick={onNavigateAdmin}
            className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Shield className="w-3 h-3 text-teal-400" />
            <span>Staff Portal &amp; CRM (/admin)</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
                  AuraCare Health
                </span>
                <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider block">
                  Online Wellness Store
                </span>
              </div>
            </button>
          </div>

          {/* Quick Category Jump Bar */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
            {(['All Products', 'Sleep', 'Weight Loss', 'Energy & Focus', 'Daily Wellness'] as const).map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory?.(cat)}
                  className={`px-3 py-1.5 rounded-md transition-colors text-xs font-semibold cursor-pointer ${
                    active
                      ? 'bg-teal-50 text-teal-900 border border-teal-200'
                      : 'hover:text-slate-900 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Cart Drawer Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={openCart}
              className="relative px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-semibold shadow-xs cursor-pointer"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4 h-4 text-teal-300" />
              <span>Cart</span>
              {cartCount > 0 ? (
                <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 font-mono text-[11px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              ) : (
                <span className="text-slate-400 font-mono text-[11px]">0</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
