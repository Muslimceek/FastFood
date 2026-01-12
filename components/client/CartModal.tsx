import React, { useState } from 'react';
import { CartItem } from '../../types';
import { X, ShoppingBag, Minus, Plus, ArrowRight } from 'lucide-react';

interface CartModalProps {
  cart: CartItem[];
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onRemoveFromCart: (id: string) => void;
  onCheckout: (name: string) => void;
}

export const CartModal: React.FC<CartModalProps> = ({ 
  cart, onClose, onAddToCart, onRemoveFromCart, onCheckout 
}) => {
  const [customerName, setCustomerName] = useState('');
  
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerName.trim()) {
      onCheckout(customerName);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full sm:max-w-[480px] h-[95vh] sm:h-auto sm:max-h-[90vh] rounded-t-[32px] sm:rounded-[32px] flex flex-col shadow-2xl animate-in slide-in-from-bottom-20 duration-300">
        <div className="p-5 border-b flex items-center justify-between bg-white rounded-t-[32px]">
          <h2 className="text-2xl font-bold text-slate-900">Мой заказ</h2>
          <button onClick={onClose} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 text-slate-500"><X size={20}/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cart.length === 0 ? (
              <div className="text-center py-20 opacity-50">
                  <ShoppingBag size={80} className="mx-auto mb-6 text-slate-300" />
                  <h3 className="text-xl font-bold text-slate-800">Тут пока пусто</h3>
                  <p className="text-slate-500 mt-2">Самое время выбрать что-то вкусное!</p>
              </div>
          ) : (
              cart.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="flex gap-4 group">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                        <img src={item.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm leading-tight pr-2 text-slate-900">{item.name}</h4>
                            <span className="font-bold whitespace-nowrap text-slate-900">{item.price * item.quantity} ₽</span>
                        </div>
                        <p className="text-xs text-slate-400">Стандарт</p>
                        
                        <div className="flex items-center gap-3 mt-auto self-start">
                            <button onClick={() => onRemoveFromCart(item.id)} className="w-8 h-8 flex items-center justify-center bg-slate-50 border rounded-lg text-slate-600 hover:text-red-500 font-bold active:scale-95 transition-colors"><Minus size={14}/></button>
                            <span className="text-sm font-bold min-w-[16px] text-center">{item.quantity}</span>
                            <button onClick={() => onAddToCart(item)} className="w-8 h-8 flex items-center justify-center bg-slate-50 border rounded-lg text-slate-600 hover:text-green-500 font-bold active:scale-95 transition-colors"><Plus size={14}/></button>
                        </div>
                    </div>
                </div>
              ))
          )}
        </div>

        <div className="p-6 border-t bg-slate-50/50 pb-8 sm:pb-6 rounded-b-[32px]">
            {cart.length > 0 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Как к вам обращаться?</label>
                        <input 
                            type="text" 
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full outline-none font-bold text-slate-800 placeholder-slate-300 text-lg"
                            placeholder="Ваше Имя"
                        />
                    </div>
                    
                    <div className="space-y-2 py-2">
                        <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                            <span>Товары</span>
                            <span>{cartTotal} ₽</span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                            <span>Итого к оплате</span>
                            <span>{cartTotal} ₽</span>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-black transition-all active:scale-[0.98] flex justify-center items-center gap-2">
                        <span>Оформить заказ</span>
                        <ArrowRight size={20} />
                    </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};