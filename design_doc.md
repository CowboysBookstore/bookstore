# Cowboy Online Bookstore — System Design

**Team:** Chiamaka Onwude, Wilfred Robert-Fajimi, Pacifique Sandrin Muramutsa, Fidel Anyanwu

---

## 1. High-Level System Architecture

```mermaid
graph TB
subgraph Client["Frontend (React + TypeScript + Tailwind)"]
Browser["User's Browser"]
ReactApp["React SPA (Vite)"]
end

subgraph Server["Backend (Python + Django + DRF)"]
Django["Django REST Framework"]
AuthModule["accounts app"]
ProductModule["products app (planned)"]
CartModule["cart app (planned)"]
OrderModule["orders app (planned)"]
end

subgraph External["External Services"]
SMTP["Gmail SMTP"]
Stripe["Stripe API (planned)"]
end

subgraph Data["Database"]
DB["MySQL (prod) / SQLite (dev)"]
end

subgraph Infra["Infrastructure"]
Docker["Docker"]
GHA["GitHub Actions CI/CD"]
GCloud["Google Cloud (planned)"]
Terraform["Terraform (planned)"]
end

Browser -->|HTTPS| ReactApp
ReactApp -->|REST API + JWT| Django
Django --> AuthModule
Django --> ProductModule
Django --> CartModule
Django --> OrderModule
AuthModule -->|Send codes| SMTP
OrderModule -.->|Payment| Stripe
Django --> DB
Docker -.->|Containerize| Server
Docker -.->|Containerize| Data
GHA -->|Lint + Test| Server
GHA -->|Lint + Test| Client
GCloud -.->|Host| Server
Terraform -.->|Provision| GCloud
```

---

## 2. User Flow — Full System

```mermaid
flowchart TD
Start([User visits site]) --> HasAccount{Has account?}

HasAccount -->|No| Register[Register page]
Register --> EnterInfo[Enter first name, last name,\nMcNeese email, password]
EnterInfo --> ValidateEmail{Email ends\nwith @mcneese.edu?}
ValidateEmail -->|No| ShowError[Show error:\ninvalid email domain]
ShowError --> Register
ValidateEmail -->|Yes| CreateUser[Create inactive user\n+ generate 6-digit code]
CreateUser --> SendCode[Send verification code\nvia email - valid 24hrs]
SendCode --> VerifyPage[Verification page]
VerifyPage --> EnterCode[Enter 6-digit code]
EnterCode --> ValidCode{Code valid\nand not expired?}
ValidCode -->|No| CodeError[Show error]
CodeError --> VerifyPage
ValidCode -->|Yes| ActivateUser[Activate account]
ActivateUser --> LoginPage

HasAccount -->|Yes| LoginPage[Login page]
LoginPage --> EnterCreds[Enter email + password]
EnterCreds --> AuthCheck{Credentials valid\n+ account active?}
AuthCheck -->|No| LoginError[Show error message]
LoginError --> LoginPage
AuthCheck -->|Yes| IssueJWT[Issue JWT access\n+ refresh tokens]
IssueJWT --> HomePage[Home page]

LoginPage --> ForgotPW[Forgot password?]
ForgotPW --> EnterEmail[Enter McNeese email]
EnterEmail --> SendReset[Send 6-digit reset\ncode via email]
SendReset --> ResetVerify[Reset verification page]
ResetVerify --> EnterResetCode[Enter code + new password]
EnterResetCode --> ResetValid{Code valid?}
ResetValid -->|No| ResetError[Show error]
ResetError --> ResetVerify
ResetValid -->|Yes| UpdatePW[Update password]
UpdatePW --> LoginPage

HomePage --> Browse[Browse & search products]
Browse --> Filter[Filter by price, category,\ntitle, pages]
Filter --> ViewProduct[View product details]
ViewProduct --> AddCart[Add to cart]
ViewProduct --> AddWish[Add to wishlist]
AddWish --> WishList[Wishlist page]
WishList --> MoveToCart[Move to cart\none-by-one or all]
WishList --> RemoveWish[Remove from wishlist]
AddCart --> Cart[Cart page]
MoveToCart --> Cart
Cart --> RemoveItem[Remove items]
Cart --> Checkout[Checkout]
Checkout --> PickupTime[Choose pickup time\n9 AM – 5 PM]
PickupTime --> ShippingAddr[Shipping address]
ShippingAddr --> Payment[Payment via Stripe\ncard only]
Payment --> Tax[Calculate tax + total]
Tax --> Confirm[Order confirmation]

HomePage --> SignOut[Sign out]
SignOut --> LoginPage
```

---

## 3. Data Model — Entity Relationship Diagram

