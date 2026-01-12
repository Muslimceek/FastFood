export enum OrderStatus {
  PENDING = 'PENDING',
  COOKING = 'COOKING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum Role {
  CLIENT = 'CLIENT',
  CHEF = 'CHEF',
  MANAGER = 'MANAGER'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  calories: number;
  description: string;
  oldPrice?: number;
  weight?: string;
  nutrients?: {
    proteins: number;
    fats: number;
    carbs: number;
  };
  badges?: string[];
}

export interface Modifier {
  id: string;
  name: string;
  price: number;
  action?: 'add' | 'remove'; // 'remove' for ingredients being taken out
}

export interface CartItem extends Product {
  quantity: number;
  modifiers?: Modifier[];
  comment?: string;
  uniqueId?: string; // To distinguish the same product with different modifiers in cart
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  customerName: string;
  tableNumber?: string;
  createdAt: string; // ISO String for consistent serialization
  completedAt?: string;
  paymentMethod: 'CARD' | 'CASH';
  priority?: boolean;
  allergies?: string[];
}

export interface SalesMetric {
  hour: string;
  sales: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  count: number;
  revenue: number;
}