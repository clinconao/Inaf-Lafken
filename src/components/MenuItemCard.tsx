import React from 'react';
import { MenuItem } from '../types';
import { formatCLP } from '../utils/formatters';
import { Plus, Minus, Sparkles, SlidersHorizontal, Check } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  currentQuantity?: number;
  onSelectToCustomize: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
  onDecreaseQuantity?: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  currentQuantity = 0,
  onSelectToCustomize,
  onQuickAdd,
  onDecreaseQuantity,
}) => {
  const isSpecialNew = item.category === 'especiales-nuevos';
  const hasInCart = currentQuantity > 0;

  return (
    <div
      id={`menu-item-${item.id}`}
      className={`group relative flex flex-col justify-between bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg p-4 sm:p-5 ${
        hasInCart
          ? 'border-amber-400 ring-2 ring-amber-400/30 bg-amber-50/15 shadow-sm'
          : isSpecialNew
          ? 'border-amber-300/80 bg-linear-to-b from-amber-50/40 to-white ring-1 ring-amber-400/30'
          : 'border-neutral-200/80 hover:border-neutral-300'
      }`}
    >
      <div>
        {/* Badges row */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {hasInCart && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-md shadow-xs animate-in fade-in">
              <Check className="w-2.5 h-2.5" /> {currentQuantity} en pedido
            </span>
          )}
          {item.badgeText && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-400 text-neutral-950 px-2 py-0.5 rounded-md shadow-xs">
              {item.badgeText}
            </span>
          )}
          {item.isNew && !item.badgeText && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-md shadow-xs">
              <Sparkles className="w-2.5 h-2.5" /> Nuevo
            </span>
          )}
          {item.isPopular && !item.isNew && !item.badgeText && (
            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60 px-2 py-0.5 rounded-md">
              ★ Clásico
            </span>
          )}
          <span className="text-[11px] font-medium text-neutral-600 capitalize">
            {item.category.replace('-', ' ')}
          </span>
        </div>

        {/* Title and Base Price */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 leading-snug group-hover:text-amber-800 transition-colors">
            {item.name}
          </h3>
          <span className="text-base sm:text-lg font-black text-amber-600 shrink-0">
            {formatCLP(item.price)}
          </span>
        </div>

        {/* Description / Ingredients */}
        {item.description && (
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-3 mb-4">
            {item.description}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="pt-3 border-t border-neutral-100 mt-auto flex items-center justify-between gap-2">
        {/* Customize / Extras button */}
        <button
          id={`btn-customize-${item.id}`}
          onClick={() => onSelectToCustomize(item)}
          className="flex-1 flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-bold text-neutral-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl transition-all active:scale-95"
          title="Personalizar con extras y notas"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>+ Extras</span>
        </button>

        {/* If product has quantity > 0, show stepper, else show + Agregar */}
        {hasInCart ? (
          <div 
            id={`stepper-card-${item.id}`}
            className="flex items-center gap-1 bg-neutral-900 text-white rounded-xl p-1 shadow-xs shrink-0"
          >
            <button
              id={`btn-dec-${item.id}`}
              onClick={() => onDecreaseQuantity && onDecreaseQuantity(item)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 transition-all active:scale-90"
              title="Restar una unidad"
              aria-label="Restar 1"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-black px-2 text-amber-300 min-w-5 text-center select-none">
              {currentQuantity}
            </span>
            <button
              id={`btn-inc-${item.id}`}
              onClick={() => onQuickAdd(item)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all active:scale-90"
              title="Sumar una unidad"
              aria-label="Sumar 1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <button
            id={`btn-quick-add-${item.id}`}
            onClick={() => onQuickAdd(item)}
            className="flex items-center justify-center gap-1 px-3.5 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-xs active:scale-95 shrink-0"
            title="Agregar directo al carrito"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        )}
      </div>
    </div>
  );
};
