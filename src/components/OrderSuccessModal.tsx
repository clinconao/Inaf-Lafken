import React, { useState } from 'react';
import { RESTAURANT_INFO } from '../data/menuData';
import { CheckCircle2, Phone, Copy, Check, MessageSquare, RotateCcw, Star, ExternalLink } from 'lucide-react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderMessage: string;
  orderId?: string;
  onResetOrder: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderMessage,
  orderId,
  onResetOrder,
}) => {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  if (!isOpen) return null;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(orderMessage);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    }
  };

  const handleCopyId = async () => {
    if (!orderId) return;
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    } catch {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const handleReopenWhatsApp = () => {
    const encoded = encodeURIComponent(orderMessage);
    const directUrl = `https://api.whatsapp.com/send?phone=${RESTAURANT_INFO.phoneRaw}&text=${encoded}`;
    window.open(directUrl, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="text-[11px] uppercase font-black tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            ¡Pedido Enviado a WhatsApp!
          </span>
          <h2 className="text-2xl font-black text-neutral-900 mt-2">
            ¡Muchas Gracias!
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Tu pedido está listo para ser recibido y confirmado por{' '}
            <strong className="text-neutral-900">{RESTAURANT_INFO.name}</strong>.
          </p>
        </div>

        {/* Tracking ID Badge */}
        {orderId && (
          <div className="bg-neutral-900 text-white p-3.5 rounded-2xl flex items-center justify-between border border-amber-400/40 shadow-sm">
            <div className="text-left">
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                ID de Seguimiento
              </span>
              <span className="text-xl font-black tracking-wider text-white">
                {orderId}
              </span>
            </div>
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors active:scale-95"
              title="Copiar ID de seguimiento"
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar ID</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Google Maps Review Callout */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 text-left space-y-2">
          <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>¡Tu opinión en Google Maps nos ayuda mucho!</span>
          </div>
          <p className="text-xs text-neutral-700 leading-relaxed">
            Te invitamos a dejarnos tu reseña y calificación en nuestro perfil de Google Maps:
          </p>
          <a
            href={RESTAURANT_INFO.mapsReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black py-2 px-3 rounded-xl text-xs shadow-xs transition-colors"
          >
            <span>⭐⭐⭐⭐⭐ Dejar comentario en Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Instructions box */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-3 text-left">
          <div className="flex items-center gap-2 text-neutral-900 font-bold text-xs mb-1">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Coordinación de Entrega:</span>
          </div>
          <p className="text-[11px] text-neutral-600 leading-relaxed">
            • Si elegiste <strong>Retiro en local</strong>, te avisaremos apenas tus platos salgan calientitos.
            <br />
            • Los envíos a domicilio son <strong>previa consulta</strong> y confirmación por WhatsApp según disponibilidad.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleReopenWhatsApp}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-98 text-sm"
          >
            <Phone className="w-4 h-4" />
            <span>Abrir WhatsApp Nuevamente</span>
          </button>

          <button
            onClick={handleCopyMessage}
            className="w-full flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold py-2 px-4 rounded-xl transition-colors text-xs"
          >
            {copiedMessage ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">¡Texto completo copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-neutral-600" />
                <span>Copiar texto completo del pedido</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onResetOrder();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-1.5 text-neutral-500 hover:text-neutral-900 font-semibold py-1.5 text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Hacer un nuevo pedido</span>
          </button>
        </div>
      </div>
    </div>
  );
};
