import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn().mockRejectedValue(new Error("Catalog API is unavailable in tests.")),
      post: vi.fn((url: string, payload: any) => {
        if (url === "/api/products/orders/checkout/") {
          return Promise.resolve({
            data: {
              id: 101,
              placed_at: "2026-09-15T12:00:00.000Z",
              status: "pending",
              fulfillment_method: payload.fulfillment,
              subtotal: payload.subtotal,
              tax: payload.tax,
              discount: payload.discount,
              fulfillment_fee: payload.fulfillmentFee,
              total: payload.total,
              pickup_slot: payload.pickupSlot,
              delivery_address: payload.deliveryAddress,
              delivery_instructions: payload.deliveryInstructions,
              customer_full_name: payload.customer.fullName,
              customer_email: payload.customer.email,
              customer_phone: payload.customer.phone,
              payment_method: payload.paymentMethod,
              payment_label: payload.paymentLabel,
              promo_code_details: null,
              items: payload.items.map((item: any) => ({
                product: null,
                product_slug: item.productId,
                title: item.title,
                category: item.category,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                line_total: item.unitPrice * item.quantity,
              })),
            },
          });
        }
        return Promise.reject(new Error("Unexpected API request in test."));
      }),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

beforeEach(() => {
  window.sessionStorage.clear();
});
