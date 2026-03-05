import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("App", () => {
  it("renders the home page by default with bookstore branding", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    expect(
      screen.getByText(/Your campus bookstore, online/i)
    ).toBeInTheDocument();
  });

  it("navigates to the login page", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("heading", { name: /Sign in/i })
    ).toBeInTheDocument();
  });

  it("navigates to the register page", () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <App />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("heading", { name: /Create your account/i })
    ).toBeInTheDocument();
  });

  it("redirects unknown routes to home", () => {
    render(
      <MemoryRouter initialEntries={["/some-random-page"]}>
        <App />
      </MemoryRouter>
    );
    expect(
      screen.getByText(/Your campus bookstore, online/i)
    ).toBeInTheDocument();
  });
});
