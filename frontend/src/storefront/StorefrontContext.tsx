import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import type { AxiosResponse } from "axios";
import { seededOrders, storefrontProducts } from "./data";
import type {
  CartItem,
  CartLine,
  CheckoutPayload,
  OrderRecord,
  Product,
  PricingSummary,
  WishlistEntry,
  WishlistItemDetail,
  WishlistPriority,
} from "./types";
import {
  calculatePricing,
  findPromoOffer,
  normalizeOrders,
  normalizeWishlist,
  resolveCartItems,
} from "./utils";

const CART_KEY = "bookstore.cart";
const WISHLIST_KEY = "bookstore.wishlist";
const ORDERS_KEY = "bookstore.orders";
const PROMO_KEY = "bookstore.promo";

interface PromoCodeResult {
  success: boolean;
  message: string;
}

interface StorefrontContextValue {
  products: Product[];
  cart: CartLine[];
  cartItems: CartItem[];
  wishlist: WishlistEntry[];
  wishlistItems: WishlistItemDetail[];
  orders: OrderRecord[];
  cartCount: number;
  wishlistCount: number;
  appliedPromoCode: string | null;
  addToCart: (productId: string, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  moveCartToWishlist: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  updateWishlistPriority: (
    productId: string,
    priority: WishlistPriority,
  ) => void;
  removeFromWishlist: (productId: string) => void;
  moveWishlistToCart: (productId: string) => void;
  moveAllWishlistToCart: () => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => PromoCodeResult;
  clearPromoCode: () => void;
  getPricingSummary: (fulfillment: "pickup" | "delivery") => PricingSummary;
  placeOrder: (payload: CheckoutPayload) => OrderRecord | null;
  getProduct: (productId: string) => Product | undefined;
}

const StorefrontContext = createContext<StorefrontContextValue | undefined>(
  undefined,
);

function useStoredState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    const saved = window.sessionStorage.getItem(key);
    if (!saved) {
      return initialValue;
    }

    try {
      return JSON.parse(saved) as T;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue] as const;
}

