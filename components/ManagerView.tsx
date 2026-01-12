import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { generateManagerInsights } from '../services/geminiService';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Bot, Zap, Calendar, 
  ArrowUpRight, ArrowDownRight, Clock, Award, ChefHat, 
  FileText, Download, MoreHorizontal, Filter, AlertCircle 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Order, OrderStatus } from '../types';

// --- CONFIGURATION ---
const DAILY_REVENUE_TARGET = 50000; 

// --- TYPES & INTERFACES ---
type TimeRange = 'today' | 'yesterday' | 'week' | 'month';

interface MetricTrend {
  value: number;
  percentage: number;
  isPositive: boolean;
}

// --- SUB-COMPONENTS (Modularized for readability) ---

const KPICard = ({ 
  title, 
  value, 
  prefix = '', 
  suffix = '', 
  icon, 
  bg, 
  trend, 
  chartData 
}: any) => (
    <div className="bg-white p-5 rounded-[24px] shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
        <div className="flex justify-between items-start mb-2 relative z-10">
            <div className={`p-3 rounded-2xl ${bg} text-slate-700`}>
                {React.cloneElement(icon, { strokeWidth: 2.5 })}
            </div>
            {trend && (
                <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {trend.isPositive ? <ArrowUpRight size={14} className="mr-1"/> : <ArrowDownRight size={14} className="mr-1"/>}
                    {Math.abs(trend.percentage)}%
                </span>
            )}
        </div>
        
        <div className="relative z-10">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{prefix}{value}{suffix}</h3>
        </div>

        {/* Mini Sparkline Chart for Context */}
        {chartData && (
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 z-0 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <Line type="monotone" dataKey="value" stroke={trend?.isPositive ? "#10B981" : "#EF4444"} strokeWidth={3} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )}
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-500/20',
        [OrderStatus.COOKING]: 'bg-blue-100 text-blue-700 ring-1 ring-blue-500/20',
        [OrderStatus.READY]: 'bg-green-100 text-green-700 ring-1 ring-green-500/20',
        [OrderStatus.COMPLETED]: 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20',
        [OrderStatus.CANCELLED]: 'bg-red-100 text-red-700 ring-1 ring-red-500/20',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide ${styles[status]}`}>
            {status}
        </span>
    );
};

// --- MAIN COMPONENT ---

export const ManagerView: React.FC = () => {
  const { orders } = useApp();
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('today');

  // --- ANALYTICS ENGINE (Business Logic Layer) ---
  
  // 1. Filter Orders by Time Range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return orders.filter(o => {
        const d = new Date(o.createdAt);
        if (timeRange === 'today') return d >= startOfDay;
        // Add more logic for 'week', 'month' here in a real app
        return true; 
    });
  }, [orders, timeRange]);

  // 2. Calculate KPI & Trends
  const analytics = useMemo(() => {
    const validOrders = filteredOrders.filter(o => o.status !== OrderStatus.CANCELLED);
    
    // Revenue
    const revenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const revenueProgress = Math.min((revenue / DAILY_REVENUE_TARGET) * 100, 100);
    
    // Avg Check
    const avgCheck = validOrders.length ? Math.round(revenue / validOrders.length) : 0;
    
    // Kitchen Speed (Mock logic based on timestamps)
    const avgCookTime = 12; // Minutes (In real app: avg(completedAt - createdAt))

    // Hourly Sales Graph (Data Transformation for Recharts)
    const hourlyMap: Record<string, number> = {};
    // Pre-fill hours to show empty periods
    for(let i=9; i<=22; i++) hourlyMap[`${i}:00`] = 0; 
    
    validOrders.forEach(o => {
        const h = new Date(o.createdAt).getHours();
        if(hourlyMap[`${h}:00`] !== undefined) {
             hourlyMap[`${h}:00`] += o.totalAmount;
        }
    });
    
    const salesChart = Object.keys(hourlyMap)
        .map(k => ({ name: k, value: hourlyMap[k] }))
        .sort((a,b) => parseInt(a.name) - parseInt(b.name));

    // Top Products (Aggregated)
    const prodMap: Record<string, number> = {};
    validOrders.forEach(o => o.items.forEach(i => prodMap[i.name] = (prodMap[i.name] || 0) + i.quantity));
    
    const topProducts = Object.entries(prodMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => b.value - a.value)
        .slice(0, 5);

    return { revenue, revenueProgress, count: validOrders.length, avgCheck, avgCookTime, salesChart, topProducts };
  }, [filteredOrders]);

  // --- HANDLERS ---

  const handleGenerateAI = async () => {
    setLoadingAi(true);
    // Create a dense context string for the LLM
    const context = `
      Restaurant Daily Report:
      - Revenue: ${analytics.revenue} RUB (Goal: ${DAILY_REVENUE_TARGET})
      - Orders: ${analytics.count}
      - Top Item: ${analytics.topProducts[0]?.name || 'N/A'}
      - Avg Ticket: ${analytics.avgCheck} RUB
      - Kitchen Speed: ${analytics.avgCookTime} min
    `;
    
    try {
        const res = await generateManagerInsights(context); 
        setAiAnalysis(res || "AI service unavailable. Please check API connection.");
    } catch(e) { console.error(e) }
    setLoadingAi(false);
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Time', 'Customer', 'Items', 'Total', 'Status'];
    const rows = filteredOrders.map(o => [
        o.id,
        new Date(o.createdAt).toLocaleTimeString(),
        o.customerName,
        o.items.map(i => `${i.quantity}x ${i.name}`).join('; '),
        o.totalAmount,
        o.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 pb-32 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 1. TOP BAR (Date & Actions) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard </h1>
                <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        Live Data
                    </span>
                    <span className="text-slate-400 text-sm font-medium">Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {(['today', 'week', 'month'] as const).map((t) => (
                        <button 
                            key={t}
                            onClick={() => setTimeRange(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${timeRange === t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <button 
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    <Download size={18} />
                    Export
                </button>
            </div>
        </div>

        {/* 2. KPI BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Revenue Card (Hero) */}
            <div className="bg-white p-6 rounded-[24px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                        <DollarSign size={24} strokeWidth={2.5} />
                    </div>
                    {/* Mock Trend Logic */}
                    <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        <ArrowUpRight size={14} className="mr-1"/> +12%
                    </span>
                </div>
                <div className="relative z-10">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">{analytics.revenue.toLocaleString()} ₽</h3>
                    
                    {/* Goal Progress Bar */}
                    <div className="mt-5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                            <span>Goal: {DAILY_REVENUE_TARGET.toLocaleString()}</span>
                            <span>{analytics.revenueProgress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
                                style={{width: `${analytics.revenueProgress}%`}}
                            ></div>
                        </div>
                    </div>
                </div>
                {/* Visual Decoration */}
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
            </div>

            {/* Orders Metric */}
            <KPICard 
                title="Orders" 
                value={analytics.count} 
                icon={<FileText size={24} className="text-blue-600"/>} 
                bg="bg-blue-50"
                trend={{ percentage: 5, isPositive: true }}
                chartData={analytics.salesChart} // Sparkline
            />

            {/* Kitchen Speed */}
            <KPICard 
                title="Avg Cook Time" 
                value={analytics.avgCookTime} 
                suffix=" min"
                icon={<Clock size={24} className="text-orange-600"/>} 
                bg="bg-orange-50"
                trend={{ percentage: 8, isPositive: true }} // Positive because time went down
            />

            {/* Active Staff */}
            <KPICard 
                title="Active Staff" 
                value="4" 
                icon={<ChefHat size={24} className="text-purple-600"/>} 
                bg="bg-purple-50"
            />
        </div>

        {/* 3. AI STRATEGY BLOCK */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 bg-gradient-to-r from-indigo-600 to-violet-700 rounded-[24px] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                {/* Background Art */}
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                    <Bot size={240} />
                </div>
                <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl shadow-inner">
                            <Zap fill="white" size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">AI Business Consultant</h2>
                            <p className="text-indigo-100 text-sm opacity-90 max-w-lg mt-1 leading-relaxed">
                                Get real-time actionable insights, identify bottlenecks, and discover upsell opportunities based on your live data.
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleGenerateAI}
                        disabled={loadingAi}
                        className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 hover:scale-105 transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 min-w-[180px]"
                    >
                        {loadingAi ? <MoreHorizontal className="animate-pulse"/> : <><Bot size={18}/> Analyze Now</>}
                    </button>
                </div>

                {/* AI Output Area */}
                <div className={`mt-8 transition-all duration-500 ${aiAnalysis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                     {aiAnalysis && (
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-inner">
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                            </div>
                        </div>
                     )}
                </div>
            </div>
        </div>

        {/* 4. CHARTS & TABLES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sales Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">Revenue Trend </h3>
                        <p className="text-slate-400 text-xs font-bold uppercase mt-1">Hourly Breakdown</p>
                    </div>
                    <div className="flex gap-2">
                         <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                         <span className="text-xs font-bold text-slate-500">Sales</span>
                    </div>
                </div>
                <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics.salesChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9"/>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94A3B8', fontSize:11, fontWeight: 600}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill:'#94A3B8', fontSize:11, fontWeight: 600}} />
                            <Tooltip 
                                contentStyle={{borderRadius:'16px', border:'none', boxShadow:'0 10px 40px -10px rgba(0,0,0,0.1)', padding:'12px'}}
                                itemStyle={{color:'#1e293b', fontWeight:'bold'}}
                                cursor={{stroke: '#6366F1', strokeWidth: 2}}
                            />
                            <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products (Leaderboard) */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col h-full">
                <h3 className="font-bold text-lg text-slate-900 mb-1">Top Selling Items</h3>
                <p className="text-slate-400 text-xs font-bold uppercase mb-6">By Quantity Sold</p>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar">
                    {analytics.topProducts.map((p, idx) => {
                        // Calculate percentage for bar width
                        const maxVal = analytics.topProducts[0]?.value || 1;
                        const percent = (p.value / maxVal) * 100;
                        
                        return (
                            <div key={idx} className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black
                                            ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}
                                        `}>
                                            {idx + 1}
                                        </div>
                                        <span className="text-sm font-bold text-slate-700">{p.name}</span>
                                    </div>
                                    <span className="font-mono text-sm font-bold text-slate-900">{p.value}</span>
                                </div>
                                {/* Visual Progress Bar */}
                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-yellow-500' : 'bg-slate-300'}`} 
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        )
                    })}
                    {analytics.topProducts.length === 0 && (
                        <div className="text-center text-slate-400 py-10 text-sm">No sales data available</div>
                    )}
                </div>
                
                <button className="w-full mt-auto pt-4 border-t border-slate-50 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center justify-center gap-1">
                    View Full Menu Analysis <ArrowUpRight size={16}/>
                </button>
            </div>
        </div>

        {/* 5. LIVE ORDERS FEED */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg">
                        <AlertCircle size={20} className="text-slate-400"/>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">Live Orders Feed</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase">Real-time Transaction Log</p>
                    </div>
                </div>
                <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-bold transition-colors">
                    View All
                </button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Items Summary</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {orders.slice(0, 5).map(order => (
                            <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4 font-mono text-sm font-bold text-indigo-600">#{order.id.slice(-4)}</td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-500">
                                    {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-800">{order.customerName}</td>
                                <td className="px-6 py-4 text-sm text-slate-500 max-w-[250px] truncate">
                                    {order.items.map(i => i.name).join(', ')}
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={order.status} />
                                </td>
                                <td className="px-6 py-4 text-right font-black text-slate-900">{order.totalAmount} ₽</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>

      </div>
    </div>
  );
};