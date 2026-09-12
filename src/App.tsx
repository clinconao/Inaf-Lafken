import React, { useState, useEffect, useMemo } from 'react';
import { CategoryId, MenuItem, CartItem, SelectedExtra, CustomerOrderInfo } from './types';
import { CATEGORIES, MENU_ITEMS, EXTRA_INGREDIENTS, RESTAURANT_INFO } from './data/menuData';
import { formatCLP } from './utils/formatters';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { MenuItemCard } from './components/MenuItemCard';
import { CustomizeModal } from './components/CustomizeModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { 
  Sparkles, 
  UtensilsCrossed, 
  Flame, 
  Info, 
  ShoppingBag, 
  ArrowRight,
  Star,
  ExternalLink,
  Clock,
  MapPin,
  AlertCircle
} from 'lucide-react';

const CART_STORAGE_KEY = 'inaf_lafken_cart_v2';
const CUSTOMER_STORAGE_KEY = 'inaf_lafken_customer_v2';

export function App() {
  // Navigation & Filter State
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State (Persisted in localStorage)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Customer info State (Persisted)
  const [customerInfo, setCustomerInfo] = useState<CustomerOrderInfo>(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {
        name: '',
        phone: '',
        deliveryType: 'retiro',
        address: '',
        reference: '',
        paymentMethod: 'efectivo',
        notes: '',
      };
    } catch {
      return {
        name: '',
        phone: '',
        deliveryType: 'retiro',
        address: '',
        reference: '',
        paymentMethod: 'efectivo',
        notes: '',
      };
    }
  });

  // Modals & Drawers
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [itemToCustomize, setItemToCustomize] = useState<MenuItem | null>(null);
  const [customizingCartItemId, setCustomizingCartItemId] = useState<string | null>(null);
  const [customizingInitialExtras, setCustomizingInitialExtras] = useState<SelectedExtra[]>([]);
  const [customizingInitialNotes, setCustomizingInitialNotes] = useState<string>('');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastOrderMessage, setLastOrderMessage] = useState('');
  const [lastOrderId, setLastOrderId] = useState('');

  // Save Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  // Save Customer info to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customerInfo));
    } catch (e) {
      console.warn('Failed to save customer info', e);
    }
  }, [customerInfo]);

  // Total calculation
  const totalItemCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const grandTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [cartItems]);

  // Category items count
  const itemCountsByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      counts[cat.id] = MENU_ITEMS.filter((i) => i.category === cat.id).length;
    });
    return counts;
  }, []);

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Total quantity for a menu item across cart
  const getItemQuantity = (menuItemId: string): number => {
    return cartItems
      .filter((i) => i.menuItemId === menuItemId)
      .reduce((acc, i) => acc + i.quantity, 0);
  };

  // Open modal to customize a menu item
  const handleOpenCustomize = (item: MenuItem) => {
    setItemToCustomize(item);
    setCustomizingCartItemId(null);
    setCustomizingInitialExtras([]);
    setCustomizingInitialNotes('');
    setIsCustomizeModalOpen(true);
  };

  // Open modal to edit existing cart item extras
  const handleEditCartItemExtras = (cartItem: CartItem) => {
    const originalMenuItem = MENU_ITEMS.find((m) => m.id === cartItem.menuItemId);
    if (!originalMenuItem) return;

    setItemToCustomize(originalMenuItem);
    setCustomizingCartItemId(cartItem.id);
    setCustomizingInitialExtras(cartItem.extras);
    setCustomizingInitialNotes(cartItem.notes || '');
    setIsCustomizeModalOpen(true);
  };

  // Quick add item with no initial extras (or increment existing)
  const handleQuickAdd = (item: MenuItem) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.menuItemId === item.id && i.extras.length === 0 && !i.notes
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        const current = updated[existingIdx];
        const newQty = current.quantity + 1;
        updated[existingIdx] = {
          ...current,
          quantity: newQty,
          totalPrice: current.unitPriceWithExtras * newQty,
        };
        return updated;
      }

      // If existing item has extras or does not exist yet, add standard unit
      const newItem: CartItem = {
        id: `${item.id}-${Date.now()}`,
        menuItemId: item.id,
        name: item.name,
        basePrice: item.price,
        quantity: 1,
        extras: [],
        notes: '',
        unitPriceWithExtras: item.price,
        totalPrice: item.price,
      };
      return [...prev, newItem];
    });
  };

  // Quick decrease quantity by 1 for a menu item
  const handleDecreaseQuantity = (item: MenuItem) => {
    setCartItems((prev) => {
      // Look first for an item without extras
      let targetIdx = prev.findIndex(
        (i) => i.menuItemId === item.id && i.extras.length === 0 && !i.notes
      );
      // If not found, pick the last occurrence of this item
      if (targetIdx < 0) {
        for (let i = prev.length - 1; i >= 0; i--) {
          if (prev[i].menuItemId === item.id) {
            targetIdx = i;
            break;
          }
        }
      }

      if (targetIdx < 0) return prev;

      const current = prev[targetIdx];
      if (current.quantity > 1) {
        const updated = [...prev];
        const newQty = current.quantity - 1;
        updated[targetIdx] = {
          ...current,
          quantity: newQty,
          totalPrice: current.unitPriceWithExtras * newQty,
        };
        return updated;
      } else {
        // Remove item completely
        return prev.filter((_, idx) => idx !== targetIdx);
      }
    });
  };

  // Add customized item or save edited item in cart
  const handleAddCustomizedToCart = (
    item: MenuItem,
    quantity: number,
    extras: SelectedExtra[],
    notes: string
  ) => {
    const extrasUnitCost = extras.reduce((acc, e) => acc + e.price * e.quantity, 0);
    const unitPriceWithExtras = item.price + extrasUnitCost;
    const totalPrice = unitPriceWithExtras * quantity;

    if (customizingCartItemId) {
      // Editing existing cart item
      setCartItems((prev) =>
        prev.map((ci) => {
          if (ci.id === customizingCartItemId) {
            return {
              ...ci,
              quantity,
              extras,
              notes,
              unitPriceWithExtras,
              totalPrice,
            };
          }
          return ci;
        })
      );
    } else {
      // Adding new cart item
      const newCartItem: CartItem = {
        id: `${item.id}-${Date.now()}`,
        menuItemId: item.id,
        name: item.name,
        basePrice: item.price,
        quantity,
        extras,
        notes,
        unitPriceWithExtras,
        totalPrice,
      };

      setCartItems((prev) => [...prev, newCartItem]);
    }
  };

  // Update item quantity
  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: item.unitPriceWithExtras * newQuantity,
          };
        }
        return item;
      })
    );
  };

  // Remove single item
  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  // Clear entire cart
  const handleClearCart = () => {
    setCartItems([]);
  };

  // Quick add extra to last item in cart
  const handleAddExtraToLastItem = (extra: { id: string; name: string; price: number }) => {
    if (cartItems.length === 0) return;
    const lastItem = cartItems[cartItems.length - 1];
    handleAddExtraToItem(lastItem.id, extra.id);
  };

  // Add extra directly to specified cart item
  const handleAddExtraToItem = (cartItemId: string, extraId: string) => {
    const extraDef = EXTRA_INGREDIENTS.find((e) => e.id === extraId);
    if (!extraDef) return;

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== cartItemId) return item;

        const existingExtraIdx = item.extras.findIndex((e) => e.id === extraId);
        let updatedExtras: SelectedExtra[];

        if (existingExtraIdx >= 0) {
          updatedExtras = item.extras.filter((e) => e.id !== extraId);
        } else {
          updatedExtras = [
            ...item.extras,
            {
              id: extraDef.id,
              name: extraDef.name,
              price: extraDef.price,
              quantity: 1,
            },
          ];
        }

        const extrasUnitCost = updatedExtras.reduce((acc, e) => acc + e.price * e.quantity, 0);
        const unitPriceWithExtras = item.basePrice + extrasUnitCost;
        const totalPrice = unitPriceWithExtras * item.quantity;

        return {
          ...item,
          extras: updatedExtras,
          unitPriceWithExtras,
          totalPrice,
        };
      })
    );
  };

  // Switch to checkout modal
  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Order successfully placed / shared
  const handleOrderSuccess = (message: string, orderId: string) => {
    setLastOrderMessage(message);
    setLastOrderId(orderId);
    setIsCheckoutOpen(false);
    setIsSuccessModalOpen(true);
  };

  // Reset order after completion
  const handleResetOrder = () => {
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-neutral-100/60 text-neutral-900 flex flex-col font-sans antialiased selection:bg-amber-300 selection:text-neutral-900">
      {/* Header with logo, hours and direct contacts */}
      <Header
        cartItemCount={totalItemCount}
        cartTotal={grandTotal}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Sticky categories bar with cart shortcut */}
      <CategoryNav
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        itemCountsByCategory={itemCountsByCategory}
        cartItemCount={totalItemCount}
        cartTotal={grandTotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 flex-1 w-full space-y-6">
        {/* Banner with Restaurant highlights & tracking ID notice */}
        <section className="bg-linear-to-r from-amber-400 via-amber-300 to-amber-400 rounded-3xl p-5 sm:p-7 shadow-sm border border-amber-500/30 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-neutral-950 text-amber-300 px-3 py-1 rounded-full shadow-xs">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Carta Oficial • Pedidos directos a WhatsApp con ID de Seguimiento
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-neutral-950 tracking-tight leading-tight">
              ¡Disfruta el auténtico sabor de {RESTAURANT_INFO.name}!
            </h2>
            <p className="text-xs sm:text-sm text-neutral-800 font-medium leading-relaxed">
              Elige tus completos, churrascos, as, empanadas, papas fritas y bebidas. Agrega ingredientes extras con cálculo automático. Al enviar, <strong>se genera un ID de seguimiento</strong> colocado al inicio del mensaje para que el local identifique tu pedido de inmediato.
            </p>
          </div>

          {/* Decorative motif */}
          <div className="absolute -right-6 -bottom-8 opacity-15 pointer-events-none select-none text-9xl font-black text-neutral-950">
            🍔
          </div>
        </section>

        {/* Google Maps Review & Schedule Highlight Bar */}
        <section className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-neutral-900 flex items-center gap-1.5">
                <span>¿Nos visitas o ya probaste nuestros platos?</span>
              </h3>
              <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                ¡Tu opinión nos ayuda a crecer! Déjanos tu valoración y comentario en nuestro perfil oficial de Google Maps.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={RESTAURANT_INFO.mapsReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-black px-4 py-2 rounded-xl text-xs shadow-xs transition-colors"
            >
              <span>⭐⭐⭐⭐⭐ Dejar Reseña en Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* Extras Quick Showcase Bar */}
        <section className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wide">
                Ingredientes Extras Disponibles
              </h3>
            </div>
            <span className="text-xs text-neutral-500 font-medium">
              Añádelos a cualquier producto en el carrito con costo calculado automáticamente
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {EXTRA_INGREDIENTS.map((extra) => (
              <div
                key={extra.id}
                className="bg-neutral-50 hover:bg-amber-50/60 border border-neutral-200 hover:border-amber-300 rounded-xl p-2.5 text-center transition-colors"
              >
                <span className="text-xs font-bold text-neutral-900 block truncate">
                  {extra.name}
                </span>
                <span className="text-xs font-black text-amber-700 block mt-0.5">
                  +{formatCLP(extra.price)}
                </span>
                {extra.badge && (
                  <span className="inline-block text-[9px] uppercase font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-sm mt-1">
                    {extra.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Menu Items Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 capitalize">
                {selectedCategory === 'all'
                  ? 'Todos los Productos'
                  : CATEGORIES.find((c) => c.id === selectedCategory)?.name}
              </h2>
            </div>
            <span className="text-xs font-bold text-neutral-500">
              {filteredMenuItems.length} {filteredMenuItems.length === 1 ? 'opción' : 'opciones'}
            </span>
          </div>

          {filteredMenuItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-neutral-500">
              <p className="text-sm font-bold text-neutral-700 mb-2">
                No se encontraron productos para "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs font-extrabold text-amber-700 hover:underline"
              >
                Restablecer filtros de búsqueda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredMenuItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  currentQuantity={getItemQuantity(item.id)}
                  onSelectToCustomize={handleOpenCustomize}
                  onQuickAdd={handleQuickAdd}
                  onDecreaseQuantity={handleDecreaseQuantity}
                />
              ))}
            </div>
          )}
        </section>

        {/* Bottom Fast Food Information & Delivery Notice */}
        <section className="bg-neutral-900 text-neutral-300 rounded-2xl p-5 sm:p-6 text-xs sm:text-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 text-amber-400 font-extrabold border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span>Información de Horario, Entrega & Contacto</span>
            </div>
            <span className="text-xs text-neutral-400 font-medium">
              {RESTAURANT_INFO.address}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-neutral-300">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>Horario de Atención</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                • <strong>Mié, Jue y Dom:</strong> 17:30 a 00:00 hrs
                <br />
                • <strong>Vie y Sáb:</strong> 17:30 a 01:00 hrs
                <br />
                • <strong>Lun y Mar:</strong> Cerrado
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Modalidad de Entrega</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                • <strong>Retiro en Local:</strong> Inmediato y coordinado al momento.
                <br />
                • <strong>Envíos a Domicilio:</strong> Por ahora sin repartidores fijos, únicamente <u>previa consulta</u> vía WhatsApp.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>Google Maps & Reseñas</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Encuéntranos y déjanos tu opinión en Google Maps:
              </p>
              <a
                href={RESTAURANT_INFO.mapsReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline font-bold text-xs inline-flex items-center gap-1"
              >
                <span>Dejar comentario en Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Floating Cart Button Bar */}
      {cartItems.length > 0 && (
        <aside 
          aria-label="Resumen rápido de compra"
          className="fixed bottom-4 inset-x-4 z-25 sm:hidden animate-in slide-in-from-bottom duration-200"
        >
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-neutral-950 hover:bg-neutral-800 text-amber-300 px-4 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-amber-400/80 transition-transform active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItemCount}
                </span>
              </div>
              <span className="text-xs font-extrabold text-white">
                Ver Carrito ({totalItemCount})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-amber-400">
                {formatCLP(grandTotal)}
              </span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </div>
          </button>
        </aside>
      )}

      {/* Modals & Drawers */}
      <CustomizeModal
        item={itemToCustomize}
        isOpen={isCustomizeModalOpen}
        onClose={() => {
          setIsCustomizeModalOpen(false);
          setItemToCustomize(null);
          setCustomizingCartItemId(null);
        }}
        onAddToCart={handleAddCustomizedToCart}
        initialExtras={customizingInitialExtras}
        initialNotes={customizingInitialNotes}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onEditItemExtras={handleEditCartItemExtras}
        onProceedToCheckout={handleProceedToCheckout}
        onAddExtraToLastItem={handleAddExtraToLastItem}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        customerInfo={customerInfo}
        onUpdateCustomerInfo={setCustomerInfo}
        onOrderSuccess={handleOrderSuccess}
        onAddExtraToItem={handleAddExtraToItem}
      />

      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        orderMessage={lastOrderMessage}
        orderId={lastOrderId}
        onResetOrder={handleResetOrder}
      />
    </div>
  );
}

export default App;
