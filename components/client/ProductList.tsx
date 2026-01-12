import React from 'react';
import { Product } from '../../types';
import { Plus, Search, Flame, Leaf, Star, Sparkles } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  isLoading?: boolean; // Добавили состояние загрузки
  onProductClick: (product: Product) => void;
}

// --- 1. SKELETON COMPONENT (Загрузочная заглушка) ---
// Это показывает профессионализм. Вместо "Loading..." мы показываем структуру.
const ProductSkeleton = () => (
  <div className="bg-white rounded-[24px] p-3 shadow-sm border border-slate-100 flex gap-4 animate-pulse">
    <div className="w-32 h-32 bg-slate-200 rounded-2xl flex-shrink-0"></div>
    <div className="flex-1 flex flex-col justify-between py-2">
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-3 bg-slate-100 rounded w-full"></div>
        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
      </div>
      <div className="flex justify-between items-end">
        <div className="h-6 bg-slate-200 rounded w-16"></div>
        <div className="w-9 h-9 bg-slate-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

// --- 2. HELPER FOR BADGES (Умные цвета) ---
const getBadgeStyle = (badge: string) => {
  const styles: Record<string, string> = {
    'HIT': 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
    'NEW': 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
    'HOT': 'bg-gradient-to-r from-red-600 to-rose-600 text-white',
    'VEGAN': 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
    'KIDS': 'bg-gradient-to-r from-pink-400 to-purple-400 text-white',
  };
  return styles[badge] || 'bg-slate-800 text-white';
};

const getBadgeIcon = (badge: string) => {
  switch(badge) {
    case 'HOT': return <Flame size={10} className="mr-1 fill-current" />;
    case 'VEGAN': return <Leaf size={10} className="mr-1 fill-current" />;
    case 'NEW': return <Sparkles size={10} className="mr-1 fill-current" />;
    case 'HIT': return <Star size={10} className="mr-1 fill-current" />;
    default: return null;
  }
};

export const ProductList: React.FC<ProductListProps> = ({ products, isLoading = false, onProductClick }) => {
  
  // Рендер скелетонов при загрузке
  if (isLoading) {
    return (
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
      </section>
    );
  }

  // Пустое состояние
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center opacity-60 animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
            <Search size={32} className="text-slate-400" />
        </div>
        <h3 className="font-bold text-slate-800 text-xl">Ничего не найдено</h3>
        <p className="text-sm text-slate-400 max-w-[250px] mt-2 leading-relaxed">
            Попробуйте изменить фильтры или поискать другое блюдо
        </p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map((product, index) => {
        // Логика "Нет в наличии" (для примера, если в Product будет поле isOutOfStock)
        // const isOutOfStock = product.isOutOfStock; 
        const isOutOfStock = false; // Пока false

        return (
          <div 
            key={product.id} 
            onClick={() => !isOutOfStock && onProductClick(product)}
            // Добавляем задержку анимации для эффекта "лесенки" (Stagger effect)
            style={{ animationDelay: `${index * 50}ms` }}
            className={`
                relative bg-white rounded-[24px] p-3 
                shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 
                flex gap-4 group 
                transition-all duration-300
                animate-in slide-in-from-bottom-4 fill-mode-backwards
                ${isOutOfStock ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-orange-100'}
            `}
          >
            {/* 1. IMAGE CONTAINER */}
            <div className="relative w-32 h-32 flex-shrink-0">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    loading="lazy"
                    className="w-full h-full object-cover rounded-2xl bg-slate-100 shadow-inner"
                />
                
                {/* Badges Overlay */}
                <div className="absolute top-0 left-0 flex flex-col gap-1 p-1">
                    {product.badges?.map(badge => (
                        <span key={badge} className={`text-[9px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center w-fit ${getBadgeStyle(badge)}`}>
                            {getBadgeIcon(badge)}
                            {badge}
                        </span>
                    ))}
                </div>

                {/* Discount Badge */}
                {product.oldPrice && (
                  <span className="absolute bottom-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-tl-xl rounded-br-xl shadow-md z-10">
                    -{(100 - (product.price / product.oldPrice * 100)).toFixed(0)}%
                  </span>
                )}
                
                {/* Out of Stock Overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                        <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-full">Закончилось</span>
                    </div>
                )}
            </div>
            
            {/* 2. CONTENT CONTAINER */}
            <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-900 leading-tight text-[15px] truncate pr-2">
                    {product.name}
                  </h3>
                </div>
                
                {/* Weight / Size Indicator (Dodo style) */}
                {product.weight && (
                    <p className="text-[10px] text-slate-400 font-medium mt-1 mb-1 bg-slate-50 w-fit px-1.5 py-0.5 rounded">
                        {product.weight}
                    </p>
                )}

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed h-[32px]">
                    {product.description}
                </p>
              </div>
              
              <div className="flex items-end justify-between mt-2">
                <div className="flex flex-col leading-none">
                    {product.oldPrice && (
                        <span className="text-[11px] text-slate-400 line-through font-medium mb-0.5">
                            {product.oldPrice} ₽
                        </span>
                    )}
                    <span className="font-extrabold text-[17px] text-slate-900">
                        {product.price} ₽
                    </span>
                </div>
                
                {/* Add Button */}
                <button 
                    disabled={isOutOfStock}
                    className={`
                        w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm
                        ${isOutOfStock 
                            ? 'bg-slate-100 text-slate-400' 
                            : 'bg-slate-50 text-orange-500 hover:bg-orange-500 hover:text-white active:scale-90'
                        }
                    `}
                >
                  <Plus size={20} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};