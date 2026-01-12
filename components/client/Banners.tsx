import React, { useState, useEffect, memo } from 'react';
import { ChevronRight, Clock, Zap, ArrowRight, Flame, Sparkles } from 'lucide-react';

// --- TYPES (Domain Layer) ---

export interface Story {
  id: string;
  title: string;
  image: string;
  isViewed: boolean; // Tracks if user clicked
  hasUpdate: boolean; // Determines the ring color
}

export interface Banner {
  id: string;
  tag?: string;
  tagIcon?: 'fire' | 'clock' | 'star';
  title: string;
  subtitle: string;
  ctaText: string;
  image: string;
  variant: 'dark' | 'orange' | 'light';
  timerSeconds?: number;
}

interface BannersProps {
  onStoryClick?: (id: string) => void;
  onBannerClick?: (id: string) => void;
  isLoading?: boolean;
}

// --- MOCK DATA (In a real app, fetch this via React Query/SWR) ---

const MOCK_STORIES: Story[] = [
  { id: 's1', title: 'Новинки', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80', isViewed: false, hasUpdate: true },
  { id: 's2', title: 'Акции', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=150&q=80', isViewed: false, hasUpdate: true },
  { id: 's3', title: 'Комбо', image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=150&q=80', isViewed: true, hasUpdate: false },
  { id: 's4', title: 'Острое', image: 'https://images.unsplash.com/photo-1619250907727-2eae8b9826d7?auto=format&fit=crop&w=150&q=80', isViewed: false, hasUpdate: false },
  { id: 's5', title: 'Десерты', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=150&q=80', isViewed: false, hasUpdate: true },
  { id: 's6', title: 'Напитки', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=150&q=80', isViewed: true, hasUpdate: false },
];

const MOCK_BANNERS: Banner[] = [
  { 
    id: 'b1', 
    tag: 'LIMITED', 
    tagIcon: 'clock',
    title: 'Дарим Колу Zero', 
    subtitle: 'При заказе от 1500₽', 
    ctaText: 'Забрать подарок',
    variant: 'dark',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80',
    timerSeconds: 7200 // 2 hours
  },
  { 
    id: 'b2', 
    tag: 'PROMO -20%', 
    tagIcon: 'fire',
    title: 'Мега Чизбургер', 
    subtitle: 'Только сегодня скидка', 
    ctaText: 'Хочу скидку',
    variant: 'orange',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
  },
  { 
    id: 'b3', 
    tag: 'NEW', 
    tagIcon: 'star',
    title: 'Крылья BBQ', 
    subtitle: 'Попробуй новинку', 
    ctaText: 'В меню',
    variant: 'light',
    image: 'https://images.unsplash.com/photo-1527477396000-64ca9c00173e?auto=format&fit=crop&w=500&q=80',
  },
];

// --- SUB-COMPONENTS ---

// 1. Countdown Timer (Optimized for performance)
const CountdownTimer = memo(({ seconds }: { seconds: number }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const format = (val: number) => val.toString().padStart(2, '0');
  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;

  return (
    <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-white mt-3 w-fit animate-in fade-in">
      <Clock size={12} className="text-orange-400" />
      <span>{format(h)}:{format(m)}:{format(s)}</span>
    </div>
  );
});

// 2. Story Item (Instagram Style)
const StoryItem = memo(({ story, onClick }: { story: Story, onClick: (id: string) => void }) => {
  // Visual logic: 
  // - Has Update + Not Viewed = Orange Gradient Ring
  // - No Update or Viewed = Gray Ring
  const ringColor = story.hasUpdate && !story.isViewed 
    ? 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-600' 
    : 'bg-slate-200';

  return (
    <button 
      onClick={() => onClick(story.id)}
      className="flex flex-col items-center gap-2 cursor-pointer group min-w-[72px] outline-none"
    >
      <div className={`w-[72px] h-[72px] rounded-full p-[3px] transition-all duration-300 ${ringColor} group-hover:scale-105`}>
        <div className="w-full h-full rounded-full border-[3px] border-white overflow-hidden relative shadow-sm">
           <img 
             src={story.image} 
             alt={story.title} 
             loading="lazy"
             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
           />
           {/* Touch feedback overlay */}
           <div className="absolute inset-0 bg-black/0 group-active:bg-black/10 transition-colors" />
        </div>
      </div>
      <span className={`text-[11px] font-bold text-center leading-tight transition-colors line-clamp-1 max-w-full ${story.isViewed ? 'text-slate-400 font-medium' : 'text-slate-700'}`}>
        {story.title}
      </span>
    </button>
  );
});

// 3. Banner Item (Hero Card)
const BannerItem = memo(({ banner, onClick }: { banner: Banner, onClick: (id: string) => void }) => {
  
  // Theme variants configuration
  const themes = {
    dark: {
      bg: 'bg-gradient-to-br from-slate-900 to-slate-800',
      text: 'text-white',
      badge: 'bg-white/10 text-white backdrop-blur-sm',
      btn: 'bg-white text-slate-900 hover:bg-slate-100'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-500 to-red-600',
      text: 'text-white',
      badge: 'bg-black/20 text-white backdrop-blur-sm',
      btn: 'bg-white text-orange-600 hover:bg-orange-50'
    },
    light: {
      bg: 'bg-white border border-slate-200',
      text: 'text-slate-900',
      badge: 'bg-slate-100 text-slate-700',
      btn: 'bg-slate-900 text-white hover:bg-slate-800'
    }
  };

  const theme = themes[banner.variant];
  
  const TagIcon = () => {
    switch(banner.tagIcon) {
      case 'fire': return <Flame size={12} className="mr-1 fill-current" />;
      case 'clock': return <Zap size={12} className="mr-1 fill-current" />;
      case 'star': return <Sparkles size={12} className="mr-1 fill-current" />;
      default: return null;
    }
  };

  return (
    <div 
      onClick={() => onClick(banner.id)}
      className={`snap-center shrink-0 w-[310px] h-[170px] rounded-[28px] p-6 relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group ${theme.bg}`}
    >
      {/* Content Side */}
      <div className="relative z-10 flex flex-col h-full justify-between items-start max-w-[65%]">
        <div>
          {banner.tag && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider mb-2 ${theme.badge}`}>
              <TagIcon />
              {banner.tag}
            </span>
          )}
          <h3 className={`font-extrabold text-xl leading-[1.1] mb-1.5 ${theme.text}`}>
            {banner.title}
          </h3>
          <p className={`text-xs font-medium leading-tight opacity-80 line-clamp-2 ${theme.text}`}>
            {banner.subtitle}
          </p>
          
          {banner.timerSeconds && <CountdownTimer seconds={banner.timerSeconds} />}
        </div>

        {/* CTA Button */}
        <div className={`mt-2 flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all active:scale-95 ${theme.btn}`}>
           {banner.ctaText} <ArrowRight size={14} />
        </div>
      </div>

      {/* Image Side (Food Plate Effect) */}
      <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-44 h-44 transition-transform duration-700 ease-out group-hover:scale-105 group-hover:-rotate-3 group-hover:-translate-x-2">
         <img 
            src={banner.image} 
            alt={banner.title} 
            loading="lazy"
            className="w-full h-full object-cover rounded-full shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border-4 border-white/10"
            // shape-outside hack for older browsers not needed here due to absolute positioning
         />
      </div>
      
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-[50px] pointer-events-none" />
    </div>
  );
});

// 4. Skeleton Loader (Crucial for UX)
const MarketingSkeleton = () => (
  <div className="space-y-6">
    {/* Stories Skeleton */}
    <div className="flex gap-4 overflow-hidden pl-4 pt-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 min-w-[72px]">
          <div className="w-[72px] h-[72px] rounded-full bg-slate-200 animate-pulse" />
          <div className="w-12 h-2.5 rounded bg-slate-200 animate-pulse" />
        </div>
      ))}
    </div>
    {/* Banners Skeleton */}
    <div className="flex gap-4 overflow-hidden pl-4 pb-4">
      <div className="w-[310px] h-[170px] rounded-[28px] bg-slate-200 animate-pulse shrink-0" />
      <div className="w-[310px] h-[170px] rounded-[28px] bg-slate-200 animate-pulse shrink-0" />
    </div>
  </div>
);

// --- MAIN EXPORT ---

export const Banners: React.FC<BannersProps> = ({ 
  onStoryClick = () => {}, 
  onBannerClick = () => {},
  isLoading = false 
}) => {
  
  // In a real app, you would manage 'isViewed' state via Context or LocalStorage here
  const [stories, setStories] = useState(MOCK_STORIES);

  const handleStoryInteraction = (id: string) => {
    // Optimistic UI update: Mark as viewed immediately
    setStories(prev => prev.map(s => s.id === id ? { ...s, isViewed: true } : s));
    onStoryClick(id);
  };

  if (isLoading) return <MarketingSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. STORIES SECTION */}
      {/* Using standard scroll behavior, often preferred for stories */}
      <section className="overflow-x-auto no-scrollbar pt-2 pl-4 pr-4">
        <div className="flex gap-3 w-max">
          {stories.map(story => (
            <StoryItem 
              key={story.id} 
              story={story} 
              onClick={handleStoryInteraction} 
            />
          ))}
        </div>
      </section>

      {/* 2. BANNERS SECTION */}
      {/* Using Snap Scrolling for premium feel */}
      <section className="overflow-x-auto no-scrollbar pl-4 pr-4 pb-4 snap-x snap-mandatory scroll-smooth">
        <div className="flex gap-4 w-max">
          {MOCK_BANNERS.map(banner => (
            <BannerItem 
              key={banner.id} 
              banner={banner} 
              onClick={onBannerClick} 
            />
          ))}
          {/* Spacer for right padding in scroll view */}
          <div className="w-1 shrink-0" />
        </div>
      </section>
    </div>
  );
};