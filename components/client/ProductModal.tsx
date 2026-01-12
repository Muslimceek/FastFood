import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, Modifier, CartItem } from '../../types';
import { 
  X, Plus, Minus, Check, Info, 
  Flame, Wheat, AlertCircle 
} from 'lucide-react';

// --- TYPES FOR MODALS ---

type ModifierType = 'single' | 'multi';

interface ModifierOption {
  id: string;
  name: string;
  price: number;
  calories?: number;
}

interface ModifierGroup {
  id: string;
  title: string;
  type: ModifierType;
  required: boolean;
  options: ModifierOption[];
}

// --- MOCK DATA ---
const MOCK_MODIFIER_GROUPS: ModifierGroup[] = [
  {
    id: 'g_size',
    title: 'Размер порции',
    type: 'single',
    required: true,
    options: [
      { id: 'sz_s', name: 'Стандарт', price: 0, calories: 0 },
      { id: 'sz_l', name: 'Большой (+30%)', price: 150, calories: 120 },
    ]
  },
  {
    id: 'g_remove',
    title: 'Убрать ингредиенты',
    type: 'multi',
    required: false,
    options: [
      { id: 'rem_onion', name: 'Без лука', price: 0 },
      { id: 'rem_sauce', name: 'Без соуса', price: 0 },
    ]
  },
  {
    id: 'g_extras',
    title: 'Добавить вкус',
    type: 'multi',
    required: false,
    options: [
      { id: 'ext_jalapeno', name: 'Халапеньо', price: 49, calories: 10 },
      { id: 'ext_cheese', name: 'Сырный соус', price: 39, calories: 90 },
      { id: 'ext_bacon', name: 'Бекон', price: 69, calories: 150 },
    ]
  }
];

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

// --- SUB-COMPONENTS ---
const NutrientPill = ({ value, label, icon }: { value: string | number, label: string, icon?: React.ReactNode }) => (
  <div className="flex-1 bg-slate-50 p-3 rounded-2xl text-center border border-slate-100 flex flex-col items-center justify-center gap-1">
    {icon && <div className="text-slate-400 mb-1">{icon}</div>}
    <span className="block font-black text-slate-900 text-sm leading-none">{value}</span>
    <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">{label}</span>
  </div>
);

