import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Check } from 'lucide-react';
import { ClientHeader } from './client/ClientHeader';
import { Banners } from './client/Banners';
import { ProductList } from './client/ProductList';
import { ProductModal } from './client/ProductModal';
import { CartModal } from './client/CartModal';
import { CartButton } from './client/CartButton';

export const ClientView: React.FC = () => {
  const { products, cart, addToCart, removeFromCart, placeOrder } = useApp();
  
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeProduct, setActiveProduct] = useState<any | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory !== 'Все') result = result.filter(p => p.category === selectedCategory);
    if (searchQuery) result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return result;
  }, [products, selectedCategory, searchQuery]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (quantity: number) => {
    if (!activeProduct) return;
    for(let i = 0; i < quantity; i++) {
        addToCart(activeProduct); 
    }
    setActiveProduct(null);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleCheckout = (customerName: string) => {
    placeOrder(customerName, `Стол 1`);
    setIsCartOpen(false);
    alert('✅ Заказ успешно отправлен на кухню!');
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-32 font-sans text-slate-800">
      
      <ClientHeader 
        isScrolled={isScrolled}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <main className="px-4 pt-4 space-y-8">
        {selectedCategory === 'Все' && !searchQuery && <Banners />}
        <ProductList products={filteredProducts} onProductClick={setActiveProduct} />
      </main>

      {/* Toast Notification */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
              <div className="bg-green-500 rounded-full p-1">
                  <Check size={12} strokeWidth={4} />
              </div>
              <span className="font-bold text-sm">Добавлено в корзину</span>
          </div>
      </div>

      {cart.length > 0 && !isCartOpen && (
        <CartButton count={cartCount} total={cartTotal} onClick={() => setIsCartOpen(true)} />
      )}

      {activeProduct && (
        <ProductModal 
          product={activeProduct} 
          onClose={() => setActiveProduct(null)} 
          onAddToCart={handleAddToCart} 
        />
      )}

      {isCartOpen && (
        <CartModal 
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onAddToCart={addToCart}
          onRemoveFromCart={removeFromCart}
          onCheckout={handleCheckout}
        />
      )}

    </div>
  );
};