export type FulfillmentMethod = "pickup" | "delivery";
export type PaymentMethod = "card" | "campus-charge" | "paypal";
export type WishlistPriority = "Need soon" | "Compare" | "Later";

export interface Product {
  id: string;
  title: string;
  category: "Textbooks" | "Office Supplies" | "Tech Accessories" | "McNeese Gear";
  price: number;
  description: string;
  shortDescription: string;
  badge: string;
  course?: string;
  format: string;
  stock: number;
  rating: number;
  pickupNote: string;
  deliveryNote: string;
  highlights: string[];
  coverGradient: string;
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface WishlistEntry {
  productId: string;
  addedAt: string;
  priority: WishlistPriority;
}

export interface CartItem extends CartLine {
  product: Product;
  lineTotal: number;
}

export interface WishlistItemDetail {
  entry: WishlistEntry;
  product: Product;
}

export interface PricingSummary {
  subtotal: number;
  tax: number;
  discount: number;
  fulfillmentFee: number;
  total: number;
  freeDeliveryRemaining: number;
}

export interface CheckoutCustomer {
  fullName: string;
  email: string;
  phone: string;
}

export interface OrderLine {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  category: Product["category"];
}

export interface CheckoutPayload {
  fulfillment: FulfillmentMethod;
  pickupSlot?: string;
  deliveryAddress?: string;
  deliveryInstructions?: string;
  customer: CheckoutCustomer;
  paymentMethod: PaymentMethod;
  paymentLabel: string;
  promoCode?: string;
  discount: number;
}

export interface OrderRecord {
  id: string;
  placedAt: string;
  status: string;
  fulfillment: FulfillmentMethod;
  subtotal: number;
  tax: number;
  discount: number;
  fulfillmentFee: number;
  total: number;
  pickupSlot?: string;
  deliveryAddress?: string;
  deliveryInstructions?: string;
  customer: CheckoutCustomer;
  paymentMethod: PaymentMethod;
  paymentLabel: string;
  promoCode?: string;
  items: OrderLine[];
}
