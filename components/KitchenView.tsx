import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { 
  CheckCircle, Clock, Flame, AlertTriangle, RotateCcw, 
  Utensils, History, BellRing, Wifi, WifiOff, 
  ChefHat, Zap, ArrowRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus, CartItem } from '../types';

// --- UTILS ---

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CRITICAL_MINUTES = 15;
const WARNING_MINUTES = 10;

// --- COMPONENT: AGGREGATED PRODUCTION ITEM ---
const ProductionItem = memo(({ name, count, category }: { name: string, count: number, category: string }) => {
  return (
    <motion.div 
      layoutId={`prod-${name}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex justify-between items-center p-3 mb-2 bg-slate-800/50 rounded-lg border border-slate-700/50 backdrop-blur-sm group hover:bg-slate-700 transition-colors"
    >
      <div className="flex flex-col">
        <span className="font-semibold text-slate-200 text-sm">{name}</span>
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{category}</span>
      </div>
      <div className="h-8 w-8 flex items-center justify-center bg-slate-700 rounded text-lg font-mono font-bold text-emerald-400 group-hover:text-emerald-300 group-hover:scale-110 transition-all">
        {count}
      </div>
    </motion.div>
  );
});

// --- COMPONENT: TICKET ITEM ROW ---
const TicketItem = memo(({ item, isTicketDone }: { item: CartItem, isTicketDone: boolean }) => {
  const [localDone, setLocalDone] = useState(false);

  const toggleItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isTicketDone) setLocalDone(!localDone);
  };

  return (
    <div 
      onClick={toggleItem}
      className={cn(
        "group relative pl-3 pr-2 py-3 border-b border-dashed border-slate-700/50 last:border-0 cursor-pointer transition-all duration-200",
        localDone ? "bg-slate-800/50 opacity-60" : "hover:bg-slate-700/30"
      )}
    >
      <div className="flex justify-between items-start gap-3">
        {/* Quantity & Name */}
        <div className="flex items-start gap-3 flex-1">
          <span className={cn(
            "font-mono text-lg font-bold min-w-[1.5rem] text-center rounded leading-none pt-1",
            localDone ? "text-slate-500" : "text-emerald-400"
          )}>
            {item.quantity}
          </span>
          <div className="flex flex-col">
            <span className={cn(
              "font-medium text-base leading-tight transition-all",
              localDone ? "line-through text-slate-500" : "text-slate-100"
            )}>
              {item.name}
            </span>
            
            {/* Modifiers */}
            {item.modifiers && item.modifiers.length > 0 && (
              <div className="flex flex-col mt-1 gap-0.5">
                {item.modifiers.map(mod => (
                  <span key={mod.id} className={cn(
                    "text-xs font-bold uppercase tracking-wide",
                    mod.action === 'remove' ? "text-rose-400 line-through decoration-rose-400/50" : "text-blue-300",
                    localDone && "text-slate-600 decoration-slate-600"
                  )}>
                    {mod.action === 'remove' ? 'NO ' : ''}{mod.name}
                  </span>
                ))}
              </div>
            )}
            
            {/* Special Instructions */}
            {item.comment && (
              <div className="mt-1 flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-900/20 px-1.5 py-0.5 rounded w-fit">
                <AlertTriangle size={10} />
                {item.comment.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Checkbox Visual */}
        <div className={cn(
          "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-0.5",
          localDone ? "border-slate-500 bg-slate-500/20" : "border-slate-600 group-hover:border-slate-400"
        )}>
           {localDone && <div className="w-2.5 h-2.5 bg-slate-400 rounded-sm" />}
        </div>
      </div>
    </div>
  );
});

// --- COMPONENT: TICKET CARD ---
const TicketCard = memo(({ order, currentTime, onAction }: { 
  order: Order, 
  currentTime: Date,
  onAction: (id: string, action: 'bump' | 'recall' | 'cancel') => void
}) => {
  const elapsedMs = currentTime.getTime() - new Date(order.createdAt).getTime();
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  
  const isCritical = elapsedMinutes >= CRITICAL_MINUTES;
  const isWarning = elapsedMinutes >= WARNING_MINUTES && !isCritical;

  const cardStatusColor = useMemo(() => {
    if (order.status === OrderStatus.READY) return 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]';
    if (isCritical) return 'border-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.2)] animate-pulse-slow';
    if (isWarning) return 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
    return 'border-slate-600';
  }, [order.status, isCritical, isWarning]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative flex flex-col h-[420px] bg-slate-900 rounded-xl border-t-4 shadow-xl overflow-hidden group",
        cardStatusColor
      )}
    >
      {/* Header */}
      <div className={cn(
        "px-4 py-3 flex justify-between items-start border-b transition-colors",
        isCritical ? "bg-rose-950/30 border-rose-900/50" : "bg-slate-800/50 border-slate-700/50"
      )}>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white tracking-tight">#{order.id.slice(-4)}</span>
            {order.priority && (
              <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse">
                VIP
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-slate-400 truncate max-w-[140px]">
            {order.tableNumber || order.customerName}
          </span>
        </div>

        <div className="text-right flex flex-col items-end">
           <div className={cn(
             "font-mono text-xl font-bold leading-none",
             isCritical ? "text-rose-500" : isWarning ? "text-amber-500" : "text-emerald-400"
           )}>
              {elapsedMinutes}m
           </div>
           {order.allergies && (
             <span className="mt-1 flex items-center gap-1 text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase">
               <AlertTriangle size={10} fill="white" />
               {order.allergies.join(', ')}
             </span>
           )}
        </div>
      </div>

      {/* Items Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/50">
        {order.items.map((item, idx) => (
          <TicketItem key={`${order.id}-${idx}`} item={item} isTicketDone={order.status === OrderStatus.READY} />
        ))}
      </div>

      {/* Footer / Bump Bar Area */}
      <div className="p-3 bg-slate-800/80 backdrop-blur border-t border-slate-700/50">
        <div className="grid grid-cols-4 gap-2">
          <button 
            onClick={() => onAction(order.id, 'recall')}
            className="col-span-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg flex items-center justify-center transition-colors h-10 active:scale-95"
            title="Recall"
          >
            <RotateCcw size={18} />
          </button>

          <button 
            onClick={() => onAction(order.id, 'bump')}
            className={cn(
              "col-span-3 rounded-lg flex items-center justify-center gap-2 font-bold text-sm tracking-wide transition-all shadow-lg active:scale-95 active:shadow-none",
              order.status === OrderStatus.READY 
                ? "bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-500/20"
                : "bg-blue-600 hover:bg-blue-500 text-white ring-2 ring-blue-500/20"
            )}
          >
             {order.status === OrderStatus.READY ? (
               <>DELIVER <ArrowRight size={16} strokeWidth={3} /></>
             ) : (
               <>MARK READY <CheckCircle size={16} strokeWidth={3} /></>
             )}
          </button>
        </div>
      </div>
    </motion.div>
  );
});

// --- MAIN LAYOUT COMPONENT ---

export const KitchenView: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTicketAction = useCallback((id: string, action: 'bump' | 'recall' | 'cancel') => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    if (action === 'bump') {
      if (order.status === OrderStatus.PENDING) updateOrderStatus(id, OrderStatus.COOKING);
      else if (order.status === OrderStatus.COOKING) updateOrderStatus(id, OrderStatus.READY);
      else if (order.status === OrderStatus.READY) updateOrderStatus(id, OrderStatus.COMPLETED);
    } else if (action === 'recall') {
      const prevStatus = order.status === OrderStatus.READY ? OrderStatus.COOKING : OrderStatus.PENDING;
      updateOrderStatus(id, prevStatus);
    }
  }, [orders, updateOrderStatus]);

  const activeOrders = useMemo(() => 
    orders.filter(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED)
          .sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), 
  [orders]);

  // Production Item Helper
  const getCategory = (itemName: string, itemCat: string) => {
    if (itemCat === 'Бургеры' || itemCat === 'Комбо') return 'GRILL';
    if (itemCat === 'Снэки') return 'FRYER';
    if (itemCat === 'Напитки') return 'DRINK';
    return 'COLD';
  };

  const productionAggregate = useMemo(() => {
    const counts: Record<string, { count: number, category: string }> = {};
    activeOrders.forEach(o => {
      if (o.status !== OrderStatus.READY) {
        o.items.forEach(item => {
          if (!counts[item.name]) counts[item.name] = { count: 0, category: getCategory(item.name, item.category) };
          counts[item.name].count += item.quantity;
        });
      }
    });
    return Object.entries(counts)
      .sort(([,a], [,b]) => b.count - a.count)
      .map(([name, data]) => ({ name, ...data }));
  }, [activeOrders]);

  const stats = {
    pending: activeOrders.filter(o => o.status === OrderStatus.PENDING).length,
    cooking: activeOrders.filter(o => o.status === OrderStatus.COOKING).length,
    ready: activeOrders.filter(o => o.status === OrderStatus.READY).length,
  };

  return (
    <div className="flex h-screen w-screen bg-[#0b1120] text-slate-100 font-sans overflow-hidden selection:bg-emerald-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-[#0f172a] border-r border-slate-800 flex flex-col z-20 shadow-2xl">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
            <Utensils className="text-white" size={20} />
          </div>
          <span className="font-black tracking-wider text-lg text-white">CHEF<span className="text-emerald-400">OS</span></span>
        </div>

        <div className="grid grid-cols-3 border-b border-slate-800 divide-x divide-slate-800 bg-slate-900/50">
           <div className="py-4 flex flex-col items-center">
             <span className="text-2xl font-black text-amber-500 leading-none">{stats.pending}</span>
             <span className="text-[9px] uppercase font-bold text-slate-500 mt-1">Pending</span>
           </div>
           <div className="py-4 flex flex-col items-center">
             <span className="text-2xl font-black text-blue-500 leading-none">{stats.cooking}</span>
             <span className="text-[9px] uppercase font-bold text-slate-500 mt-1">Prep</span>
           </div>
           <div className="py-4 flex flex-col items-center relative">
             <span className="text-2xl font-black text-emerald-500 leading-none">{stats.ready}</span>
             <span className="text-[9px] uppercase font-bold text-slate-500 mt-1">Ready</span>
             {stats.ready > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />}
           </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 pb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Flame size={12} className="text-orange-500" />
              Live Production
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
            <AnimatePresence>
              {productionAggregate.map((item) => (
                <ProductionItem key={item.name} name={item.name} count={item.count} category={item.category} />
              ))}
            </AnimatePresence>
            {productionAggregate.length === 0 && (
               <div className="mt-10 text-center opacity-30">
                  <ChefHat size={48} className="mx-auto mb-2" />
                  <span className="text-sm font-medium">All caught up</span>
               </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900 text-[10px] text-slate-500 flex justify-between items-center">
           <div className="flex items-center gap-2">
             {isConnected ? <Wifi size={14} className="text-emerald-500" /> : <WifiOff size={14} className="text-rose-500" />}
             <span>{isConnected ? 'ONLINE' : 'OFFLINE MODE'}</span>
           </div>
           <span>v2.6.0-stable</span>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800/50 bg-[#0b1120]/90 backdrop-blur z-10">
          <div className="flex items-center gap-6">
             <h2 className="text-xl font-bold text-slate-200">Kitchen Station 1</h2>
             <div className="flex gap-1 p-1 bg-slate-800 rounded-lg">
                <button className="px-3 py-1 bg-slate-700 rounded text-xs font-bold text-white shadow-sm">ALL</button>
                <button className="px-3 py-1 hover:bg-slate-700/50 rounded text-xs font-bold text-slate-400 transition-colors">DINE-IN</button>
                <button className="px-3 py-1 hover:bg-slate-700/50 rounded text-xs font-bold text-slate-400 transition-colors">DELIVERY</button>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
               <History size={20} />
            </button>
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
               <BellRing size={20} />
               <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0b1120]"></span>
            </button>
            <div className="text-2xl font-mono font-bold text-emerald-500 bg-emerald-500/10 px-4 py-1 rounded border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-dots-pattern">
          {activeOrders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600">
               <div className="p-8 rounded-full bg-slate-800/50 mb-6">
                 <Zap size={64} className="text-slate-700" />
               </div>
               <h3 className="text-2xl font-bold text-slate-500">System Idle</h3>
               <p className="mt-2">Waiting for incoming orders...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
              <AnimatePresence mode='popLayout'>
                {activeOrders.map(order => (
                  <TicketCard 
                    key={order.id} 
                    order={order} 
                    currentTime={currentTime} 
                    onAction={handleTicketAction}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default KitchenView;