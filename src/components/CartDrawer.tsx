import React from 'react';
import { CartItem, SelectedExtra } from '../types';
import { EXTRA_INGREDIENTS } from '../data/menuData';
import { formatCLP } from '../utils/formatters';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  SlidersHorizontal,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onEditItemExtras: (cartItem: CartItem) => void;
  onProceedToCheckout: () => void;
  onAddExtraToLastItem: (extra: { id: string; name: string; price: number }) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onEditItemExtras,
  onProceedToCheckout,
  onAddExtraToLastItem,
}) => {
  if (!isOpen) return null;

  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalBase = cartItems.reduce(
    (acc, item) => acc + item.basePrice * item.quantity,
    0
  );
  const subtotalExtras = cartItems.reduce((acc, item) => {
    const extrasCost = item.extras.reduce((eAcc, e) => eAcc + e.price * e.quantity, 0);
    return acc + extrasCost * item.quantity;
  }, 0);
  const grandTotal = subtotalBase + subtotalExtras;

  const lastCartItem = cartItems.length > 0 ? cartItems[cartItems.length - 1] : null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
          onClick={(e) => e.stopPropagation()}
          aria-labelledby="cart-title"
          role="region"
        >
          {/* Top Bar */}
          <div className="bg-neutral-900 text-amber-300 px-5 py-4 flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-neutral-800 rounded-xl text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 id="cart-title" className="text-lg font-black text-white leading-tight">
                  Tu Carrito
                </h2>
                <p className="text-xs text-amber-200/80 font-medium">
                  {totalItemCount === 0
                    ? 'No hay productos'
                    : `${totalItemCount} ${totalItemCount === 1 ? 'producto' : 'productos'}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs text-neutral-400 hover:text-red-400 font-semibold transition-colors px-2 py-1"
                  title="Vaciar carrito"
                >
                  Vaciar
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-neutral-100">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-extrabold text-neutral-800 mb-1">
                  Tu carrito está vacío
                </h3>
                <p className="text-xs text-neutral-600 max-w-xs mb-6">
                  Revisa nuestra carta de completos, churrascos, papas fritas y agrega tus favoritos.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  Explorar la Carta
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* List of Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/80 hover:border-amber-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex-1">
                          <h4 className="text-sm font-extrabold text-neutral-900 leading-tight">
                            {item.name}
                          </h4>
                          <span className="text-xs text-neutral-600">
                            Base: {formatCLP(item.basePrice)} c/u
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-black text-amber-800 block">
                            {formatCLP(item.totalPrice)}
                          </span>
                        </div>
                      </div>

                      {/* Display selected extras */}
                      {item.extras.length > 0 && (
                        <div className="my-2 bg-white rounded-lg p-2 border border-amber-200/60 text-xs">
                          <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wide block mb-1">
                            Extras seleccionados:
                          </span>
                          <div className="space-y-1">
                            {item.extras.map((extra) => (
                              <div
                                key={extra.id}
                                className="flex items-center justify-between text-neutral-700"
                              >
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  {extra.name} {extra.quantity > 1 ? `(x${extra.quantity})` : ''}
                                </span>
                                <span className="font-semibold text-neutral-900">
                                  +{formatCLP(extra.price * extra.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {item.notes && (
                        <p className="text-[11px] text-neutral-600 italic mb-2">
                          Nota: "{item.notes}"
                        </p>
                      )}

                      {/* Actions: quantity stepper & edit extras */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 mt-2">
                        <button
                          onClick={() => onEditItemExtras(item)}
                          className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-100/70 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          <span>Modificar extras</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-white border border-neutral-300 rounded-lg p-0.5">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 rounded-md"
                              aria-label="Reducir cantidad"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black px-2 text-neutral-900 min-w-5 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 rounded-md"
                              aria-label="Aumentar cantidad"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Eliminar producto"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pre-Confirmation Extras Helper */}
                {lastCartItem && (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 mt-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <h4 className="text-xs font-extrabold text-neutral-900">
                        ¿Deseas añadir extras a tu {lastCartItem.name}?
                      </h4>
                    </div>
                    <p className="text-[11px] text-neutral-600 mb-2.5">
                      Suma sabor con costos calculados automáticamente al total:
                    </p>

                    <div className="grid grid-cols-2 gap-1.5">
                      {EXTRA_INGREDIENTS.map((extra) => {
                        const alreadyHas = lastCartItem.extras.some((e) => e.id === extra.id);
                        return (
                          <button
                            key={extra.id}
                            onClick={() => onAddExtraToLastItem(extra)}
                            className={`flex items-center justify-between text-left p-2 rounded-xl text-xs font-semibold border transition-all ${
                              alreadyHas
                                ? 'bg-amber-200/70 border-amber-400 text-neutral-900'
                                : 'bg-white border-neutral-200 hover:border-amber-300 text-neutral-800'
                            }`}
                          >
                            <div className="truncate pr-1">
                              <span className="block truncate">{extra.name}</span>
                              <span className="text-[10px] text-amber-800 font-bold block">
                                +{formatCLP(extra.price)}
                              </span>
                            </div>
                            <span className="shrink-0 text-amber-700">
                              {alreadyHas ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                              ) : (
                                <Plus className="w-3.5 h-3.5" />
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer & Checkout summary */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 bg-neutral-50 border-t border-neutral-200 space-y-3">
              {/* Financial Breakdown */}
              <div className="space-y-1 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal Carta:</span>
                  <span className="font-semibold text-neutral-900">{formatCLP(subtotalBase)}</span>
                </div>
                {subtotalExtras > 0 && (
                  <div className="flex justify-between text-amber-800 font-semibold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" /> Total Ingredientes Extra:
                    </span>
                    <span>+{formatCLP(subtotalExtras)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Total a Pagar:</span>
                  <span className="text-amber-600">{formatCLP(grandTotal)}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                id="btn-proceed-checkout"
                onClick={onProceedToCheckout}
                className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-700/20 transition-all active:scale-98"
              >
                <span>Confirmar y Enviar por WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
