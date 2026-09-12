import React, { useState, useEffect } from 'react';
import { MenuItem, SelectedExtra } from '../types';
import { EXTRA_INGREDIENTS } from '../data/menuData';
import { formatCLP } from '../utils/formatters';
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react';

interface CustomizeModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    item: MenuItem,
    quantity: number,
    extras: SelectedExtra[],
    notes: string
  ) => void;
  initialExtras?: SelectedExtra[];
  initialNotes?: string;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
  initialExtras = [],
  initialNotes = '',
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen && item) {
      setQuantity(1);
      const extrasMap: Record<string, number> = {};
      initialExtras.forEach((e) => {
        extrasMap[e.id] = e.quantity;
      });
      setSelectedExtras(extrasMap);
      setNotes(initialNotes);
    }
  }, [isOpen, item, initialExtras, initialNotes]);

  if (!isOpen || !item) return null;

  // Calculate extras cost per unit
  const extrasUnitPrice = EXTRA_INGREDIENTS.reduce((acc, ingredient) => {
    const qty = selectedExtras[ingredient.id] || 0;
    return acc + ingredient.price * qty;
  }, 0);

  const unitPrice = item.price + extrasUnitPrice;
  const totalPrice = unitPrice * quantity;

  const handleToggleExtra = (id: string) => {
    setSelectedExtras((prev) => {
      const current = prev[id] || 0;
      if (current > 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: 1 };
    });
  };

  const handleIncreaseExtra = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedExtras((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleDecreaseExtra = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedExtras((prev) => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  const handleConfirm = () => {
    const extrasList: SelectedExtra[] = [];
    (Object.entries(selectedExtras) as [string, number][]).forEach(([id, qty]) => {
      if (qty > 0) {
        const ing = EXTRA_INGREDIENTS.find((i) => i.id === id);
        if (ing) {
          extrasList.push({
            id: ing.id,
            name: ing.name,
            price: ing.price,
            quantity: qty,
          });
        }
      }
    });

    onAddToCart(item, quantity, extrasList, notes.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="customize-title"
      >
        {/* Header */}
        <div className="bg-amber-400 px-5 py-4 flex items-start justify-between gap-3 border-b border-amber-500/40">
          <div>
            <span className="text-[11px] uppercase font-bold text-neutral-800 tracking-wider">
              Personalizar Pedido
            </span>
            <h2 id="customize-title" className="text-xl font-black text-neutral-900 leading-tight">
              {item.name}
            </h2>
            <p className="text-xs font-semibold text-neutral-800 mt-0.5">
              Precio base: <span className="font-bold text-neutral-900">{formatCLP(item.price)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-900/10 hover:bg-neutral-900/20 text-neutral-900 transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 divide-y divide-neutral-100">
          {/* Item description */}
          {item.description && (
            <p className="text-xs sm:text-sm text-neutral-600 italic">
              "{item.description}"
            </p>
          )}

          {/* Extra ingredients section */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-extrabold text-neutral-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Ingredientes Extras</span>
              </label>
              <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
                Cálculo automático
              </span>
            </div>
            <p className="text-xs text-neutral-600 mb-3">
              Selecciona los extras que deseas incorporar a tu {item.name}:
            </p>

            <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
              {EXTRA_INGREDIENTS.map((extra) => {
                const isSelected = (selectedExtras[extra.id] || 0) > 0;
                const qty = selectedExtras[extra.id] || 0;

                return (
                  <div
                    key={extra.id}
                    onClick={() => handleToggleExtra(extra.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-400'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-amber-500 border-amber-600 text-neutral-950'
                            : 'border-neutral-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-neutral-900">
                            {extra.name}
                          </span>
                          {extra.badge && (
                            <span className="text-[9px] font-extrabold uppercase tracking-wide bg-amber-200 text-neutral-800 px-1.5 py-0.2 rounded-sm">
                              {extra.badge}
                            </span>
                          )}
                        </div>
                        {extra.description && (
                          <span className="text-[11px] text-neutral-600 block">
                            {extra.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-amber-700">
                        +{formatCLP(extra.price)}
                      </span>

                      {/* Portion quantity controls when selected */}
                      {isSelected && (
                        <div
                          className="flex items-center gap-1 bg-white border border-amber-300 rounded-lg p-0.5 shadow-2xs ml-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => handleDecreaseExtra(extra.id, e)}
                            className="w-5 h-5 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 rounded-sm"
                            aria-label="Disminuir porción"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-extrabold px-1 text-neutral-900">
                            {qty}
                          </span>
                          <button
                            onClick={(e) => handleIncreaseExtra(extra.id, e)}
                            className="w-5 h-5 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 rounded-sm"
                            aria-label="Aumentar porción"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes or instructions */}
          <div className="pt-4">
            <label htmlFor="custom-notes" className="block text-xs font-bold text-neutral-700 mb-1.5">
              Observaciones o especificaciones (opcional)
            </label>
            <input
              id="custom-notes"
              type="text"
              placeholder="Ej: Sin mayo, salsa americana aparte, bien tostado..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-hidden"
              maxLength={120}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-neutral-50 px-5 py-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Quantity selector */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <span className="text-xs font-bold text-neutral-600 sm:hidden">
              Cantidad:
            </span>
            <div className="flex items-center gap-2 bg-white border border-neutral-300 rounded-xl px-2 py-1 shadow-2xs">
              <button
                id="modal-qty-minus"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
                aria-label="Menos cantidad"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-black w-6 text-center text-neutral-900">
                {quantity}
              </span>
              <button
                id="modal-qty-plus"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100"
                aria-label="Más cantidad"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Add button with calculated total */}
          <button
            id="btn-confirm-add-cart"
            onClick={handleConfirm}
            className="w-full sm:w-auto flex-1 flex items-center justify-between sm:justify-center gap-3 bg-neutral-950 hover:bg-neutral-800 text-white font-extrabold px-5 py-3 rounded-xl shadow-md transition-all active:scale-98"
          >
            <span>Agregar al Carrito</span>
            <span className="bg-amber-400 text-neutral-950 text-xs px-2.5 py-1 rounded-lg font-black">
              {formatCLP(totalPrice)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
