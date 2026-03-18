import React, { createContext, useContext, useEffect, useState } from "react";
import { seededOrders, storefrontProducts } from "./data";
import type {
  CartLine,
  FulfillmentMethod,
  OrderLine,
  OrderRecord,
  Product,
} from "./types";

const CART_KEY = "bookstore.cart";
const WISHLIST_KEY = "bookstore.wishlist";
const ORDERS_KEY = "bookstore.orders";

interface CheckoutPayload {
  fulfillment: FulfillmentMethod;
  pickupSlot?: string;
  deliveryAddress?: string;
}

interface StorefrontContextValue {
  products: Product[];
  cart: CartLine[];
  wishlist: string[];
  orders: OrderRecord[];
  cartCount: number;
  wishlistCount: number;
  addToCart: (productId: string, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  moveWishlistToCart: (productId: string) => void;
  moveAllWishlistToCart: () => void;
  clearCart: () => void;
  placeOrder: (payload: CheckoutPayload) => OrderRecord | null;
  getProduct: (productId: string) => Product | undefined;
}

const StorefrontContext = createContext<StorefrontContextValue | undefined>(
  undefined
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

export function StorefrontProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useStoredState<CartLine[]>(CART_KEY, []);
  const [wishlist, setWishlist] = useStoredState<string[]>(WISHLIST_KEY, []);
  const [orders, setOrders] = useStoredState<OrderRecord[]>(ORDERS_KEY, seededOrders);

  const addToCart = (productId: string, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...current, { productId, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart((current) =>
      current.flatMap((item) => {
        if (item.productId !== productId) {
          return [item];
        }

        if (quantity <= 0) {
          return [];
        }

        return [{ ...item, quantity }];
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((item) => item !== productId)
        : [...current, productId]
    );
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((current) => current.filter((item) => item !== productId));
  };

  const moveWishlistToCart = (productId: string) => {
    addToCart(productId, 1);
    removeFromWishlist(productId);
  };

  const moveAllWishlistToCart = () => {
    setCart((current) => {
      const next = [...current];

      wishlist.forEach((productId) => {
        const existing = next.find((item) => item.productId === productId);
        if (existing) {
          existing.quantity += 1;
        } else {
          next.push({ productId, quantity: 1 });
        }
      });

      return next;
    });
    setWishlist([]);
  };

  const clearCart = () => {
    setCart([]);
  };

  const getProduct = (productId: string) =>
    storefrontProducts.find((product) => product.id === productId);

  const placeOrder = (payload: CheckoutPayload) => {
    const orderItems: OrderLine[] = cart.flatMap((line) => {
      const product = getProduct(line.productId);
      if (!product) {
        return [];
      }

      return [
        {
          productId: line.productId,
          title: product.title,
          quantity: line.quantity,
          unitPrice: product.price,
        },
      ];
    });

    if (orderItems.length === 0) {
      return null;
    }

    const subtotal = Number(
      orderItems
        .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
        .toFixed(2)
    );
    const tax = Number((subtotal * 0.0875).toFixed(2));
    const fulfillmentFee =
      payload.fulfillment === "delivery" ? Number((6.95).toFixed(2)) : 0;
    const total = Number((subtotal + tax + fulfillmentFee).toFixed(2));

    const nextOrder: OrderRecord = {
      id: `CB-${Date.now().toString().slice(-6)}`,
      placedAt: new Date().toISOString(),
      status:
        payload.fulfillment === "pickup"
          ? "Processing for pickup"
          : "Preparing shipment",
      fulfillment: payload.fulfillment,
      subtotal,
      tax,
      fulfillmentFee,
      total,
      pickupSlot: payload.pickupSlot,
      deliveryAddress: payload.deliveryAddress,
      items: orderItems,
    };

    setOrders((current) => [nextOrder, ...current]);
    setCart([]);
    return nextOrder;
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <StorefrontContext.Provider
      value={{
        products: storefrontProducts,
        cart,
        wishlist,
        orders,
        cartCount,
        wishlistCount,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        toggleWishlist,
        removeFromWishlist,
        moveWishlistToCart,
        moveAllWishlistToCart,
        clearCart,
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
