import type {
  CartItem,
  CartLine,
  FulfillmentMethod,
  OrderRecord,
  PaymentMethod,
  PricingSummary,
  Product,
  WishlistEntry,
  WishlistPriority,
} from "./types";

interface PromoOffer {
  code: string;
  label: string;
  description: string;
  type: "percent" | "flat";
  value: number;
  minimumSubtotal?: number;
}

const TAX_RATE = 0.0875;
const DELIVERY_FEE = 6.95;
const FREE_DELIVERY_THRESHOLD = 100;
const defaultWishlistPriority: WishlistPriority = "Compare";
const retiredSeedOrderIds = new Set(["CB-20418"]);

export const promoOffers: PromoOffer[] = [
  {
    code: "COWBOY10",
    label: "10% off course-ready carts",
    description: "Save 10% on qualifying orders of $75 or more.",
    type: "percent",
    value: 0.1,
    minimumSubtotal: 75,
  },
  {
    code: "WELCOME5",
    label: "$5 off your first order",
    description: "A quick welcome discount when the cart is at least $25.",
    type: "flat",
    value: 5,
    minimumSubtotal: 25,
  },
  {
    code: "GEARUP",
    label: "$15 off delivery over $100",
    description: "Use on larger carts to offset supplies and delivery spend.",
    type: "flat",
    value: 15,
    minimumSubtotal: 100,
  },
];

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function buildWindow(start: Date, end: Date) {
  const dayLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(start);
  const startTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(start);
  const endTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(end);
  return `${dayLabel}, ${startTime} - ${endTime}`;
}

export function getPickupWindows(referenceDate = new Date()) {
  const tomorrow = addDays(referenceDate, 1);
  const dayAfter = addDays(referenceDate, 2);
  const thirdDay = addDays(referenceDate, 3);

  const windows = [
    [tomorrow, 11, 13],
    [tomorrow, 14, 16],
    [dayAfter, 9, 11],
    [thirdDay, 12, 15],
  ] as const;

  return windows.map(([baseDate, startHour, endHour]) => {
    const start = new Date(baseDate);
    start.setHours(startHour, 0, 0, 0);
    const end = new Date(baseDate);
    end.setHours(endHour, 0, 0, 0);
    return buildWindow(start, end);
  });
}

export function resolveCartItems(
  cart: CartLine[],
  getProduct: (productId: string) => Product | undefined,
) {
  return cart
    .map((line) => {
      const product = getProduct(line.productId);
      if (!product) {
        return null;
      }

      return {
        ...line,
        product,
        lineTotal: roundCurrency(line.quantity * product.price),
      } satisfies CartItem;
    })
    .filter((item): item is CartItem => Boolean(item));
}

export function findPromoOffer(code?: string | null) {
  if (!code) {
    return null;
  }

  const normalizedCode = code.trim().toUpperCase();
  return promoOffers.find((offer) => offer.code === normalizedCode) ?? null;
}

export function calculatePricing(
  cartItems: CartItem[],
  fulfillment: FulfillmentMethod,
  promoCode?: string | null,
) {
  const subtotal = roundCurrency(
    cartItems.reduce((sum, item) => sum + item.lineTotal, 0),
  );
  const promoOffer = findPromoOffer(promoCode);
  const qualifiesForPromo = Boolean(
    promoOffer && subtotal > 0 && subtotal >= (promoOffer.minimumSubtotal ?? 0),
  );
  const rawDiscount =
    promoOffer && qualifiesForPromo
      ? promoOffer.type === "percent"
        ? subtotal * promoOffer.value
        : promoOffer.value
      : 0;
  const discount = roundCurrency(Math.min(rawDiscount, subtotal));
  const taxableSubtotal = Math.max(subtotal - discount, 0);
  const tax = roundCurrency(taxableSubtotal * TAX_RATE);
  const fulfillmentFee =
    fulfillment === "delivery"
      ? taxableSubtotal >= FREE_DELIVERY_THRESHOLD
        ? 0
        : DELIVERY_FEE
      : 0;
  const total = roundCurrency(taxableSubtotal + tax + fulfillmentFee);

  return {
    subtotal,
    tax,
    discount,
    fulfillmentFee: roundCurrency(fulfillmentFee),
    total,
    freeDeliveryRemaining: roundCurrency(
      Math.max(FREE_DELIVERY_THRESHOLD - taxableSubtotal, 0),
    ),
  } satisfies PricingSummary;
}

