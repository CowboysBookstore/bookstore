import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StorefrontProvider, useStorefront } from "./StorefrontContext";

function Harness() {
  const { cart, wishlist, orders, moveWishlistToCart, moveAllWishlistToCart } =
    useStorefront();

  return (
    <div>
      <div data-testid="cart">{JSON.stringify(cart)}</div>
      <div data-testid="wishlist">{JSON.stringify(wishlist)}</div>
      <div data-testid="orders">{orders.length}</div>
      <button
        type="button"
        onClick={() => moveWishlistToCart("eng-101-writing-handbook")}
      >
        Move single item
      </button>
      <button type="button" onClick={moveAllWishlistToCart}>
        Move all items
      </button>
    </div>
  );
}

function renderStorefront() {
  return render(
    <StorefrontProvider>
      <Harness />
    </StorefrontProvider>,
  );
}

describe("StorefrontProvider", () => {
  it("keeps a wishlist item in place when the cart is already at the stock limit", () => {
    window.sessionStorage.setItem(
      "bookstore.cart",
      JSON.stringify([{ productId: "eng-101-writing-handbook", quantity: 32 }]),
    );
    window.sessionStorage.setItem(
      "bookstore.wishlist",
      JSON.stringify([
        {
          productId: "eng-101-writing-handbook",
          addedAt: "2026-04-01T10:00:00.000Z",
          priority: "Need soon",
        },
      ]),
    );

    renderStorefront();
    fireEvent.click(screen.getByRole("button", { name: /Move single item/i }));

    expect(screen.getByTestId("cart")).toHaveTextContent(
      '"productId":"eng-101-writing-handbook","quantity":32',
    );
    expect(screen.getByTestId("wishlist")).toHaveTextContent(
      '"productId":"eng-101-writing-handbook"',
    );
  });

  it("moves only the wishlist items that still fit in the cart", () => {
    window.sessionStorage.setItem(
      "bookstore.cart",
      JSON.stringify([{ productId: "eng-101-writing-handbook", quantity: 32 }]),
    );
    window.sessionStorage.setItem(
      "bookstore.wishlist",
      JSON.stringify([
        {
          productId: "eng-101-writing-handbook",
          addedAt: "2026-04-01T10:00:00.000Z",
          priority: "Need soon",
        },
        {
          productId: "bio-214-lab-kit",
          addedAt: "2026-04-01T10:05:00.000Z",
          priority: "Compare",
        },
      ]),
    );

    renderStorefront();
    fireEvent.click(screen.getByRole("button", { name: /Move all items/i }));

    expect(screen.getByTestId("cart")).toHaveTextContent(
      '"productId":"eng-101-writing-handbook","quantity":32',
    );
    expect(screen.getByTestId("cart")).toHaveTextContent(
      '"productId":"bio-214-lab-kit","quantity":1',
    );
    expect(screen.getByTestId("wishlist")).toHaveTextContent(
      '"productId":"eng-101-writing-handbook"',
    );
    expect(screen.getByTestId("wishlist")).not.toHaveTextContent(
      '"productId":"bio-214-lab-kit"',
    );
  });

  it("filters retired seeded orders from session storage", () => {
    window.sessionStorage.setItem(
      "bookstore.orders",
      JSON.stringify([
        {
          id: "CB-20418",
          placedAt: "2026-03-09T15:00:00.000Z",
          status: "Ready for pickup",
          fulfillment: "pickup",
          subtotal: 83.74,
          tax: 7.33,
          discount: 5,
          fulfillmentFee: 0,
          total: 91.07,
          pickupSlot: "Apr 3, 11:00 AM - 1:00 PM",
          customer: {
            fullName: "Jordan Wells",
            email: "student@mcneese.edu",
            phone: "(337) 555-0144",
          },
          paymentMethod: "card",
          paymentLabel: "Visa ending in 4242",
          promoCode: "WELCOME5",
          items: [
            {
              productId: "eng-101-writing-handbook",
              title: "ENG 101 Writing Handbook",
              quantity: 1,
              unitPrice: 64.99,
              category: "Textbooks",
            },
          ],
        },
      ]),
    );

    renderStorefront();

    expect(screen.getByTestId("orders")).toHaveTextContent("0");
  });
});
