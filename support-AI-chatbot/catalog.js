// The store's product database. Edit this list to change what the store sells.
// stock: 0 means out of stock (the bot will never recommend it).
window.CATALOG = [
  {
    "id": "P001",
    "brand": "Apple",
    "name": "MacBook Air 13\" (M3, 8GB RAM, 256GB)",
    "cat": "Laptops",
    "price": 1599,
    "stock": 6,
    "desc": "Light, silent, all-day battery; great for study and everyday work."
  },
  {
    "id": "P002",
    "brand": "Lenovo",
    "name": "IdeaPad Slim 5 14\" (Ryzen 7, 16GB, 512GB)",
    "cat": "Laptops",
    "price": 1099,
    "stock": 9,
    "desc": "Strong all-rounder with plenty of memory for multitasking and light photo editing."
  },
  {
    "id": "P003",
    "brand": "ASUS",
    "name": "Vivobook 15 (Core i5, 16GB, 512GB)",
    "cat": "Laptops",
    "price": 849,
    "stock": 12,
    "desc": "Big 15.6\" screen and good value for browsing, documents and streaming."
  },
  {
    "id": "P004",
    "brand": "Microsoft",
    "name": "Surface Laptop Go 3 (Core i5, 8GB, 256GB)",
    "cat": "Laptops",
    "price": 999,
    "stock": 0,
    "desc": "Compact 12.4\" touchscreen laptop."
  },
  {
    "id": "P005",
    "brand": "Sony",
    "name": "WH-1000XM5 Wireless Noise Cancelling Headphones",
    "cat": "Audio",
    "price": 549,
    "stock": 8,
    "desc": "Class-leading noise cancelling and comfort for flights and offices; 30-hour battery."
  },
  {
    "id": "P006",
    "brand": "Apple",
    "name": "AirPods Pro (2nd generation, USB-C)",
    "cat": "Audio",
    "price": 399,
    "stock": 15,
    "desc": "Small earbuds with strong noise cancelling; best with iPhone."
  },
  {
    "id": "P007",
    "brand": "JBL",
    "name": "Tune 520BT Wireless On-Ear Headphones",
    "cat": "Audio",
    "price": 79,
    "stock": 25,
    "desc": "Budget wireless headphones, light and simple; no noise cancelling."
  },
  {
    "id": "P008",
    "brand": "JBL",
    "name": "Flip 6 Portable Bluetooth Speaker",
    "cat": "Audio",
    "price": 149,
    "stock": 16,
    "desc": "Waterproof (IP67) speaker with big sound for its size; 12-hour battery."
  },
  {
    "id": "P009",
    "brand": "Apple",
    "name": "iPad (10th generation, 64GB, Wi-Fi)",
    "cat": "Tablets",
    "price": 599,
    "stock": 7,
    "desc": "10.9\" tablet for study, notes and streaming; works with Apple Pencil (USB-C)."
  },
  {
    "id": "P010",
    "brand": "Samsung",
    "name": "Galaxy Tab A9+ (64GB, Wi-Fi)",
    "cat": "Tablets",
    "price": 349,
    "stock": 10,
    "desc": "Affordable 11\" Android tablet, good for video and kids."
  },
  {
    "id": "P011",
    "brand": "Dyson",
    "name": "V8 Origin Cordless Stick Vacuum",
    "cat": "Home appliances",
    "price": 599,
    "stock": 4,
    "desc": "Lightweight cordless vacuum, good for apartments and pet hair; about 40 minutes run time."
  },
  {
    "id": "P012",
    "brand": "iRobot",
    "name": "Roomba Combo i5 Robot Vacuum and Mop",
    "cat": "Home appliances",
    "price": 699,
    "stock": 3,
    "desc": "Robot that vacuums and mops hard floors on a schedule; app controlled."
  },
  {
    "id": "P013",
    "brand": "Ninja",
    "name": "Air Fryer Pro AF140 (4.7L)",
    "cat": "Kitchen",
    "price": 199,
    "stock": 14,
    "desc": "Fast, crispy cooking for 2 to 4 people; easy-clean basket."
  },
  {
    "id": "P014",
    "brand": "Breville",
    "name": "the Barista Express Espresso Machine",
    "cat": "Kitchen",
    "price": 899,
    "stock": 5,
    "desc": "Built-in grinder for cafe-style espresso and milk drinks at home; some learning needed."
  },
  {
    "id": "P015",
    "brand": "Nespresso",
    "name": "Vertuo Pop Coffee Machine",
    "cat": "Kitchen",
    "price": 199,
    "stock": 11,
    "desc": "One-touch pod coffee; no skill needed, small footprint."
  },
  {
    "id": "P016",
    "brand": "Breville",
    "name": "the Soft Top Pure Kettle (1.7L)",
    "cat": "Kitchen",
    "price": 99,
    "stock": 20,
    "desc": "Quiet-boil kettle with soft-opening lid."
  },
  {
    "id": "P017",
    "brand": "Philips",
    "name": "Sonicare ProtectiveClean 4300 Electric Toothbrush",
    "cat": "Personal care",
    "price": 129,
    "stock": 18,
    "desc": "Sonic toothbrush with pressure sensor; good for sensitive gums."
  },
  {
    "id": "P018",
    "brand": "Oral-B",
    "name": "iO Series 5 Electric Toothbrush",
    "cat": "Personal care",
    "price": 249,
    "stock": 6,
    "desc": "Round-head magnetic toothbrush with smart pressure sensor and app."
  },
  {
    "id": "P019",
    "brand": "Dyson",
    "name": "Supersonic Hair Dryer",
    "cat": "Personal care",
    "price": 699,
    "stock": 2,
    "desc": "Fast, quiet drying with heat control to protect hair."
  },
  {
    "id": "P020",
    "brand": "Garmin",
    "name": "Forerunner 165 GPS Running Watch",
    "cat": "Fitness & outdoor",
    "price": 459,
    "stock": 5,
    "desc": "Bright AMOLED screen, GPS, training plans; up to 11 days battery."
  },
  {
    "id": "P021",
    "brand": "Hydro Flask",
    "name": "32 oz Wide Mouth Insulated Bottle",
    "cat": "Fitness & outdoor",
    "price": 69,
    "stock": 30,
    "desc": "Keeps drinks cold for 24 hours; durable for hiking and gym."
  },
  {
    "id": "P022",
    "brand": "Osprey",
    "name": "Talon 22 Daypack",
    "cat": "Fitness & outdoor",
    "price": 199,
    "stock": 6,
    "desc": "Comfortable, ventilated 22L hiking pack with hydration sleeve."
  },
  {
    "id": "P023",
    "brand": "Google",
    "name": "Nest Mini (2nd generation) Smart Speaker",
    "cat": "Smart home",
    "price": 49,
    "stock": 20,
    "desc": "Small voice-assistant speaker for music, timers and smart home control."
  },
  {
    "id": "P024",
    "brand": "TP-Link",
    "name": "Tapo C200 Pan/Tilt Indoor Security Camera",
    "cat": "Smart home",
    "price": 49,
    "stock": 22,
    "desc": "1080p indoor camera with 360-degree view, night vision and phone alerts."
  }
];
