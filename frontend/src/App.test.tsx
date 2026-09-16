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
        name: /Everything you need, without the campus runaround/i,
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
      screen.getByRole("heading", { name: /Find what you need/i }),
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

  it("places an order from checkout when the cart has items", async () => {
    window.sessionStorage.setItem(
      "bookstore.cart",
      JSON.stringify([{ productId: "eng-101-writing-handbook", quantity: 1 }]),
    );

    render(
      <MemoryRouter initialEntries={["/checkout"]}>
        <App />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByRole("textbox", { name: /Full name/i }), {
      target: { value: "Pat Rider" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /^Email$/i }), {
      target: { value: "pat@mcneese.edu" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /^Phone$/i }), {
      target: { value: "3375550100" },
    });
    fireEvent.click(screen.getByLabelText(/I reviewed the order details/i));
    fireEvent.click(screen.getByRole("button", { name: /Send order request/i }));

    expect(await screen.findByText(/Request received/i)).toBeInTheDocument();
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
      screen.getByLabelText(/I reviewed the order details/i),
    );
    fireEvent.click(screen.getByRole("button", { name: /Send order request/i }));

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
        name: /Everything you need, without the campus runaround/i,
      }),
    ).toBeInTheDocument();
  });
});