```mermaid
erDiagram
USER {
int id PK
string email UK
string first_name
string last_name
string password
boolean is_active
boolean is_staff
datetime date_joined
}

ACTIVATION_CODE {
int id PK
int user_id FK
string code
datetime expires_at
boolean used
datetime created_at
}

PASSWORD_RESET_CODE {
int id PK
int user_id FK
string code
datetime expires_at
boolean used
datetime created_at
}

PRODUCT {
int id PK
string title
string description
decimal price
string category
string image_url
int stock
int pages
boolean is_active
datetime created_at
}

WISHLIST_ITEM {
int id PK
int user_id FK
int product_id FK
datetime added_at
}

CART_ITEM {
int id PK
int user_id FK
int product_id FK
int quantity
datetime added_at
}

ORDER {
int id PK
int user_id FK
string status
string shipping_address
string pickup_time
decimal subtotal
decimal tax
decimal total
string stripe_payment_id
datetime created_at
}

ORDER_ITEM {
int id PK
int order_id FK
int product_id FK
int quantity
decimal unit_price
}

USER ||--o{ ACTIVATION_CODE : "has"
USER ||--o{ PASSWORD_RESET_CODE : "has"
USER ||--o{ WISHLIST_ITEM : "has"
USER ||--o{ CART_ITEM : "has"
USER ||--o{ ORDER : "places"
PRODUCT ||--o{ WISHLIST_ITEM : "in"
PRODUCT ||--o{ CART_ITEM : "in"
PRODUCT ||--o{ ORDER_ITEM : "in"
ORDER ||--|{ ORDER_ITEM : "contains"
```

> Full SQL DDL with indexes and constraints: [`docs/schema.sql`](docs/schema.sql)

---

## 4. API Endpoints

```mermaid
graph LR
subgraph Auth["Authentication (implemented)"]
R["POST /api/auth/register/"]
V["POST /api/auth/verify/"]
L["POST /api/auth/login/"]
FP["POST /api/auth/forgot-password/"]
RP["POST /api/auth/reset-password/"]
end

subgraph Products["Products (planned)"]
PL["GET /api/products/"]
PD["GET /api/products/:id/"]
PC["POST /api/products/ (admin)"]
PU["PUT /api/products/:id/ (admin)"]
PDel["DELETE /api/products/:id/ (admin)"]
end

subgraph Wishlist["Wishlist (planned)"]
WL["GET /api/wishlist/"]
WA["POST /api/wishlist/"]
WR["DELETE /api/wishlist/:id/"]
end

subgraph Cart["Cart (planned)"]
CL["GET /api/cart/"]
CA["POST /api/cart/"]
CU["PATCH /api/cart/:id/"]
CR["DELETE /api/cart/:id/"]
end

subgraph Orders["Orders (planned)"]
OC["POST /api/orders/checkout/"]
OL["GET /api/orders/"]
OD["GET /api/orders/:id/"]
end
```

---

## 5. Frontend Page Map

```mermaid
graph TD
subgraph Public["Public Pages"]
Login["/login — Login Page"]
Register["/register — Register Page"]
Verify["/verify — Verification Page"]
Forgot["/forgot-password — Forgot Password"]
Reset["/reset-password — Reset Password"]
end

subgraph Authenticated["Authenticated Pages"]
Home["/ — Home Page"]
ProductList["/products — Browse (planned)"]
ProductDetail["/products/:id — Detail (planned)"]
WishlistPage["/wishlist — Wishlist (planned)"]
CartPage["/cart — Cart (planned)"]
CheckoutPage["/checkout — Checkout (planned)"]
OrdersPage["/orders — Order History (planned)"]
end

subgraph Admin["Admin Panel"]
AdminDash["/admin — Django Admin Dashboard"]
ManageUsers["/admin/accounts/user/"]
ManageCodes["/admin/accounts/activationcode/"]
ManageProducts["/admin/products/ (planned)"]
ManageOrders["/admin/orders/ (planned)"]
end

Login -->|Success| Home
Register -->|Created| Verify
Verify -->|Activated| Login
Forgot --> Reset
Reset -->|Done| Login

Home --> ProductList
ProductList --> ProductDetail
ProductDetail --> CartPage
ProductDetail --> WishlistPage
WishlistPage --> CartPage
CartPage --> CheckoutPage
CheckoutPage --> OrdersPage
```

---

## 6. Infrastructure Overview

```mermaid
graph TB
subgraph Dev["Local Development"]
DevFE["npm run dev (port 5173)"]
DevBE["python manage.py runserver (port 8000)"]
SQLite["SQLite"]
DevFE <-->|CORS| DevBE
DevBE --> SQLite
end

subgraph Prod["Production (Planned)"]
LB["Load Balancer"]
FEContainer["Frontend Container (Nginx + React build)"]
BEContainer["Backend Container (Gunicorn + Django)"]
MySQL["MySQL"]
LB --> FEContainer
LB --> BEContainer
BEContainer --> MySQL
end

subgraph Services["External Services"]
Gmail["Gmail SMTP"]
StripeS["Stripe API"]
end

DevBE --> Gmail
BEContainer --> Gmail
BEContainer --> StripeS
```

---

## 7. Technology Stack Summary

| Component | Technology | Status |
| ---------------- | --------------------------- | ------------ |
| Backend | Python 3.11, Django 4.2 | Implemented |
| REST API | Django REST Framework | Implemented |
| Auth tokens | PyJWT (HS256) | Implemented |
| Frontend | React 18, TypeScript, Vite | Implemented |
| Styling | Tailwind CSS | Implemented |
| Database (dev) | SQLite | Implemented |
| Database (prod) | MySQL | Planned |
| Email | Gmail SMTP (HTML emails) | Implemented |
| Admin panel | Django Admin + Unfold theme | Implemented |
| CI/CD | GitHub Actions | Implemented |
| Payments | Stripe API | Planned |
| Containerization | Docker | Planned |
| Hosting | Google Cloud | Planned |
| IaC | Terraform | Planned |
