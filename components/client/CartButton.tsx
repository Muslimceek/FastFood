import React, { useEffect, useState } from 'react';
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';

interface CartButtonProps {
  count: number;
  total: number;
  onClick: () => void;
  freeDeliveryThreshold?: number; // Новая опция: сумма для бесплатной доставки
}

export const CartButton: React.FC<CartButtonProps> = ({ 
  count, 
  total, 
  onClick,
  freeDeliveryThreshold = 1500 // По умолчанию 1500р для бесплатной доставки
}) => {
  const [isBumping, setIsBumping] = useState(false);

  // Логика "Прыжка" кнопки при изменении количества
  useEffect(() => {
    if (count === 0) return;
    setIsBumping(true);
    const timer = setTimeout(() => setIsBumping(false), 300); // 300ms анимация
    return () => clearTimeout(timer);
  }, [count]);

  // Расчет прогресса бесплатной доставки
  const deliveryProgress = Math.min((total / freeDeliveryThreshold) * 100, 100);
  const remainingForFree = freeDeliveryThreshold - total;

  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 flex flex-col items-center gap-2 animate-in slide-in-from-bottom-10 duration-500">
      
      {/* 1. UPSELL BUBBLE (Всплывашка сверху, как в Delivery Club) */}
      {remainingForFree > 0 ? (
        <div className="bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-slate-200 animate-bounce-slow flex items-center gap-1.5">
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
          Ещё {remainingForFree} ₽ до бесплатной доставки
        </div>
      ) : (
        <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 animate-in zoom-in">
          <Sparkles size={12} fill="currentColor" />
          Бесплатная доставка доступна!
        </div>
      )}

      {/* 2. MAIN BUTTON */}
      <button 
        onClick={onClick}
        className={`
            relative w-full max-w-[500px] 
            bg-slate-900 text-white 
            p-1 rounded-2xl 
            shadow-[0_8px_30px_rgb(0,0,0,0.3)] 
            active:scale-[0.98] transition-all duration-200
            group overflow-hidden
            ${isBumping ? 'scale-[1.02]' : 'scale-100'}
        `}
      >
        {/* Progress Bar Background (Геймификация) */}
        <div 
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-500 ease-out opacity-80"
            style={{ width: `${deliveryProgress}%` }}
        />

        {/* Button Content */}
        <div className="relative bg-slate-900/50 backdrop-blur-sm rounded-xl p-3.5 flex items-center justify-between z-10">
            
            {/* Left: Counter & Icon */}
            <div className="flex items-center gap-3.5">
                <div className="relative">
                    <div className="bg-white/10 p-2 rounded-xl group-hover:bg-orange-500 transition-colors duration-300">
                        <ShoppingBag size={20} className="text-white" />
                    </div>
                    <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full border-2 border-slate-900 shadow-sm">
                        {count}
                    </span>
                </div>
                
                <div className="flex flex-col items-start">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">
                        Итого
                    </span>
                    <span className="text-lg font-bold leading-none">
                        {total} ₽
                    </span>
                </div>
            </div>

            {/* Right: Action Label */}
            <div className="flex items-center gap-2 pr-1">
                <span className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">
                    К оформлению
                </span>
                <div className="bg-white/10 rounded-full p-1.5 group-hover:bg-white group-hover:text-slate-900 transition-all duration-300">
                    <ArrowRight size={18} />
                </div>
            </div>
        </div>
      </button>
    </div>
  );
};