const SectionHeader = ({ title, required }: { title: string, required?: boolean }) => (
  <div className="flex justify-between items-end mb-3 mt-6">
    <h3 className="font-bold text-slate-900 text-base">{title}</h3>
    {required && (
      <span className="text-[10px] font-bold text-white bg-slate-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
        Обязательно
      </span>
    )}
  </div>
);

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const defaults: Record<string, string[]> = {};
    MOCK_MODIFIER_GROUPS.forEach(group => {
      if (group.type === 'single' && group.required && group.options.length > 0) {
        defaults[group.id] = [group.options[0].id];
      } else {
        defaults[group.id] = [];
      }
    });
    setSelections(defaults);
  }, []);

  const handleToggleOption = (groupId: string, optionId: string, type: ModifierType) => {
    if (navigator.vibrate) navigator.vibrate(10);

    setSelections(prev => {
      const currentGroup = prev[groupId] || [];
      if (type === 'single') {
        return { ...prev, [groupId]: [optionId] };
      } else {
        const exists = currentGroup.includes(optionId);
        const newGroup = exists 
          ? currentGroup.filter(id => id !== optionId) 
          : [...currentGroup, optionId];
        return { ...prev, [groupId]: newGroup };
      }
    });
  };

  const calculateTotal = useMemo(() => {
    let modifiersPrice = 0;
    MOCK_MODIFIER_GROUPS.forEach(group => {
      const selectedIds = selections[group.id] || [];
      selectedIds.forEach(id => {
        const option = group.options.find(o => o.id === id);
        if (option) modifiersPrice += option.price;
      });
    });
    return (product.price + modifiersPrice) * quantity;
  }, [product.price, selections, quantity]);

  const isValid = useMemo(() => {
    return MOCK_MODIFIER_GROUPS.every(group => {
      if (!group.required) return true;
      const selected = selections[group.id];
      return selected && selected.length > 0;
    });
  }, [selections]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handleSubmit = () => {
    if (!isValid) return;
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    
    // Transform selections Record into Modifier[]
    const modifiersList: Modifier[] = [];
    MOCK_MODIFIER_GROUPS.forEach(group => {
      const selectedIds = selections[group.id] || [];
      selectedIds.forEach(id => {
        const option = group.options.find(o => o.id === id);
        if (option) {
          modifiersList.push({
            id: option.id,
            name: option.name,
            price: option.price,
            action: group.id.includes('rem') ? 'remove' : 'add'
          });
        }
      });
    });

    const cartItem: CartItem = {
      ...product,
      quantity,
      modifiers: modifiersList,
      comment,
      uniqueId: '' // Will be generated in AppContext
    };

    onAddToCart(cartItem);
    handleClose();
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 transition-all duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={handleClose} />
      
      <div ref={contentRef} className={`relative bg-white w-full sm:max-w-[480px] h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-[32px] sm:rounded-[32px] flex flex-col shadow-2xl overflow-hidden transform transition-transform duration-300 ease-out ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}>
        
        {/* HERO IMAGE */}
        <div className="relative h-64 sm:h-72 bg-slate-100 shrink-0 group">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            <button onClick={handleClose} className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white hover:text-slate-900 transition-all active:scale-90 z-20">
                <X size={20} strokeWidth={2.5} />
            </button>
            <div className="absolute bottom-4 left-6 right-6 text-white z-10">
               <h2 className="text-3xl font-black leading-tight shadow-sm">{product.name}</h2>
            </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-white relative z-10">
            <div className="p-6 space-y-8 pb-32">
                <section className="space-y-6">
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">{product.description}</p>
                  <div className="flex gap-3">
                      <NutrientPill value={product.calories || 250} label="ккал" icon={<Flame size={14} className="text-orange-500" fill="currentColor"/>} />
                      <NutrientPill value={product.weight || '300 г'} label="вес" icon={<Info size={14} className="text-blue-500"/>} />
                      <NutrientPill value={(product.nutrients?.proteins || 12) + ' г'} label="белки" icon={<Wheat size={14} className="text-yellow-500"/>} />
                  </div>
                  <div className="flex items-start gap-2 bg-yellow-50 p-3 rounded-xl text-xs text-yellow-800 border border-yellow-100">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>Содержит аллергены: глютен, лактоза.</span>
                  </div>
                </section>

                <hr className="border-slate-100" />

                <section>
                   {MOCK_MODIFIER_GROUPS.map(group => (
                     <div key={group.id}>
                       <SectionHeader title={group.title} required={group.required} />
                       <div className="space-y-3">
                         {group.options.map(option => {
                           const isSelected = selections[group.id]?.includes(option.id);
                           return (
                             <div 
                               key={option.id} 
                               onClick={() => handleToggleOption(group.id, option.id, group.type)}
                               className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 select-none active:scale-[0.99] ${isSelected ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500 shadow-sm' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                             >
                                <div className="flex items-center gap-4">
                                   <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-200 ${isSelected ? 'bg-orange-500 border-orange-500 scale-110' : 'border-slate-300 bg-slate-50'}`}>
                                     {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                                   </div>
                                   <div>
                                     <span className={`block text-sm font-bold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{option.name}</span>
                                     {option.calories && <span className="text-[10px] text-slate-400 font-medium">{option.calories} ккал</span>}
                                   </div>
                                </div>
                                {option.price > 0 ? <span className="text-sm font-bold text-slate-900">+{option.price} ₽</span> : <span className="text-xs font-bold text-slate-400 uppercase">Бесплатно</span>}
                             </div>
                           );
                         })}
                       </div>
                     </div>
                   ))}
                </section>

                <section>
                   <SectionHeader title="Комментарий к заказу" />
                   <textarea
                       value={comment}
                       onChange={(e) => setComment(e.target.value)}
                       placeholder="Например: уберите салфетки, побольше соуса..."
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none h-24 placeholder:text-slate-400"
                   />
                </section>
            </div>
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
            <div className="flex items-center gap-4 max-w-[480px] mx-auto">
                <div className="flex items-center bg-slate-100 rounded-xl p-1 h-14 shrink-0">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className={`w-12 h-full flex items-center justify-center rounded-lg transition-colors ${quantity === 1 ? 'text-slate-300' : 'text-slate-900 hover:bg-white shadow-sm'}`} disabled={quantity === 1}><Minus size={20} /></button>
                    <span className="w-8 text-center font-black text-lg text-slate-900">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full flex items-center justify-center rounded-lg text-slate-900 hover:bg-white shadow-sm transition-colors"><Plus size={20} /></button>
                </div>
                <button onClick={handleSubmit} disabled={!isValid} className={`flex-1 h-14 rounded-2xl font-bold text-lg flex items-center justify-between px-6 transition-all duration-300 shadow-lg active:scale-[0.98] ${isValid ? 'bg-orange-500 text-white shadow-orange-500/30 hover:bg-orange-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                    <span>{isValid ? 'Добавить' : 'Выберите опции'}</span>
                    <span>{calculateTotal} ₽</span>
                </button>
            </div>
            <div className="h-2 w-full"></div> 
        </div>

      </div>
    </div>
  );
};