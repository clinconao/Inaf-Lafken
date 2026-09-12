import React, { useState, useEffect } from 'react';
import { CartItem, CustomerOrderInfo } from '../types';
import { RESTAURANT_INFO, EXTRA_INGREDIENTS } from '../data/menuData';
import { formatCLP, buildWhatsAppMessage, generateOrderId } from '../utils/formatters';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  FileText, 
  Sparkles, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Hash,
  Star
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  customerInfo: CustomerOrderInfo;
  onUpdateCustomerInfo: (info: CustomerOrderInfo) => void;
  onOrderSuccess: (orderMessage: string, orderId: string) => void;
  onAddExtraToItem: (cartItemId: string, extraId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  customerInfo,
  onUpdateCustomerInfo,
  onOrderSuccess,
  onAddExtraToItem,
}) => {
  const [copied, setCopied] = useState(false);
  const [showTextPreview, setShowTextPreview] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const id = customerInfo.orderId || generateOrderId();
      setOrderId(id);
      if (!customerInfo.orderId) {
        onUpdateCustomerInfo({
          ...customerInfo,
          orderId: id,
        });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const subtotalBase = cartItems.reduce(
    (acc, item) => acc + item.basePrice * item.quantity,
    0
  );
  const subtotalExtras = cartItems.reduce((acc, item) => {
    const extrasCost = item.extras.reduce((eAcc, e) => eAcc + e.price * e.quantity, 0);
    return acc + extrasCost * item.quantity;
  }, 0);
  const totalAmount = subtotalBase + subtotalExtras;

  const currentOrderId = orderId || customerInfo.orderId || '#IL-0001';
  const generatedWhatsAppMessage = buildWhatsAppMessage(cartItems, customerInfo, totalAmount, currentOrderId);

  const handleInputChange = (field: keyof CustomerOrderInfo, value: string) => {
    onUpdateCustomerInfo({
      ...customerInfo,
      [field]: value,
    });
    if (validationError) setValidationError(null);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generatedWhatsAppMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = generatedWhatsAppMessage;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const validateForm = (): boolean => {
    if (!customerInfo.name.trim()) {
      setValidationError('Por favor ingresa tu nombre para identificar el pedido.');
      return false;
    }
    if (customerInfo.deliveryType === 'delivery' && !customerInfo.address.trim()) {
      setValidationError('Por favor indica la dirección para coordinar el envío.');
      return false;
    }
    return true;
  };

  const handleSendOrder = () => {
    if (!validateForm()) return;

    const encoded = encodeURIComponent(generatedWhatsAppMessage);
    const directUrl = `https://api.whatsapp.com/send?phone=${RESTAURANT_INFO.phoneRaw}&text=${encoded}`;
    window.open(directUrl, '_blank');
    onOrderSuccess(generatedWhatsAppMessage, currentOrderId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
      >
        {/* Modal Header */}
        <div className="bg-emerald-700 text-white px-5 py-3.5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800/80 rounded-xl text-emerald-200">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="checkout-title" className="text-lg font-black text-white leading-tight">
                  Confirmar y Enviar Pedido
                </h2>
                <span
                  style={{ height: '30px', width: '80px' }}
                  className="bg-amber-400 text-neutral-950 text-xs font-black px-2 rounded-full flex items-center justify-center shadow-xs"
                >
                  {currentOrderId}
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                Envío directo al WhatsApp oficial: {RESTAURANT_INFO.phone}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-neutral-800">
          {/* Tracking ID Notice Banner */}
          <div className="bg-neutral-900 text-amber-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between border border-amber-400/30">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-amber-400" />
              <span>
                ID asignado para seguimiento: <strong>{currentOrderId}</strong> (irá de los primeros en el mensaje)
              </span>
            </div>
          </div>

          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 text-xs font-bold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Customer info form */}
          <div>
            <h3 className="text-sm font-extrabold text-neutral-900 mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              <span>1. Tus Datos de Contacto</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Tu Nombre completo *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Claudia Morales"
                  value={customerInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full text-sm px-3.5 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Teléfono de contacto (opcional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="tel"
                    placeholder="+56 9 ..."
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full text-sm pl-9 pr-3.5 py-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery vs Retiro */}
          <div>
            <h3 className="text-sm font-extrabold text-neutral-900 mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>2. Forma de Entrega</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <button
                type="button"
                onClick={() => handleInputChange('deliveryType', 'retiro')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  customerInfo.deliveryType === 'retiro'
                    ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950 ring-2 ring-emerald-500/20'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                }`}
              >
                <span className="text-xl mb-1">🛍️</span>
                <span className="text-xs font-extrabold">Retiro en Local</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Opción habitual / rápida</span>
              </button>

              <button
                type="button"
                onClick={() => handleInputChange('deliveryType', 'delivery')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  customerInfo.deliveryType === 'delivery'
                    ? 'border-amber-500 bg-amber-50 font-bold text-amber-950 ring-2 ring-amber-500/20'
                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                }`}
              >
                <span className="text-xl mb-1">🛵</span>
                <span className="text-xs font-extrabold">Envío a Domicilio</span>
                <span className="text-[10px] text-amber-700 font-bold">⚠️ Previa consulta</span>
              </button>
            </div>

            {customerInfo.deliveryType === 'delivery' && (
              <div className="space-y-2 p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-xs">
                <div className="flex items-center gap-1.5 text-amber-900 font-black">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Aviso Importante sobre Envíos:</span>
                </div>
                <p className="text-neutral-700 text-[11px] leading-relaxed">
                  Por ahora <strong>no contamos con repartidores fijos</strong>. El despacho a domicilio es <strong>únicamente previa consulta</strong> y confirmación telefónica o por WhatsApp según disponibilidad.
                </p>
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Dirección de entrega *
                  </label>
                  <input
                    type="text"
                    placeholder="Calle, número, pasaje o sector..."
                    value={customerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full text-sm px-3.5 py-2 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1">
                    Referencia o indicaciones adicionales
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Portón café, cerca de..."
                    value={customerInfo.reference}
                    onChange={(e) => handleInputChange('reference', e.target.value)}
                    className="w-full text-sm px-3.5 py-2 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-sm font-extrabold text-neutral-900 mb-2 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>3. Medio de Pago</span>
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'efectivo', label: 'Efectivo', icon: '💵', desc: 'Al recibir' },
                { id: 'transferencia', label: 'Transferencia', icon: '📱', desc: 'Previa' },
                { id: 'tarjeta', label: 'Tarjeta', icon: '💳', desc: 'Débito / Crédito' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleInputChange('paymentMethod', m.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    customerInfo.paymentMethod === m.id
                      ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950 ring-1 ring-emerald-500'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                  }`}
                >
                  <span className="text-lg block mb-0.5">{m.icon}</span>
                  <span className="text-xs font-bold block">{m.label}</span>
                  <span className="text-[10px] text-neutral-500 block">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Review of Extra Ingredients */}
          <div className="p-3.5 bg-amber-50/90 border border-amber-300/80 rounded-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-neutral-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>¿Deseas añadir algún extra antes de enviar?</span>
              </span>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                {subtotalExtras > 0 ? `+${formatCLP(subtotalExtras)} agregados` : 'Sin extras aún'}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {EXTRA_INGREDIENTS.map((extra) => {
                const firstItem = cartItems[0];
                const hasExtra = firstItem?.extras.some((e) => e.id === extra.id);

                return (
                  <button
                    key={extra.id}
                    onClick={() => firstItem && onAddExtraToItem(firstItem.id, extra.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 transition-all ${
                      hasExtra
                        ? 'bg-amber-300 border-amber-400 text-neutral-950 font-bold'
                        : 'bg-white border-amber-200 text-neutral-800 hover:border-amber-400'
                    }`}
                  >
                    <span>{extra.name}</span>
                    <span className="text-[10px] text-amber-800 font-extrabold">
                      +{formatCLP(extra.price)}
                    </span>
                    {hasExtra && <CheckCircle2 className="w-3 h-3 text-neutral-900" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generated Text WhatsApp Preview Drawer */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTextPreview(!showTextPreview)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-neutral-100/70 hover:bg-neutral-100 text-left text-xs font-bold text-neutral-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Ver texto exacto que se enviará a WhatsApp ({currentOrderId})</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-600">
                <span className="text-[11px] font-semibold">
                  {showTextPreview ? 'Ocultar' : 'Mostrar'}
                </span>
                {showTextPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showTextPreview && (
              <div className="p-4 bg-neutral-900 text-emerald-400 text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed border-t border-neutral-800">
                {generatedWhatsAppMessage}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Sharing Buttons */}
        <div className="bg-neutral-50 px-5 py-4 border-t border-neutral-200 space-y-3">
          {/* Total display */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
              Total Final ({currentOrderId}):
            </span>
            <span className="text-xl font-black text-emerald-800">
              {formatCLP(totalAmount)}
            </span>
          </div>

          {/* Dispatch button */}
          <div>
            <button
              id="btn-direct-whatsapp"
              onClick={handleSendOrder}
              className="w-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-98 text-sm sm:text-base"
            >
              <span>Enviar pedido por WhatsApp</span>
            </button>
          </div>

          {/* Copy text fallback */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 py-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">¡Mensaje copiado al portapapeles!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Copiar texto del pedido</span>
                </>
              )}
            </button>

            <a
              href={RESTAURANT_INFO.mapsReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1"
            >
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span>Ver en Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
