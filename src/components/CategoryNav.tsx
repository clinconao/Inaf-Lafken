import React from 'react';
import { CategoryId } from '../types';
import { CATEGORIES } from '../data/menuData';
import { Logo } from './Logo';
import { formatCLP } from '../utils/formatters';
import { 
  Sparkles, 
  UtensilsCrossed, 
  Flame, 
  Sandwich, 
  PieChart, 
  Zap, 
  Star,
  Layers,
  ShoppingBag,
  Coffee,
  Wheat,
  CupSoda
} from 'lucide-react';

interface CategoryNavProps {
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (category: CategoryId | 'all') => void;
  itemCountsByCategory: Record<string, number>;
  cartItemCount?: number;
  cartTotal?: number;
  onOpenCart?: () => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  itemCountsByCategory,
  cartItemCount = 0,
  cartTotal = 0,
  onOpenCart,
}) => {
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'antojos':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'completos':
        return <Sandwich className="w-3.5 h-3.5" />;
      case 'as':
        return <Flame className="w-3.5 h-3.5" />;
      case 'churrascos':
        return <UtensilsCrossed className="w-3.5 h-3.5" />;
      case 'empanadas':
        return <PieChart className="w-3.5 h-3.5" />;
      case 'papas-fritas':
        return <Zap className="w-3.5 h-3.5" />;
      case 'especiales-nuevos':
        return <Star className="w-3.5 h-3.5 fill-amber-300" />;
      case 'liquidos':
        return <CupSoda className="w-3.5 h-3.5" />;
      case 'bebidas-calientes':
        return <Coffee className="w-3.5 h-3.5" />;
      case 'caseros-surenos':
        return <Wheat className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 shadow-sm transition-all">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
        {/* Compact brand logo in sticky bar */}
        <div className="flex items-center gap-2 shrink-0">
          <Logo className="w-8 h-8" />
          <span className="text-xs font-black text-neutral-900 hidden md:inline-block uppercase tracking-tight font-serif">
            Inaf Lafken
          </span>
        </div>

        {/* Scrollable category pills */}
        <div className="flex-1 overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 py-0.5">
          <div className="flex items-center gap-1.5 min-w-max">
            {/* Option All */}
            <button
              id="cat-btn-all"
              onClick={() => onSelectCategory('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Toda la Carta</span>
              <span
                className={`text-[10px] ml-0.5 px-1.5 py-0.2 rounded-full font-extrabold ${
                  selectedCategory === 'all'
                    ? 'bg-neutral-700 text-amber-300'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {(Object.values(itemCountsByCategory) as number[]).reduce(
                  (a: number, b: number) => a + b,
                  0
                )}
              </span>
            </button>

            {/* Individual categories from the menu card */}
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const isNewCategory = cat.id === 'especiales-nuevos';
              const isSurenos = cat.id === 'caseros-surenos';
              const count = itemCountsByCategory[cat.id] || 0;

              return (
                <button
                  id={`cat-btn-${cat.id}`}
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all relative ${
                    isSelected
                      ? isNewCategory
                        ? 'bg-red-600 text-white shadow-xs ring-2 ring-red-400'
                        : isSurenos
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'bg-amber-400 text-neutral-950 shadow-xs'
                      : isNewCategory
                      ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900'
                  }`}
                >
                  <span className={isSelected ? 'text-inherit' : 'text-neutral-500'}>
                    {getCategoryIcon(cat.id)}
                  </span>
                  <span>{cat.name}</span>
                  {isNewCategory && (
                    <span className="text-[9px] uppercase tracking-wider font-extrabold bg-amber-400 text-neutral-950 px-1 py-0.2 rounded-xs ml-0.5">
                      Nuevos
                    </span>
                  )}
                  <span
                    className={`text-[10px] ml-0.5 px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? isNewCategory
                          ? 'bg-red-800 text-white'
                          : isSurenos
                          ? 'bg-amber-900 text-white'
                          : 'bg-amber-600/40 text-neutral-950'
                        : 'bg-neutral-200/80 text-neutral-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sticky Cart Button on the right */}
        {onOpenCart && (
          <button
            id="sticky-cart-btn"
            onClick={onOpenCart}
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-300 px-3 py-1.5 rounded-full text-xs font-black shadow-xs transition-all active:scale-95 shrink-0"
            title="Ver carrito de compras"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline-block">{formatCLP(cartTotal)}</span>
          </button>
        )}
      </div>
    </nav>
  );
};
