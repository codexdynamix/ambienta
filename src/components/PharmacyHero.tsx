import React from 'react';
import { Search, Moon, Flame, Zap, Heart, Sparkles, ShieldCheck, Truck, Award } from 'lucide-react';
import { StoreCategory } from '../types/pharmacy';

interface PharmacyHeroProps {
  selectedCategory: StoreCategory | 'All Products';
  onSelectCategory: (cat: StoreCategory | 'All Products') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const PharmacyHero: React.FC<PharmacyHeroProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  setSearchQuery,
}) => {
  const storeCategories: { name: StoreCategory; icon: React.ReactNode; count: string }[] = [
    { name: 'Sleep', icon: <Moon className="w-3.5 h-3.5" />, count: '3 formulas' },
    { name: 'Weight Loss', icon: <Flame className="w-3.5 h-3.5" />, count: '3 formulas' },
    { name: 'Energy & Focus', icon: <Zap className="w-3.5 h-3.5" />, count: '2 formulas' },
    { name: 'Heart & Circulation', icon: <Heart className="w-3.5 h-3.5" />, count: '2 formulas' },
    { name: 'Digestive Health', icon: <Sparkles className="w-3.5 h-3.5" />, count: '2 formulas' },
    { name: 'Daily Wellness', icon: <ShieldCheck className="w-3.5 h-3.5" />, count: '2 formulas' },
  ];

  return (
    <div className="relative bg-gradient-to-b from-teal-900 via-teal-950 to-slate-950 text-white overflow-hidden border-b border-teal-800/40">
      {/* Subtle organic ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="max-w-3xl">
          {/* Clinical Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/60 border border-teal-600/40 text-teal-300 text-xs font-semibold mb-4 backdrop-blur-xs">
            <Award className="w-3.5 h-3.5 text-teal-300" />
            <span>Apothecary &amp; Physician-Formulated Wellness</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Clinical Health, Sleep &amp; Metabolic Store
          </h1>

          <p className="mt-4 text-base sm:text-lg text-teal-100/90 leading-relaxed font-normal">
            Targeted clinical treatments for restful sleep, metabolic weight balance, daily vitality,
            and physician-formulated nutritional care shipped directly to your doorstep.
          </p>

          {/* Quick Search & Category Filters */}
          <div className="mt-8 space-y-4">
            <div className="relative max-w-xl">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sleep, weight loss, vitality, or vitamins..."
                className="w-full bg-white text-slate-900 placeholder:text-slate-400 rounded-lg pl-11 pr-4 py-3 text-sm font-medium border border-teal-300/40 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold bg-slate-100 px-1.5 py-0.5 rounded cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Category Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => onSelectCategory('All Products')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === 'All Products'
                    ? 'bg-teal-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
                }`}
              >
                All Products
              </button>
              {storeCategories.map((cat) => {
                const isActive = selectedCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => onSelectCategory(cat.name)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-teal-400 text-slate-950 font-bold shadow-sm'
                        : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Value Props Bar */}
        <div className="mt-10 pt-8 border-t border-teal-800/50 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-teal-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-teal-800/80 flex items-center justify-center text-teal-300 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Discreet Priority Delivery</p>
              <p className="text-teal-300/70 text-[11px]">Same-day courier and tracked mail</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-teal-800/80 flex items-center justify-center text-teal-300 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Laboratory Verified Purity</p>
              <p className="text-teal-300/70 text-[11px]">Third-party tested potency &amp; safety</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-teal-800/80 flex items-center justify-center text-teal-300 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Licensed Clinical Oversight</p>
              <p className="text-teal-300/70 text-[11px]">Direct clinical team support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
