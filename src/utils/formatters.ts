import { CartItem, CustomerOrderInfo } from '../types';
import { RESTAURANT_INFO } from '../data/menuData';

/**
 * Generate a unique, readable tracking order ID (e.g. #IL-8492)
 */
export function generateOrderId(): string {
  const chars = '0123456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `#IL-${rand}`;
}

/**
 * Format a number to Chilean Peso currency (e.g., $ 2.000)
 */
export function formatCLP(amount: number): string {
  const formatted = new Intl.NumberFormat('es-CL').format(amount);
  return `$ ${formatted}`;
}

/**
 * Construct the WhatsApp message text detailing the entire purchase.
 * The Tracking Order ID is positioned at the very top for fast identification.
 */
export function buildWhatsAppMessage(
  cartItems: CartItem[],
  customerInfo: CustomerOrderInfo,
  totalAmount: number,
  orderId: string
): string {
  const dateStr = new Date().toLocaleString('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  let message = `🆔 *SEGUIMIENTO DE PEDIDO: ${orderId}*\n`;
  message += `🛒 *${RESTAURANT_INFO.name.toUpperCase()}*\n`;
  message += `📅 *Fecha:* ${dateStr}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Customer info
  message += `👤 *DATOS DEL CLIENTE*\n`;
  message += `• *Nombre:* ${customerInfo.name.trim() || 'No especificado'}\n`;
  if (customerInfo.phone) {
    message += `• *Teléfono:* ${customerInfo.phone.trim()}\n`;
  }
  message += `• *Modalidad:* ${
    customerInfo.deliveryType === 'delivery'
      ? '🛵 Envío a domicilio (⚠️ Previa consulta y confirmación)'
      : '🛍️ Retiro en local'
  }\n`;

  if (customerInfo.deliveryType === 'delivery') {
    message += `• *Dirección de entrega:* ${customerInfo.address.trim() || 'Por coordinar'}\n`;
    if (customerInfo.reference.trim()) {
      message += `• *Referencia:* ${customerInfo.reference.trim()}\n`;
    }
  }

  const paymentLabels: Record<string, string> = {
    efectivo: '💵 Efectivo al recibir',
    transferencia: '📱 Transferencia electrónica previa',
    tarjeta: '💳 Tarjeta Débito / Crédito',
  };
  message += `• *Medio de pago:* ${paymentLabels[customerInfo.paymentMethod] || customerInfo.paymentMethod}\n`;

  if (customerInfo.notes.trim()) {
    message += `• *Observaciones:* ${customerInfo.notes.trim()}\n`;
  }

  message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📋 *DETALLE DEL PEDIDO (${orderId})*\n\n`;

  let subtotalBase = 0;
  let subtotalExtras = 0;

  cartItems.forEach((item, index) => {
    const itemExtrasTotal = item.extras.reduce((acc, e) => acc + e.price * e.quantity, 0);
    subtotalBase += item.basePrice * item.quantity;
    subtotalExtras += itemExtrasTotal * item.quantity;

    message += `*${index + 1}. ${item.name} x ${item.quantity}* (${formatCLP(item.basePrice)} c/u)\n`;

    if (item.extras.length > 0) {
      message += `   ➕ *Extras añadidos:*\n`;
      item.extras.forEach((ext) => {
        const qtyLabel = ext.quantity > 1 ? ` (x ${ext.quantity})` : '';
        message += `     • ${ext.name}${qtyLabel}: +${formatCLP(ext.price * ext.quantity)}\n`;
      });
    }

    if (item.notes) {
      message += `   📝 *Nota:* ${item.notes}\n`;
    }

    message += `   👉 *Subtotal:* ${formatCLP(item.totalPrice)}\n\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *RESUMEN DE PAGO*\n`;
  message += `• Subtotal Carta: ${formatCLP(subtotalBase)}\n`;
  if (subtotalExtras > 0) {
    message += `• Total Ingredientes Extra: +${formatCLP(subtotalExtras)}\n`;
  }
  message += `• *TOTAL FINAL A PAGAR: ${formatCLP(totalAmount)}*\n\n`;

  message += `ℹ️ *Horario de atención:*\n`;
  message += `• Mié, Jue y Dom: 17:30 a 00:00 hrs\n`;
  message += `• Vie y Sáb: 17:30 a 01:00 hrs\n\n`;

  message += `Por favor confirmen recepción del pedido ${orderId}. ¡Muchas gracias! 🙌`;

  return message;
}

/**
 * Trigger sharing to WhatsApp via Web Share API or direct wa.me URL
 */
export async function shareWhatsAppOrder(
  message: string,
  targetPhone: string = RESTAURANT_INFO.phoneRaw
): Promise<{ method: 'share_api' | 'direct_whatsapp'; success: boolean }> {
  const encodedText = encodeURIComponent(message);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`;

  // Check if Web Share API is available and can share text
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Pedido ${RESTAURANT_INFO.name}`,
        text: message,
      });
      return { method: 'share_api', success: true };
    } catch (err: unknown) {
      // If user aborted or permission was dismissed, fall back to opening direct WhatsApp link
      const isAbort = (err as Error)?.name === 'AbortError';
      if (!isAbort) {
        window.open(whatsappUrl, '_blank');
        return { method: 'direct_whatsapp', success: true };
      }
      return { method: 'share_api', success: false };
    }
  }

  // Fallback to direct WhatsApp link
  window.open(whatsappUrl, '_blank');
  return { method: 'direct_whatsapp', success: true };
}