function useNormalizedStoredState<T>(
  key: string,
  initialValue: T,
  normalize: (value: unknown) => T,
) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    const saved = window.sessionStorage.getItem(key);
    if (!saved) {
      return initialValue;
    }

    try {
      return normalize(JSON.parse(saved));
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export function StorefrontProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useStoredState<CartLine[]>(CART_KEY, []);
  const [wishlist, setWishlist] = useNormalizedStoredState<WishlistEntry[]>(
    WISHLIST_KEY,
    [],
    normalizeWishlist,
  );
  const [orders, setOrders] = useNormalizedStoredState<OrderRecord[]>(
    ORDERS_KEY,
    seededOrders,
    normalizeOrders,
  );
  const [appliedPromoCode, setAppliedPromoCode] = useStoredState<string | null>(
    PROMO_KEY,
    null,
  );
  const [products, setProducts] = useState<Product[]>(storefrontProducts);

  useEffect(() => {
    setOrders((current) => {
      const normalized = normalizeOrders(current);
      return normalized.length === current.length ? current : normalized;
    });
  }, [setOrders]);

  useEffect(() => {
    let mounted = true;

    axios
      .get("/api/products/")
      .then((res: AxiosResponse<any[]>) => {
        if (!mounted) {
          return;
        }

        const apiProducts = res.data.map((product: any) => ({
          id: product.slug || String(product.id),
          title: product.title,
          category: (product.category as Product["category"]) || "Textbooks",
          price: Number(product.price),
          description: product.description || "",
          shortDescription:
            product.short_description ||
            product.description?.slice(0, 120) ||
            "",
          badge: product.badge || "",
          course: product.course || undefined,
          format: product.format || "",
          stock: product.inventory || 0,
          rating: product.rating || 4.5,
          pickupNote: product.pickup_note || "",
          deliveryNote: product.delivery_note || "",
          highlights: product.highlights || [],
          coverGradient:
            product.cover_gradient ||
            product.coverGradient ||
            "linear-gradient(135deg,#0f172a 0%, #1d4ed8 55%, #60a5fa 100%)",
        }));

        if (apiProducts.length > 0) {
          setProducts(apiProducts);
        }
      })
      .catch(() => {
        // Keep the local catalog as a fallback when the backend API is unavailable.
      });

    return () => {
      mounted = false;
    };
  }, []);

  const getProduct = (productId: string) =>
    products.find((product) => product.id === productId);

  const cartItems = resolveCartItems(cart, getProduct);
  const wishlistItems = wishlist
    .map((entry) => {
      const product = getProduct(entry.productId);
      if (!product) {
        return null;
      }

      return {
        entry,
        product,
      } satisfies WishlistItemDetail;
    })
    .filter((item): item is WishlistItemDetail => Boolean(item));

  const addToCart = (productId: string, quantity = 1) => {
    const product = getProduct(productId);
    if (!product || quantity <= 0 || product.stock <= 0) {
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        const nextQuantity = Math.min(
          existing.quantity + quantity,
          product.stock,
        );
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: nextQuantity }
            : item,
        );
      }

      const nextQuantity = Math.min(quantity, product.stock);
      if (nextQuantity <= 0) {
        return current;
      }

      return [...current, { productId, quantity: nextQuantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const product = getProduct(productId);
    setCart((current) =>
      current.flatMap((item) => {
        if (item.productId !== productId) {
          return [item];
        }

        const nextQuantity = product
          ? Math.min(quantity, product.stock)
          : quantity;

        if (nextQuantity <= 0) {
          return [];
        }

        return [{ ...item, quantity: nextQuantity }];
      }),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((current) =>
      current.filter((item) => item.productId !== productId),
    );
  };

  const addWishlistEntry = (productId: string) => {
    setWishlist((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current;
      }

      return [
        {
          productId,
          addedAt: new Date().toISOString(),
          priority: "Compare",
        },
        ...current,
      ];
    });
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((current) => {
      const exists = current.some((item) => item.productId === productId);
      if (exists) {
        return current.filter((item) => item.productId !== productId);
      }

      return [
        {
          productId,
          addedAt: new Date().toISOString(),
          priority: "Compare",
        },
        ...current,
      ];
    });
  };

  const updateWishlistPriority = (
    productId: string,
    priority: WishlistPriority,
  ) => {
    setWishlist((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, priority } : item,
      ),
    );
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((current) =>
      current.filter((item) => item.productId !== productId),
    );
  };

  const moveCartToWishlist = (productId: string) => {
    addWishlistEntry(productId);
    removeFromCart(productId);
  };

  const moveWishlistToCart = (productId: string) => {
    const product = getProduct(productId);
    const currentQuantity =
      cart.find((item) => item.productId === productId)?.quantity ?? 0;

    if (!product || product.stock <= currentQuantity) {
      return;
    }

    addToCart(productId, 1);
    removeFromWishlist(productId);
  };

  const moveAllWishlistToCart = () => {
    const nextCart = [...cart];
    const remainingWishlist: WishlistEntry[] = [];

    wishlist.forEach((entry) => {
      const product = getProduct(entry.productId);
      if (!product || product.stock <= 0) {
        remainingWishlist.push(entry);
        return;
      }

      const existing = nextCart.find(
        (item) => item.productId === entry.productId,
      );
      if (existing) {
        if (existing.quantity >= product.stock) {
          remainingWishlist.push(entry);
          return;
        }

        existing.quantity = Math.min(existing.quantity + 1, product.stock);
        return;
      }

      nextCart.push({ productId: entry.productId, quantity: 1 });
    });

    setCart(nextCart);
    setWishlist(remainingWishlist);
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyPromoCode = (code: string) => {
    const offer = findPromoOffer(code);

    if (!offer) {
      return {
        success: false,
        message: "That promo code is not recognized yet.",
      } satisfies PromoCodeResult;
    }

    const pricing = calculatePricing(cartItems, "pickup", offer.code);
    if (offer.minimumSubtotal && pricing.subtotal < offer.minimumSubtotal) {
      return {
        success: false,
        message: `This code activates once the cart reaches at least $${offer.minimumSubtotal.toFixed(2)}.`,
      } satisfies PromoCodeResult;
    }

    setAppliedPromoCode(offer.code);
    return {
      success: true,
      message: `${offer.code} is applied to this cart.`,
    } satisfies PromoCodeResult;
  };

  const clearPromoCode = () => {
    setAppliedPromoCode(null);
  };

  const getPricingSummary = (fulfillment: "pickup" | "delivery") =>
    calculatePricing(cartItems, fulfillment, appliedPromoCode);

  const placeOrder = (payload: CheckoutPayload) => {
    if (cartItems.length === 0) {
      return null;
    }

    const pricing = getPricingSummary(payload.fulfillment);

    const nextOrder: OrderRecord = {
      id: `CB-${Date.now().toString().slice(-6)}`,
      placedAt: new Date().toISOString(),
      status:
        payload.fulfillment === "pickup"
          ? "Confirmed for pickup"
          : "Packing for delivery",
      fulfillment: payload.fulfillment,
      subtotal: pricing.subtotal,
      tax: pricing.tax,
      discount: payload.discount,
      fulfillmentFee: pricing.fulfillmentFee,
      total: pricing.total,
      pickupSlot: payload.pickupSlot,
      deliveryAddress: payload.deliveryAddress,
      deliveryInstructions: payload.deliveryInstructions,
      customer: payload.customer,
      paymentMethod: payload.paymentMethod,
      paymentLabel: payload.paymentLabel,
      promoCode: payload.promoCode,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        title: item.product.title,
        quantity: item.quantity,
        unitPrice: item.product.price,
        category: item.product.category,
      })),
    };

    setOrders((current) => [nextOrder, ...current]);
    setCart([]);
    setAppliedPromoCode(null);
    return nextOrder;
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <StorefrontContext.Provider
      value={{
        products,
        cart,
        wishlist,
        cartItems,
        wishlistItems,
        orders,
        cartCount,
        wishlistCount,
        appliedPromoCode,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        moveCartToWishlist,
        toggleWishlist,
        updateWishlistPriority,
        removeFromWishlist,
        moveWishlistToCart,
        moveAllWishlistToCart,
        clearCart,
        applyPromoCode,
        clearPromoCode,
        getPricingSummary,
        placeOrder,
        getProduct,
      }}
    >
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const context = useContext(StorefrontContext);

  if (!context) {
    throw new Error("useStorefront must be used within StorefrontProvider");
  }

  return context;
}
