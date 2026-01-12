import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, CartItem, Product, OrderStatus, Role, Modifier } from '../types';
import { MOCK_MENU } from '../constants';

interface AddToCartOptions {
  modifiers?: Modifier[];
  comment?: string;
  quantity?: number;
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  cart: CartItem[];
  addToCart: (product: Product | CartItem, options?: AddToCartOptions) => void;
  removeFromCart: (uniqueId: string) => void;
  clearCart: () => void;
  orders: Order[];
  myOrderIds: string[];
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
        items: [{ ...MOCK_MENU[0], quantity: 1, uniqueId: 'init-1' }, { ...MOCK_MENU[4], quantity: 1, uniqueId: 'init-2' }],
        totalAmount: 640,
        status: OrderStatus.COOKING,
        createdAt: new Date(Date.now() - 600000).toISOString(), // 10 min ago
        paymentMethod: 'CARD'
      },
      {
        id: 'ord-8822',
        customerName: 'Анна',
        items: [{ ...MOCK_MENU[2], quantity: 2, uniqueId: 'init-3' }],
        totalAmount: 760,
        status: OrderStatus.PENDING,
        createdAt: new Date(Date.now() - 120000).toISOString(), // 2 min ago
        paymentMethod: 'CASH',
        priority: true
      }
    ];
    setOrders(initialOrders);
  }, []);

  const addToCart = (product: Product | CartItem, options?: AddToCartOptions) => {
    setCart(prev => {
      // Determine modifiers and comment
      // If 'product' is already a CartItem (from Modal), use its data, otherwise use options or defaults
      const isCartItem = 'uniqueId' in product;
      
      const modifiers = isCartItem ? (product as CartItem).modifiers : (options?.modifiers || []);
      const comment = isCartItem ? (product as CartItem).comment : (options?.comment || '');
      const quantityToAdd = isCartItem ? (product as CartItem).quantity : (options?.quantity || 1);
      
      // Generate a unique signature for this configuration to allow stacking
      // We sort modifiers by ID to ensure order doesn't affect equality
      const modSignature = modifiers?.map(m => m.id).sort().join('|') || '';
      const itemSignature = `${product.id}-${modSignature}-${comment}`;

      const existingItemIndex = prev.findIndex(item => {
        const itemModSig = item.modifiers?.map(m => m.id).sort().join('|') || '';
        const currentItemSignature = `${item.id}-${itemModSig}-${item.comment || ''}`;
        return currentItemSignature === itemSignature;
      });

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += quantityToAdd;
        return newCart;
      }

      // Add new item
      const newItem: CartItem = {
        ...product,
        quantity: quantityToAdd,
        modifiers: modifiers,
        comment: comment,
        uniqueId: `${Date.now()}-${Math.random()}` // Guaranteed unique ID for UI keys
      };
      
      return [...prev, newItem];
    });
  };

  const removeFromCart = (uniqueId: string) => {
    setCart(prev => prev.filter(item => item.uniqueId !== uniqueId));
  };

  const clearCart = () => setCart([]);

  const placeOrder = (customerName: string, tableNumber: string) => {
    if (cart.length === 0) return;

    // Calculate total including modifier prices
    const totalAmount = cart.reduce((sum, item) => {
      const modsPrice = item.modifiers?.reduce((mSum, mod) => mSum + mod.price, 0) || 0;
      return sum + ((item.price + modsPrice) * item.quantity);
    }, 0);

    const newOrderId = `ord-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newOrder: Order = {
      id: newOrderId,
      items: [...cart],
      totalAmount,
      status: OrderStatus.PENDING,
      customerName,
      tableNumber,
      createdAt: new Date().toISOString(),
      paymentMethod: 'CARD'
    };

    setOrders(prev => [newOrder, ...prev]);
    setMyOrderIds(prev => [newOrderId, ...prev]);
    clearCart();
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
            ...o, 
            status, 
            completedAt: status === OrderStatus.COMPLETED ? new Date().toISOString() : o.completedAt 
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