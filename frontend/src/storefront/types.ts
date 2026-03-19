export type FulfillmentMethod = "pickup" | "delivery";

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

export interface OrderLine {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderRecord {
  id: string;
  placedAt: string;
  status: string;
  fulfillment: FulfillmentMethod;
  subtotal: number;
  tax: number;
  fulfillmentFee: number;
  total: number;
  pickupSlot?: string;
  deliveryAddress?: string;
  items: OrderLine[];
}
