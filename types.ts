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

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  customerName: string;
  tableNumber?: string;
  createdAt: number; // timestamp
  completedAt?: number;
  paymentMethod: 'CARD' | 'CASH';
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