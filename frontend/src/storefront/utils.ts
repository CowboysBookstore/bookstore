import type { CartItem, FulfillmentMethod, PricingSummary } from "./types";

/**
 * Formats a raw number string into a credit card number format (e.g., "0000 0000 0000 0000").
 * Limits input to 16 digits.
 */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.match(/.{1,4}/g)?.join(" ") ?? digits;
}

/**
 * Formats a raw number string into an expiration date format (e.g., "MM/YY").
 * Limits input to 4 digits and automatically corrects invalid months.
 */
export function formatExpiration(value: string): string {
  let digits = value.replace(/\D/g, "").slice(0, 4);

  // Instantly prevent invalid months during input
  if (digits.length >= 2) {
    let month = parseInt(digits.slice(0, 2), 10);
    if (month > 12) month = 12;
    if (month === 0) month = 1; // Prevent 00 month
    digits = `${month.toString().padStart(2, "0")}${digits.slice(2)}`;
  }

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/**
 * Formats a number into a currency string (e.g., "$12.34").
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/**
 * Formats a date string into a short date (e.g., "Jan 1, 2024").
 */
export function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a date string into an order date (e.g., "January 1, 2024").
 */
export function formatOrderDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a date string into an order date and time (e.g., "January 1, 2024 at 10:30 AM").
 */
export function formatOrderDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

/**
 * Generates a list of available pickup windows for the next few days.
 */
export function getPickupWindows(): string[] {
  const windows: string[] = [];
  const now = new Date();

  for (let i = 0; i < 3; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const dayOfMonth = date.getDate();

    windows.push(`${day}, ${month} ${dayOfMonth} - 10:00 AM`);
    windows.push(`${day}, ${month} ${dayOfMonth} - 02:00 PM`);
  }

  return windows;
}

/**
 * Returns a user-friendly label for a payment method.
 */
export function getPaymentMethodLabel(
  method: FulfillmentMethod | "card" | "campus-charge",
  digits?: string,
): string {
  switch (method) {
    case "pickup":
      return "Campus pickup";
    case "delivery":
      return "Delivery";
    case "card":
      return `Card ending in ${digits?.slice(-4)}`;
    case "campus-charge":
      return `Student ID ${digits}`;
    default:
      return "Unknown";
  }
}

/**
 * Calculates the pricing summary for the cart.
 * This is a placeholder and should eventually be handled by the backend.
 */
export function calculatePricing(
  cartItems: CartItem[],
  fulfillment: FulfillmentMethod,
  appliedPromoDetails: { discount_type: string; discount_value: number } | null,
): PricingSummary {
  let subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  let discount = 0;

  if (appliedPromoDetails) {
    if (appliedPromoDetails.discount_type === "percentage") {
      discount = subtotal * (appliedPromoDetails.discount_value / 100);
    } else if (appliedPromoDetails.discount_type === "fixed") {
      discount = appliedPromoDetails.discount_value;
    }
    discount = Math.min(discount, subtotal); // Discount cannot exceed subtotal
  }

  const subtotalAfterDiscount = subtotal - discount;
  const tax = subtotalAfterDiscount * 0.0825; // Example 8.25% tax rate
  let fulfillmentFee = 0;
  if (fulfillment === "delivery" && subtotalAfterDiscount < 50) {
    fulfillmentFee = 5; // Example delivery fee
  }

  const total = subtotalAfterDiscount + tax + fulfillmentFee;

  return {
    subtotal,
    discount,
    tax,
    fulfillmentFee,
    total,
    freeDeliveryRemaining:
      fulfillment === "delivery" && subtotalAfterDiscount < 50
        ? 50 - subtotalAfterDiscount
        : 0,
  };
}

/**
 * Resolve cart lines into CartItem objects using the provided product lookup.
 */
export function resolveCartItems(
  cartLines: { productId: string; quantity: number }[],
  getProduct: (id: string) => any,
) {
  return cartLines
    .map((line) => {
      const product = getProduct(line.productId);
      if (!product) return null;
      return {
        product,
        productId: line.productId,
        quantity: line.quantity,
        lineTotal: product.price * line.quantity,
      } as unknown as CartItem;
    })
    .filter(Boolean) as CartItem[];
}

/** Normalize wishlist records from session storage */
export function normalizeWishlist(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((v) => v) as any[];
}

/** Normalize seeded orders to remove any retired seed IDs (test helper) */
export function normalizeOrders(value: unknown) {
  if (!Array.isArray(value)) return [];
  // Filter out any seeded order IDs that are considered retired in this app
  const retired = new Set<string>(["CB-20418"]);
  return (value as any[]).filter((o) => !retired.has(o.id));
}