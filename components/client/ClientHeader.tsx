import React, { useMemo } from 'react';
import { 
  ShoppingBag, Search, X, MapPin, 
  Utensils, Coffee, Pizza, Sandwich, 
  Flame, IceCream, Beef 
} from 'lucide-react';
import { CATEGORIES } from '../../constants';

// --- TYPES ---
interface ClientHeaderProps {
  isScrolled: boolean;
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  tableNumber?: string; // Added for flexibility
}

// --- HELPER: Category Icon Mapper ---
// Maps category names to visual icons for better scanning speed
const getCategoryIcon = (category: string) => {
  const lower = category.toLowerCase();
  if (lower.includes('бургер')) return <Beef size={16} />;
  if (lower.includes('ролл') || lower.includes('шаурма')) return <Sandwich size={16} />;
  if (lower.includes('снэк') || lower.includes('картоф')) return <Utensils size={16} />;
  if (lower.includes('напит') || lower.includes('кофе')) return <Coffee size={16} />;
  if (lower.includes('пицца')) return <Pizza size={16} />;
  if (lower.includes('десерт')) return <IceCream size={16} />;
  if (lower.includes('популяр') || lower.includes('хит')) return <Flame size={16} />;
  return <Utensils size={16} />;
};

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  isScrolled,
  cartCount,
  onOpenCart,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  tableNumber = "1"
}) => {

  return (
    <>
      {/* Header is 'sticky' to ensure navigation is always accessible.
        We use backdrop-blur to maintain readability over scrolling content (iOS style).
      */}
      <header 
        className={`
          sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 
          transition-all duration-300 ease-in-out
          ${isScrolled ? 'shadow-md py-2' : 'py-3'}
        `}
      >
        <div className="flex flex-col gap-3">
          
          {/* 1. TOP BAR: Branding & Actions */}
          {/* This section collapses (height: 0, opacity: 0) when scrolled to save space */}
          <div 
            className={`
              px-4 flex items-center justify-between transition-all duration-300 overflow-hidden
              ${isScrolled ? 'h-0 opacity-0 mb-0' : 'h-auto opacity-100 mb-1'}
            `}
          >
            <div>
               <h1 className="text-2xl font-black text-slate-900 flex items-center gap-1 tracking-tight">
                  FastFlow<span className="text-orange-500 text-3xl leading-none">.</span>
               </h1>
               
               {/* Location Context Badge */}
               <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg w-fit">
                 <MapPin size={12} className="text-orange-500" />
                 <span>Стол #{tableNumber}</span>
                 <span className="w-1 h-1 rounded-full bg-slate-300 mx-1" />
                 <span className="text-slate-400 font-medium normal-case">15-20 мин</span>
               </div>
            </div>
            
            {/* Cart Button (Top Right) */}
            <button 
              onClick={onOpenCart}
              className="relative p-3 bg-slate-100 rounded-full hover:bg-orange-100 hover:text-orange-600 transition-colors active:scale-95 group"
              aria-label="Open cart"
            >
              <ShoppingBag size={24} className="group-hover:fill-current transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full shadow-sm border-2 border-white animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* 2. SEARCH BAR */}
          <div className={`px-4 transition-all duration-300 ${isScrolled ? 'mt-0' : 'mt-1'}`}>
            <div className="relative group">
              <Search 
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" 
                size={18} 
              />
              <input 
                type="text"
                placeholder="Найти вкусное..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 rounded-2xl pl-10 pr-10 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white focus:shadow-sm transition-all"
              />
              
              {/* Clear Search Button (UX Improvement) */}
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-200 text-slate-500 rounded-full p-0.5 hover:bg-slate-300 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* 3. CATEGORIES SCROLL */}
          <div className="pl-4 pb-1 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth snap-x">
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    snap-start flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-bold transition-all duration-200 active:scale-95 border
                    ${isActive 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                  `}
                >
                  {/* Icon logic: Only show icon if active OR if it's the specific category logic */}
                  <span className={isActive ? 'text-orange-400' : 'text-slate-400'}>
                    {getCategoryIcon(cat)}
                  </span>
                  {cat}
                </button>
              )
            })}
            {/* Spacer for right padding */}
            <div className="w-2 shrink-0" /> 
          </div>
        </div>
      </header>
    </>
  );
};