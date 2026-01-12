import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, CartItem, Product, OrderStatus, Role } from '../types';
import { MOCK_MENU } from '../constants';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  orders: Order[];
  myOrderIds: string[]; // IDs of orders placed by this specific client session
  placeOrder: (customerName: string, tableNumber: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  products: Product[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>(Role.CLIENT);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myOrderIds, setMyOrderIds] = useState<string[]>([]);

  // Load initial demo data
  useEffect(() => {
    const initialOrders: Order[] = [
      {
        id: 'ord-8821',
        customerName: 'Дмитрий',
        items: [{ ...MOCK_MENU[0], quantity: 1 }, { ...MOCK_MENU[4], quantity: 1 }],
        totalAmount: 640,
        status: OrderStatus.COOKING,
        createdAt: Date.now() - 600000, // 10 min ago
        paymentMethod: 'CARD'
      },
      {
        id: 'ord-8822',
        customerName: 'Анна',
        items: [{ ...MOCK_MENU[2], quantity: 2 }],
        totalAmount: 760,
        status: OrderStatus.PENDING,
        createdAt: Date.now() - 120000, // 2 min ago
        paymentMethod: 'CASH'
      }
    ];
    setOrders(initialOrders);
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const placeOrder = (customerName: string, tableNumber: string) => {
    if (cart.length === 0) return;

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrderId = `ord-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newOrder: Order = {
      id: newOrderId,
      items: [...cart],
      totalAmount,
      status: OrderStatus.PENDING,
      customerName,
      tableNumber,
      createdAt: Date.now(),
      paymentMethod: 'CARD'
    };

    setOrders(prev => [newOrder, ...prev]);
    setMyOrderIds(prev => [newOrderId, ...prev]); // Track this as "my" order
    clearCart();
    
    // Simulate Telegram Notification
    console.log(`🚀 TELEGRAM: Новый заказ ${newOrder.id} (${totalAmount}₽) - ${customerName}`);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
            ...o, 
            status, 
            completedAt: status === OrderStatus.COMPLETED ? Date.now() : o.completedAt 
        };
      }
      return o;
    }));
  };

  return (
    <AppContext.Provider value={{
      role, setRole,
      cart, addToCart, removeFromCart, clearCart,
      orders, myOrderIds, placeOrder, updateOrderStatus,
      products: MOCK_MENU
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};