export function normalizeWishlist(rawValue: unknown) {
  if (!Array.isArray(rawValue)) {
    return [] as WishlistEntry[];
  }

  return rawValue.flatMap((item) => {
    if (typeof item === "string") {
      return [
        {
          productId: item,
          addedAt: new Date().toISOString(),
          priority: defaultWishlistPriority,
        },
      ];
    }

    if (!item || typeof item !== "object") {
      return [];
    }

    const candidate = item as Partial<WishlistEntry>;
    if (typeof candidate.productId !== "string") {
      return [];
    }

    const priority = isWishlistPriority(candidate.priority)
      ? candidate.priority
      : defaultWishlistPriority;

    return [
      {
        productId: candidate.productId,
        addedAt:
          typeof candidate.addedAt === "string"
            ? candidate.addedAt
            : new Date().toISOString(),
        priority,
      },
    ];
  });
}

export function normalizeOrders(rawValue: unknown) {
  if (!Array.isArray(rawValue)) {
    return [] as OrderRecord[];
  }

  return rawValue.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const candidate = item as Partial<OrderRecord>;
    if (
      typeof candidate.id !== "string" ||
      retiredSeedOrderIds.has(candidate.id) ||
      typeof candidate.placedAt !== "string" ||
      typeof candidate.status !== "string" ||
      (candidate.fulfillment !== "pickup" &&
        candidate.fulfillment !== "delivery")
    ) {
      return [];
    }

    const customer =
      candidate.customer &&
      typeof candidate.customer.fullName === "string" &&
      typeof candidate.customer.email === "string" &&
      typeof candidate.customer.phone === "string"
        ? candidate.customer
        : {
            fullName: "Cowboy Student",
            email: "student@mcneese.edu",
            phone: "(337) 555-0144",
          };

    const paymentMethod = isPaymentMethod(candidate.paymentMethod)
      ? candidate.paymentMethod
      : "card";

    return [
      {
        id: candidate.id,
        placedAt: candidate.placedAt,
        status: candidate.status,
        fulfillment: candidate.fulfillment,
        subtotal:
          typeof candidate.subtotal === "number" ? candidate.subtotal : 0,
        tax: typeof candidate.tax === "number" ? candidate.tax : 0,
        discount:
          typeof candidate.discount === "number" ? candidate.discount : 0,
        fulfillmentFee:
          typeof candidate.fulfillmentFee === "number"
            ? candidate.fulfillmentFee
            : 0,
        total: typeof candidate.total === "number" ? candidate.total : 0,
        pickupSlot:
          typeof candidate.pickupSlot === "string"
            ? candidate.pickupSlot
            : undefined,
        deliveryAddress:
          typeof candidate.deliveryAddress === "string"
            ? candidate.deliveryAddress
            : undefined,
        deliveryInstructions:
          typeof candidate.deliveryInstructions === "string"
            ? candidate.deliveryInstructions
            : undefined,
        customer,
        paymentMethod,
        paymentLabel:
          typeof candidate.paymentLabel === "string"
            ? candidate.paymentLabel
            : "Visa ending in 4242",
        promoCode:
          typeof candidate.promoCode === "string"
            ? candidate.promoCode
            : undefined,
        items: Array.isArray(candidate.items)
          ? candidate.items.flatMap((line) => {
              if (!line || typeof line !== "object") {
                return [];
              }

              const candidateLine = line as Partial<
                OrderRecord["items"][number]
              >;
              if (
                typeof candidateLine.productId !== "string" ||
                typeof candidateLine.title !== "string" ||
                typeof candidateLine.quantity !== "number" ||
                typeof candidateLine.unitPrice !== "number"
              ) {
                return [];
              }

              return [
                {
                  productId: candidateLine.productId,
                  title: candidateLine.title,
                  quantity: candidateLine.quantity,
                  unitPrice: candidateLine.unitPrice,
                  category: candidateLine.category ?? "Textbooks",
                },
              ];
            })
          : [],
      },
    ];
  });
}

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

export function formatOrderDateTime(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function getPaymentMethodLabel(
  paymentMethod: PaymentMethod,
  digits: string,
) {
  if (paymentMethod === "card") {
    const lastFour = digits.slice(-4) || "4242";
    return `Visa ending in ${lastFour}`;
  }

  if (paymentMethod === "campus-charge") {
    return `Campus charge account ${digits.slice(-4) || "2048"}`;
  }

  return "PayPal wallet";
}

function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === "card" || value === "campus-charge" || value === "paypal";
}

function isWishlistPriority(value: unknown): value is WishlistPriority {
  return value === "Need soon" || value === "Compare" || value === "Later";
}
