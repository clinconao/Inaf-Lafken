export type CategoryId = 
  | 'antojos' 
  | 'completos' 
  | 'as' 
  | 'churrascos' 
  | 'empanadas' 
  | 'papas-fritas' 
  | 'especiales-nuevos'
  | 'liquidos'
  | 'bebidas-calientes'
  | 'caseros-surenos';

export interface ExtraIngredient {
  id: string;
  name: string;
  price: number;
  description?: string;
  badge?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  description?: string;
  isPopular?: boolean;
  isNew?: boolean;
  badgeText?: string;
  image?: string;
  suggestedExtras?: string[];
}

export interface SelectedExtra {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  id: string; // unique item instance id
  menuItemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  extras: SelectedExtra[];
  notes?: string;
  unitPriceWithExtras: number;
  totalPrice: number;
}

export interface CustomerOrderInfo {
  name: string;
  phone: string;
  deliveryType: 'delivery' | 'retiro';
  address: string;
  reference: string;
  paymentMethod: 'efectivo' | 'transferencia' | 'tarjeta';
  notes: string;
  orderId?: string;
}
