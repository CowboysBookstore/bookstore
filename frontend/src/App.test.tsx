import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the home page by default with the storefront hero", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", {
        name: /Course materials, ready to order/i,
      }),
    ).toBeInTheDocument();
  });

  it("navigates to the search page", () => {
    render(
      <MemoryRouter initialEntries={["/products"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /Browse products/i }),
    ).toBeInTheDocument();
  });

  it("navigates to the cart page", () => {
    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /Review the bag before checkout/i }),
    ).toBeInTheDocument();
  });

  it("places an order from checkout when the cart has items", () => {
    window.sessionStorage.setItem(
      "bookstore.cart",
      JSON.stringify([{ productId: "eng-101-writing-handbook", quantity: 1 }]),
    );

    render(
      <MemoryRouter initialEntries={["/checkout"]}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByLabelText(/I reviewed the checkout details/i));
    fireEvent.click(screen.getByRole("button", { name: /Place order/i }));

    expect(screen.getByText(/Order placed successfully/i)).toBeInTheDocument();
  });

  it("requires a delivery address before placing a delivery order", () => {
    window.sessionStorage.setItem(
      "bookstore.cart",
      JSON.stringify([{ productId: "eng-101-writing-handbook", quantity: 1 }]),
    );

    render(
      <MemoryRouter initialEntries={["/checkout"]}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /^Delivery\b/i }));
    fireEvent.click(
      screen.getByLabelText(/I reviewed the checkout details and authorize/i),
    );
    fireEvent.click(screen.getByRole("button", { name: /Place order/i }));

    expect(
      screen.getByText(/Enter a delivery address to continue/i),
    ).toBeInTheDocument();
  });

  it("redirects unknown routes to home", () => {
    render(
      <MemoryRouter initialEntries={["/some-random-page"]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", {
        name: /Course materials, ready to order/i,
      }),
    ).toBeInTheDocument();
  });
});
