import catalogData from "./catalog.json";
import type { OrderRecord, Product } from "./types";

export {
  formatCurrency,
  formatOrderDate,
  formatOrderDateTime,
  formatShortDate,
  getPickupWindows,
  promoOffers,
} from "./utils";

type CatalogProductRecord = {
  slug: string;
  title: string;
  category: Product["category"];
  short_description: string;
  description: string;
  badge: string;
  course?: string;
  format: string;
  price: string;
  inventory: number;
  rating: number;
  pickup_note: string;
  delivery_note: string;
  highlights: string[];
  cover_gradient: string;
};

const catalogRecords = catalogData as CatalogProductRecord[];

export const storefrontCategories = [
  "All",
  "Textbooks",
  "Office Supplies",
  "Tech Accessories",
  "McNeese Gear",
] as const;

export const storefrontProducts: Product[] = catalogRecords.map((product) => ({
  id: product.slug,
  title: product.title,
  category: product.category,
  price: Number(product.price),
  description: product.description,
  shortDescription: product.short_description,
  badge: product.badge,
  course: product.course || undefined,
  format: product.format,
  stock: product.inventory,
  rating: product.rating,
  pickupNote: product.pickup_note,
  deliveryNote: product.delivery_note,
  highlights: product.highlights,
  coverGradient: product.cover_gradient,
}));

export const seededOrders: OrderRecord[] = [];
