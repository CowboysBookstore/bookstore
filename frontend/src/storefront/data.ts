import type { OrderRecord, Product } from "./types";

export const storefrontCategories = [
  "All",
  "Textbooks",
  "Office Supplies",
  "Tech Accessories",
  "McNeese Gear",
] as const;

export const storefrontProducts: Product[] = [
  {
    id: "eng-101-writing-handbook",
    title: "ENG 101 Writing Handbook",
    category: "Textbooks",
    price: 64.99,
    description:
      "A course-ready writing handbook with grammar refreshers, essay templates, and annotated examples for first-year composition.",
    shortDescription: "Required handbook for composition students.",
    badge: "Required",
    course: "ENG 101",
    format: "Paperback",
    stock: 32,
    rating: 4.8,
    pickupNote: "Ready for same-day campus pickup",
    deliveryNote: "Delivers in 2 business days",
    highlights: ["Course-aligned chapters", "Citation quick guides", "Practice prompts"],
    coverGradient: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #60a5fa 100%)",
  },
  {
    id: "math-231-calculus-pack",
    title: "MATH 231 Calculus Problem Pack",
    category: "Textbooks",
    price: 88.5,
    description:
      "A bundled calculus workbook with worked examples, review quizzes, and reference sheets built for STEM majors.",
    shortDescription: "Workbook bundle for Calculus I study sessions.",
    badge: "Best Seller",
    course: "MATH 231",
    format: "Workbook bundle",
    stock: 18,
    rating: 4.6,
    pickupNote: "Pickup available after 10 AM",
    deliveryNote: "Ships with tracking this week",
    highlights: ["Solved practice sets", "Formula cards included", "Exam prep checkpoints"],
    coverGradient: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 45%, #facc15 100%)",
  },
  {
    id: "bio-214-lab-kit",
    title: "BIO 214 Lab Kit",
    category: "Office Supplies",
    price: 39.25,
    description:
      "A lab-ready essentials kit with graph paper, fine-tip markers, gloves, and notebook inserts for biology sections.",
    shortDescription: "Grab-and-go kit for biology lab sections.",
    badge: "Lab Ready",
    course: "BIO 214",
    format: "Kit",
    stock: 41,
    rating: 4.7,
    pickupNote: "Available for front-counter pickup",
    deliveryNote: "Delivery estimate: 3 business days",
    highlights: ["Packed for lab day", "Fits standard lockers", "Color-coded inserts"],
    coverGradient: "linear-gradient(135deg, #0f766e 0%, #14b8a6 60%, #99f6e4 100%)",
  },
  {
    id: "cowboy-study-planner",
    title: "Cowboy Semester Planner",
    category: "Office Supplies",
    price: 18.75,
    description:
      "A McNeese-branded planner with class schedule blocks, assignment trackers, and weekly goals for busy semesters.",
    shortDescription: "Semester planner with class and assignment views.",
    badge: "Student Pick",
    format: "Spiral planner",
    stock: 67,
    rating: 4.9,
    pickupNote: "Pickup ready in 1 hour",
    deliveryNote: "Eligible for low-cost delivery",
    highlights: ["Monthly overview pages", "Exam countdown tracker", "Durable gold tabs"],
    coverGradient: "linear-gradient(135deg, #7c2d12 0%, #f59e0b 50%, #fef3c7 100%)",
  },
  {
    id: "graphing-calculator-pro",
    title: "Graphing Calculator Pro",
    category: "Tech Accessories",
    price: 129.0,
    description:
      "A programmable calculator with graphing support, reusable memory storage, and exam-mode controls for classroom use.",
    shortDescription: "Graphing calculator approved for most math courses.",
    badge: "Top Rated",
    course: "MATH / PHYS",
    format: "Device",
    stock: 12,
    rating: 4.9,
    pickupNote: "Reserve today and pick up tomorrow",
    deliveryNote: "Priority delivery available",
    highlights: ["Color graph display", "Rechargeable battery", "Exam-safe settings"],
    coverGradient: "linear-gradient(135deg, #111827 0%, #374151 55%, #9ca3af 100%)",
  },
  {
    id: "laptop-sleeve-14",
    title: "14-inch Laptop Sleeve",
    category: "Tech Accessories",
    price: 27.99,
    description:
      "A padded sleeve for daily campus travel with weather-resistant fabric, accessory pocket, and easy-carry handle.",
    shortDescription: "Protective sleeve for everyday campus carry.",
    badge: "New Arrival",
    format: "Accessory",
    stock: 29,
    rating: 4.5,
    pickupNote: "Pickup available this afternoon",
    deliveryNote: "Delivery estimate: 2-4 business days",
    highlights: ["Water-resistant shell", "Accessory pouch", "Lightweight fit"],
    coverGradient: "linear-gradient(135deg, #1f2937 0%, #3b82f6 50%, #dbeafe 100%)",
  },
  {
    id: "cowboy-hoodie-navy",
    title: "Cowboy Hoodie - Navy",
    category: "McNeese Gear",
    price: 54.0,
    description:
      "A soft heavyweight hoodie with embroidered Cowboy Bookstore graphics and a relaxed campus fit.",
    shortDescription: "Classic navy hoodie with bookstore branding.",
    badge: "Campus Favorite",
    format: "Apparel",
    stock: 22,
    rating: 4.8,
    pickupNote: "Pickup stocked in most sizes",
    deliveryNote: "Delivery estimate: 4 business days",
    highlights: ["Midweight fleece", "Embroidered crest", "Unisex fit"],
    coverGradient: "linear-gradient(135deg, #172554 0%, #1d4ed8 55%, #bfdbfe 100%)",
  },
  {
    id: "mcneese-tumbler-gold",
    title: "McNeese Tumbler - Gold",
    category: "McNeese Gear",
    price: 24.5,
    description:
      "A double-wall insulated tumbler built for long classes, library sessions, and early-morning walks across campus.",
    shortDescription: "Insulated tumbler with gold bookstore finish.",
    badge: "Giftable",
    format: "Drinkware",
    stock: 35,
    rating: 4.7,
    pickupNote: "Pickup available near register one",
    deliveryNote: "Ships in recyclable packaging",
    highlights: ["Hot or cold insulation", "Spill-resistant lid", "Laser-etched logo"],
    coverGradient: "linear-gradient(135deg, #713f12 0%, #eab308 50%, #fef9c3 100%)",
  },
];

export const seededOrders: OrderRecord[] = [
  {
    id: "CB-20418",
    placedAt: "2026-03-09T15:00:00.000Z",
    status: "Ready for pickup",
    fulfillment: "pickup",
    subtotal: 83.74,
    tax: 7.33,
    fulfillmentFee: 0,
    total: 91.07,
    pickupSlot: "March 10, 1:00 PM - 3:00 PM",
    items: [
      {
        productId: "cowboy-study-planner",
        title: "Cowboy Semester Planner",
        quantity: 1,
        unitPrice: 18.75,
      },
      {
        productId: "eng-101-writing-handbook",
        title: "ENG 101 Writing Handbook",
        quantity: 1,
        unitPrice: 64.99,
      },
    ],
  },
];

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
