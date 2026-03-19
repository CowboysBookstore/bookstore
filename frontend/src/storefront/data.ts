import type { OrderRecord, Product } from "./types";

export const storefrontCategories = [
  "All",
  "Textbooks",
  "Office Supplies",
  "Tech Accessories",
  "McNeese Gear",
] as const;

export const storefrontProducts: Product[] = [];

export const seededOrders: OrderRecord[] = [
  {
    id: "CB-20418",
    placedAt: "2026-03-09T15:00:00.000Z",
    status: "Ready for pickup",
    fulfillment: "pickup",
    subtotal: 83.74,
    tax: 7.33,
    fulfillmentFee: 0,
    total: 91.07,
    pickupSlot: "March 10, 1:00 PM - 3:00 PM",
    items: [
      {
        productId: "cowboy-study-planner",
        title: "Cowboy Semester Planner",
        quantity: 1,
        unitPrice: 18.75,
      },
      {
        productId: "eng-101-writing-handbook",
        title: "ENG 101 Writing Handbook",
        quantity: 1,
        unitPrice: 64.99,
      },
    ],
  },
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function formatOrderDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
