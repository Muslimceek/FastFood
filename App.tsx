import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ClientView } from './components/ClientView';
import { KitchenView } from './components/KitchenView';
import { ManagerView } from './components/ManagerView';
import { Role } from './types';
import { Smartphone, ChefHat, BarChart3 } from 'lucide-react';

const RoleSwitcher = () => {
  const { role, setRole } = useApp();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white p-1.5 rounded-full flex gap-1 shadow-2xl z-[100] scale-90 md:scale-100 border border-gray-700">
      <button 
        onClick={() => setRole(Role.CLIENT)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${role === Role.CLIENT ? 'bg-brand-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-400'}`}
      >
        <Smartphone size={18} />
        <span className="hidden sm:inline">Клиент</span>
      </button>
      <button 
        onClick={() => setRole(Role.CHEF)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${role === Role.CHEF ? 'bg-blue-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-400'}`}
      >
        <ChefHat size={18} />
        <span className="hidden sm:inline">Кухня</span>
      </button>
      <button 
        onClick={() => setRole(Role.MANAGER)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${role === Role.MANAGER ? 'bg-purple-600 text-white font-bold' : 'hover:bg-gray-800 text-gray-400'}`}
      >
        <BarChart3 size={18} />
        <span className="hidden sm:inline">Менеджер</span>
      </button>
    </div>
  );
};

const MainContent = () => {
  const { role } = useApp();
  
  switch(role) {
    case Role.CLIENT: return <ClientView />;
    case Role.CHEF: return <KitchenView />;
    case Role.MANAGER: return <ManagerView />;
    default: return <ClientView />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
      <RoleSwitcher />
    </AppProvider>
  );
}