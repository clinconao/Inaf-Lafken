import React from 'react';
import { ShoppingBag, Phone, MapPin, Search, Clock, Sparkles, Star, AlertCircle } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';
import { formatCLP } from '../utils/formatters';
import { Logo } from './Logo';

interface HeaderProps {
  cartItemCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  cartTotal,
  onOpenCart,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="relative bg-amber-400 border-b border-amber-500/40 shadow-xs transition-all">
      {/* Top micro-bar for hours, Google Maps, and WhatsApp */}
      <div className="bg-neutral-950 text-amber-100 text-xs px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5 font-medium text-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Mié, Jue y Dom: 17:30 a 00:00 • Vie y Sáb: 17:30 a 01:00</span>
          </span>
          <span className="hidden lg:flex items-center gap-1 text-neutral-400">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            {RESTAURANT_INFO.address}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Google Maps review button */}
          <a
            href={RESTAURANT_INFO.mapsReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-400 hover:text-neutral-950 text-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-colors border border-amber-400/30"
            title="Dejar un comentario en Google Maps"
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-400 group-hover:text-neutral-950" />
            <span>Ver en Maps / Reseña</span>
          </a>

          {/* WhatsApp Direct */}
          <a
            href={`https://wa.me/${RESTAURANT_INFO.phoneRaw}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-semibold text-white hover:text-amber-200 transition-colors bg-emerald-700 hover:bg-emerald-600 px-2.5 py-0.5 rounded-full text-[11px]"
            title="Contacto directo WhatsApp"
          >
            <Phone className="w-3 h-3 text-emerald-300" />
            <span>Pedidos: {RESTAURANT_INFO.phone}</span>
          </a>
        </div>
      </div>

      {/* Notice Banner: Envíos a domicilio solo previa consulta */}
      <div className="bg-amber-500 text-neutral-950 px-4 py-1 text-xs font-bold flex items-center justify-center gap-1.5 shadow-inner">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-neutral-900" />
        <span>Envíos a domicilio por ahora únicamente <u>previa consulta</u> telefónica o vía WhatsApp.</span>
      </div>

      {/* Main navigation header */}
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
        {/* Brand identity with official logo */}
        <div className="flex items-center gap-3">
          {/* Inaf Lafken Logo */}
          <Logo className="w-14 h-14 sm:w-16 sm:h-16" />

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight font-serif uppercase">
                {RESTAURANT_INFO.name}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-md shadow-xs">
                <Sparkles className="w-3 h-3" /> Fast Food
              </span>
            </div>
            {/* Tagline */}
            <p className="text-xs sm:text-sm font-semibold text-neutral-800">
              {RESTAURANT_INFO.tagline} • Completos, As, Churrascos, Empanadas, Papas y Bebidas
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search bar on desktop */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
            <input
              type="text"
              placeholder="Buscar en la carta..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-amber-300/60 placeholder-neutral-700 text-neutral-900 rounded-full border border-amber-500/50 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-neutral-900 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-600 hover:text-neutral-900 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Cart Button in Header */}
          <button
            id="open-cart-btn"
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-amber-300 px-3.5 sm:px-4 py-2 rounded-xl shadow-md transition-all transform active:scale-95 border border-amber-400/40"
            aria-label="Abrir carrito de compras"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-red-600 text-white text-[11px] font-black rounded-full h-5 w-5 flex items-center justify-center shadow-xs animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </div>
            <div className="text-left hidden xs:block">
              <span className="text-[10px] uppercase font-bold text-amber-200 block leading-tight">
                Mi Carrito
              </span>
              <span className="text-xs font-black text-white block leading-tight">
                {formatCLP(cartTotal)}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-2.5">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
          <input
            type="text"
            placeholder="Buscar completos, churrascos, bebidas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-sm bg-amber-300/70 placeholder-neutral-700 text-neutral-900 rounded-lg border border-amber-500/40 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-neutral-900"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-600 hover:text-neutral-900 font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
