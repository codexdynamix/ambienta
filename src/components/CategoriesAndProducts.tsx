import React from 'react';
import { Search, Sparkles, AlertCircle, ShoppingCart, Star, CheckCircle, Moon, Flame, Zap, Heart, ShieldCheck } from 'lucide-react';
import { CatalogItem, StoreCategory } from '../types/pharmacy';

interface CategoriesAndProductsProps {
  catalogItems: CatalogItem[];
  onSelectItem: (item: CatalogItem) => void;
  selectedCategory: StoreCategory | 'All Products';
  onSelectCategory: (category: StoreCategory | 'All Products') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const STORE_CATEGORIES: (StoreCategory | 'All Products')[] = [
  'All Products',
  'Sleep',
  'Weight Loss',
  'Energy & Focus',
  'Heart & Circulation',
  'Digestive Health',
  'Daily Wellness',
  'Pain & Recovery',
];

export const CategoriesAndProducts: React.FC<CategoriesAndProductsProps> = ({
  catalogItems,
  onSelectItem,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  setSearchQuery,
}) => {
  const filteredItems = catalogItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All Products' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dosage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Sleep':
        return <Moon className="w-3.5 h-3.5 text-indigo-500" />;
      case 'Weight Loss':
        return <Flame className="w-3.5 h-3.5 text-amber-500" />;
      case 'Energy & Focus':
        return <Zap className="w-3.5 h-3.5 text-yellow-500" />;
      case 'Heart & Circulation':
        return <Heart className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />;
    }
  };

  return (
    <section id="store-catalog" className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>AuraCare Wellness Dispensary Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {selectedCategory === 'All Products'
                ? 'All Health & Wellness Products'
                : `${selectedCategory} Formulations`}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Showing {filteredItems.length} clinical-grade wellness {filteredItems.length === 1 ? 'item' : 'items'} available for rapid delivery
            </p>
          </div>

          {/* Quick in-catalog search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, ingredients..."
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700 shadow-2xs"
            />
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {STORE_CATEGORIES.map((cat) => {
            const count =
              cat === 'All Products'
                ? catalogItems.length
                : catalogItems.filter((i) => i.category === cat).length;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-teal-800 text-white shadow-sm ring-2 ring-teal-800/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {cat !== 'All Products' && getCategoryIcon(cat)}
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isSelected ? 'bg-teal-900/60 text-teal-200' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isOutOfStock = !item.inStock || item.stockCount <= 0;
            const isLowStock = item.stockCount <= item.minStockThreshold && !isOutOfStock;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Product Image */}
                  <div className="aspect-4/3 w-full bg-slate-100 overflow-hidden border-b border-slate-100 relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-700">
                        {getCategoryIcon(item.category)}
                      </div>
                    )}

                    {/* Stock Overlay */}
                    {isOutOfStock ? (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="text-white text-xs font-bold px-3 py-1 bg-rose-600 rounded shadow-xs">
                          Temporarily Out of Stock
                        </span>
                      </div>
                    ) : (
                      <div className="absolute top-2.5 left-2.5">
                        <span className="bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200/60 shadow-2xs flex items-center gap-1">
                          {getCategoryIcon(item.category)}
                          {item.category}
                        </span>
                      </div>
                    )}

                    {item.rxRequired && !isOutOfStock && (
                      <div className="absolute top-2.5 right-2.5">
                        <span className="bg-amber-100/90 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-300/80 shadow-2xs">
                          Clinical Grade
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2.5">
                    {/* Ratings */}
                    <div className="flex items-center gap-1 text-[11px] text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800">4.9</span>
                      <span className="text-slate-400 text-[10px]">(Verified Buyer Review)</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-teal-800 transition-colors line-clamp-2">
                      {item.name}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                      <span className="font-medium text-slate-600 truncate max-w-[150px]">
                        {item.dosage}
                      </span>
                      {isLowStock ? (
                        <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                          Only {item.stockCount} left
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium flex items-center gap-0.5 text-[10px]">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          In Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Price & Add to Cart */}
                <div className="p-4 pt-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider block">
                      Price
                    </span>
                    <span className="text-base font-extrabold font-mono text-slate-900">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>

                  <button
                    disabled={isOutOfStock}
                    onClick={() => onSelectItem(item)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-97"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-900">No products found</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              We couldn't find any items matching "{searchQuery}" under {selectedCategory}. Try another search term or clear the filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                onSelectCategory('All Products');
              }}
              className="mt-4 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
