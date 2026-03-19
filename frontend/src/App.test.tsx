import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("App", () => {
  it("renders the home page by default with the storefront hero", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    expect(
      screen.getByText(/Search, save, cart, and checkout from one McNeese storefront/i)
    ).toBeInTheDocument();
  });

  it("navigates to the search page", () => {
    render(
      <MemoryRouter initialEntries={["/products"]}>
        <App />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("heading", { name: /Browse products/i })
    ).toBeInTheDocument();
  });

  it("navigates to the cart page", () => {
    render(
      <MemoryRouter initialEntries={["/cart"]}>
        <App />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("heading", { name: /Your cart/i })
    ).toBeInTheDocument();
  });

  it("redirects unknown routes to home", () => {
    render(
      <MemoryRouter initialEntries={["/some-random-page"]}>
        <App />
      </MemoryRouter>
    );
    expect(
      screen.getByText(/Search, save, cart, and checkout from one McNeese storefront/i)
    ).toBeInTheDocument();
  });
});
