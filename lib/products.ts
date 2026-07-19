// Real ZombiesCat catalog — English-only product copy (per brand request).
// Images: official photos scraped from zombiescat.com + JD flagship-store shots
// (Chinese text areas cropped out). USD prices are PLACEHOLDERS, admin-adjustable.

export interface Product {
  slug: string;
  name: string; // English-only
  desc: string; // English-only
  category: "apparel" | "toys" | "electronics" | "accessories" | "lifestyle";
  priceUsdCents: number;
  accent: string;
  image: string; // /products/*.jpg (official photo)
  art: string; // emoji fallback if image missing
  sort: number;
}

export const CATEGORIES = ["all", "apparel", "toys", "electronics", "accessories", "lifestyle"] as const;
export type Category = (typeof CATEGORIES)[number];

const RED = "#ee1d2b";
const CRIMSON = "#c00d1e";
const PINK = "#ff5a7a";

export const PRODUCTS: Product[] = [
  // ---------------- Electronics ----------------
  {
    slug: "jd-gold-anc",
    name: "Gold Crest ANC Headphones",
    desc: "Flagship over-ear ANC headphones in black & gold, with the engraved ZombiesCat crest on each cup. Devour the noise, keep the music.",
    category: "electronics", priceUsdCents: 12900, accent: RED,
    image: "/products/jd-gold-anc.jpg", art: "🎧", sort: 1,
  },
  {
    slug: "jd-mecha-tws",
    name: "Mecha Pod TWS Earbuds",
    desc: "True-wireless earbuds in an armored mecha charging pod — cyan light strips, ZC66 engraving, all-day battery.",
    category: "electronics", priceUsdCents: 6900, accent: CRIMSON,
    image: "/products/jd-mecha-tws.jpg", art: "🎧", sort: 2,
  },
  {
    slug: "jd-screen-tws",
    name: "Interactive Screen Earbuds",
    desc: "Cat-ear charging pod with an interactive color screen — your pocket DJ devil plays animations while you play music.",
    category: "electronics", priceUsdCents: 7900, accent: RED,
    image: "/products/jd-screen-tws.jpg", art: "📺", sort: 3,
  },
  {
    slug: "jd-led-tws",
    name: "LED Display TWS Earbuds",
    desc: "Digital battery display on the pod, deep noise reduction, three colorways — white, graphite and tiger orange.",
    category: "electronics", priceUsdCents: 4900, accent: PINK,
    image: "/products/jd-led-tws.jpg", art: "🎧", sort: 4,
  },
  {
    slug: "jd-b23-clip",
    name: "B23 Clip-On Earbuds",
    desc: "Open-ear clip design in sticker-bomb camo — the B23 stays on through every skate bail.",
    category: "electronics", priceUsdCents: 5900, accent: RED,
    image: "/products/jd-b23-clip.jpg", art: "🎧", sort: 5,
  },
  {
    slug: "cola-powerbank",
    name: "Little Cola Power Bank",
    desc: "The negativity-sipping pocket guardian — a cola-bottle power bank that keeps your phone alive while the devil-cat drinks the bad vibes.",
    category: "electronics", priceUsdCents: 13900, accent: RED,
    image: "/products/wd-cola-powerbank.jpg", art: "🔋", sort: 4,
  },
  {
    slug: "doodle-headphones",
    name: "Doodle Wireless Headphones",
    desc: "Over-ear wireless headphones wrapped in all-over ZombiesCat doodle print — the official Weidian favourite, now burnable with $ZCAT.",
    category: "electronics", priceUsdCents: 8900, accent: RED,
    image: "/products/wd-doodle-headphones.jpg", art: "🎧", sort: 5,
  },
  {
    slug: "anc-headphones",
    name: "Graffiti ANC Headphones",
    desc: "Active noise cancelling — detects ambient noise and cancels it in real time for a purer world of music. Signature red graffiti shell.",
    category: "electronics", priceUsdCents: 9900, accent: RED,
    image: "/products/electronics-201901-122.jpg", art: "🎧", sort: 6,
  },
  {
    slug: "zc-headset",
    name: "Z.C Bluetooth Headset",
    desc: "The classic Z.C HEADSET — wireless freedom with devil-cat attitude.",
    category: "electronics", priceUsdCents: 5900, accent: CRIMSON,
    image: "/products/electronics-201608-10.jpg", art: "🎧", sort: 7,
  },
  {
    slug: "sound-demon-speaker",
    name: "Sound Demon Speaker",
    desc: "A bluetooth speaker that devours bad vibes and spits out bass.",
    category: "electronics", priceUsdCents: 7900, accent: RED,
    image: "/products/electronics-201811-25.jpg", art: "🔊", sort: 8,
  },
  {
    slug: "z1-speaker",
    name: "Z1 Speaker",
    desc: "Compact Z1 bluetooth speaker in devil red.",
    category: "electronics", priceUsdCents: 6900, accent: PINK,
    image: "/products/electronics-201811-26.jpg", art: "🔊", sort: 9,
  },
  {
    slug: "wired-earphones",
    name: "Wired Earphones",
    desc: "Feather-light in-ears with a natural fit and a polished, durable shell.",
    category: "electronics", priceUsdCents: 1900, accent: RED,
    image: "/products/electronics-201811-104.jpg", art: "🎵", sort: 10,
  },
  {
    slug: "demon-mic",
    name: "Demon Karaoke Mic",
    desc: "Pro karaoke tuning, high-sensitivity condenser head, independent reverb — a streamer's blessing.",
    category: "electronics", priceUsdCents: 4900, accent: CRIMSON,
    image: "/products/electronics-201811-82.jpg", art: "🎤", sort: 11,
  },
  {
    slug: "car-charger",
    name: "Z.C Car Charger",
    desc: "Fast, safe in-car charging with attitude.",
    category: "electronics", priceUsdCents: 2500, accent: PINK,
    image: "/products/electronics-201608-3.jpg", art: "🔌", sort: 12,
  },
  {
    slug: "neckband-earphones",
    name: "Neckband Earphones",
    desc: "No wires, no limits — wear your attitude around your neck.",
    category: "electronics", priceUsdCents: 3900, accent: RED,
    image: "/products/electronics-201811-78.jpg", art: "🎧", sort: 13,
  },

  // ---------------- Apparel ----------------
  {
    slug: "black-red-tee",
    name: "Black × Red Tee",
    desc: "The signature palette on heavyweight cotton — black body, red devil-cat hit.",
    category: "apparel", priceUsdCents: 3500, accent: RED,
    image: "/products/garment-201811-63.jpg", art: "👕", sort: 14,
  },
  {
    slug: "peachtopia-tee",
    name: "× Cats & Peachtopia Tee",
    desc: "Crossover tee with the animated film Cats & Peachtopia — every tee tells a story.",
    category: "apparel", priceUsdCents: 3900, accent: PINK,
    image: "/products/garment-201811-89.jpg", art: "👕", sort: 15,
  },
  {
    slug: "diamond-logo-tee",
    name: "Diamond Logo Tee",
    desc: "ZOMBIESCAT diamond-shaped logo front, twin beast prints on the back.",
    category: "apparel", priceUsdCents: 3900, accent: CRIMSON,
    image: "/products/garment-201811-92.jpg", art: "👕", sort: 16,
  },
  {
    slug: "four-kings-tee",
    name: "× Four Heavenly Kings Tee",
    desc: "Limited crossover with the film Detective Dee: The Four Heavenly Kings.",
    category: "apparel", priceUsdCents: 4200, accent: RED,
    image: "/products/garment-201811-87.jpg", art: "👕", sort: 17,
  },
  {
    slug: "track-jacket",
    name: "Track Jacket",
    desc: "Lightweight street track jacket for devil-cat cardio.",
    category: "apparel", priceUsdCents: 5900, accent: PINK,
    image: "/products/garment-201811-40.jpg", art: "🧥", sort: 18,
  },
  {
    slug: "chinatown-hoodie",
    name: "× Detective Chinatown 2 Hoodie",
    desc: "Crossover hoodie with the blockbuster Detective Chinatown 2.",
    category: "apparel", priceUsdCents: 6900, accent: RED,
    image: "/products/garment-201811-90.jpg", art: "🧥", sort: 19,
  },

  // ---------------- Art toys ----------------
  {
    slug: "mecha-figure",
    name: "× AnDun Mecha Figure",
    desc: "Devil-cat fused with mecha armor — cooler, trendier, sharper.",
    category: "toys", priceUsdCents: 8800, accent: RED,
    image: "/products/coolplay-201811-71.jpg", art: "🤖", sort: 20,
  },
  {
    slug: "vinyl-doll",
    name: "Z.C Vinyl Doll",
    desc: "The classic Z.C DOLL vinyl figure — the icon on your desk.",
    category: "toys", priceUsdCents: 4500, accent: CRIMSON,
    image: "/products/coolplay-201608-12.jpg", art: "😺", sort: 21,
  },
  {
    slug: "plush-doll",
    name: "Plush Doll",
    desc: "Take the negativity-devouring alien home — huggable edition.",
    category: "toys", priceUsdCents: 2900, accent: PINK,
    image: "/products/coolplay-201811-42.jpg", art: "🧸", sort: 22,
  },
  {
    slug: "skateboard",
    name: "Street Skateboard",
    desc: "Full deck with devil-cat graphics — devour the streets.",
    category: "toys", priceUsdCents: 7900, accent: RED,
    image: "/products/coolplay-201811-28.jpg", art: "🛹", sort: 23,
  },
  {
    slug: "mini-figure",
    name: "Mini Figure",
    desc: "The tiny negativity-eater has arrived — pocket-sized menace.",
    category: "toys", priceUsdCents: 1900, accent: CRIMSON,
    image: "/products/coolplay-201811-116.jpg", art: "👾", sort: 24,
  },
  {
    slug: "giant-plush-70",
    name: "Giant Plush 70cm",
    desc: "70cm of huggable devil — the giant plush edition.",
    category: "toys", priceUsdCents: 6900, accent: RED,
    image: "/products/coolplay-201811-74.jpg", art: "🧸", sort: 25,
  },
  {
    slug: "fiberglass-statue",
    name: "1.5m Fiberglass Statue",
    desc: "Collector-grade 1.5-meter fiberglass ZombiesCat statue — for spaces that devour negativity at scale.",
    category: "toys", priceUsdCents: 199900, accent: CRIMSON,
    image: "/products/others-201811-95.jpg", art: "🗿", sort: 26,
  },

  // ---------------- Accessories ----------------
  {
    slug: "canvas-tote",
    name: "Canvas Tote",
    desc: "Everyday canvas tote with the X-eye face.",
    category: "accessories", priceUsdCents: 1500, accent: RED,
    image: "/products/others-201811-59.jpg", art: "👜", sort: 27,
  },
  {
    slug: "demon-umbrella",
    name: "Demon Umbrella",
    desc: "Rain or shine, the devil-cat has you covered.",
    category: "accessories", priceUsdCents: 2500, accent: CRIMSON,
    image: "/products/others-201811-68.jpg", art: "☂️", sort: 28,
  },
  {
    slug: "backpack",
    name: "Backpack",
    desc: "Street backpack with devil-cat hardware.",
    category: "accessories", priceUsdCents: 4900, accent: RED,
    image: "/products/garment-201811-65.jpg", art: "🎒", sort: 29,
  },
  {
    slug: "trolley-case",
    name: "Trolley Case",
    desc: "Travel-ready trolley case in full devil-cat livery.",
    category: "accessories", priceUsdCents: 11900, accent: PINK,
    image: "/products/garment-201811-54.jpg", art: "🧳", sort: 30,
  },
  {
    slug: "lipstick",
    name: "Demon-Core Lipstick",
    desc: "The demon-core lipstick — devour dullness.",
    category: "accessories", priceUsdCents: 1900, accent: RED,
    image: "/products/jewelry-201811-52.jpg", art: "💄", sort: 31,
  },
  {
    slug: "eyeliner",
    name: "Cool-Demon Eyeliner",
    desc: "Sharp lines, sharper attitude.",
    category: "accessories", priceUsdCents: 1500, accent: CRIMSON,
    image: "/products/jewelry-201811-106.jpg", art: "✏️", sort: 32,
  },
  {
    slug: "mascara",
    name: "Little-Witch Mascara",
    desc: "Instant volume and curl — witchcraft for lashes.",
    category: "accessories", priceUsdCents: 1700, accent: PINK,
    image: "/products/jewelry-201811-110.jpg", art: "👁️", sort: 33,
  },

  // ---------------- Lifestyle / home ----------------
  {
    slug: "sonic-toothbrush",
    name: "Sonic Toothbrush",
    desc: "Breaks the 3-minute routine — full-coverage sonic clean in 30 seconds.",
    category: "lifestyle", priceUsdCents: 3900, accent: RED,
    image: "/products/home-201811-99.jpg", art: "🪥", sort: 34,
  },
  {
    slug: "thermos",
    name: "Thermos Bottle",
    desc: "Keeps drinks hot, keeps vibes hotter.",
    category: "lifestyle", priceUsdCents: 2500, accent: CRIMSON,
    image: "/products/home-201707-17.jpg", art: "🥤", sort: 35,
  },
  {
    slug: "mask-eyemask",
    name: "Mask & Eye-Mask Set",
    desc: "X-eye mask set — block the world, devour the noise.",
    category: "lifestyle", priceUsdCents: 1500, accent: RED,
    image: "/products/home-201811-47.jpg", art: "😷", sort: 36,
  },
  {
    slug: "plush-pillow",
    name: "Plush Pillow",
    desc: "Squeeze the negativity out of it.",
    category: "lifestyle", priceUsdCents: 2200, accent: PINK,
    image: "/products/home-201707-20.jpg", art: "🛋️", sort: 37,
  },
  {
    slug: "head-massager",
    name: "Head Massager",
    desc: "Massages the stress right out of your skull.",
    category: "lifestyle", priceUsdCents: 4900, accent: RED,
    image: "/products/home-201811-100.jpg", art: "💆", sort: 38,
  },
  {
    slug: "bedding-set",
    name: "4-Piece Bedding Set",
    desc: "The trendiest devil-cat bedding — cool, healthy, stylish sleep.",
    category: "lifestyle", priceUsdCents: 8900, accent: CRIMSON,
    image: "/products/home-201811-103.jpg", art: "🛏️", sort: 39,
  },
  {
    slug: "flip-mug",
    name: "Flip Mug",
    desc: "Flip the cup, tip out the negativity — every sip is momoda.",
    category: "lifestyle", priceUsdCents: 1900, accent: RED,
    image: "/products/others-201811-102.jpg", art: "☕", sort: 40,
  },
  {
    slug: "round-mug",
    name: "Round Mug",
    desc: "The trendiest round mug on the shelf.",
    category: "lifestyle", priceUsdCents: 1500, accent: PINK,
    image: "/products/others-201811-67.jpg", art: "☕", sort: 41,
  },
  {
    slug: "demon-lighter",
    name: "Demonic Lighter",
    desc: "Spark it, burn the bad vibes.",
    category: "lifestyle", priceUsdCents: 2900, accent: CRIMSON,
    image: "/products/fastmoving-201901-124.jpg", art: "🔥", sort: 42,
  },
  {
    slug: "condoms",
    name: "Condoms (8-Pack)",
    desc: "Official 8-pack. Safety first, momoda.",
    category: "lifestyle", priceUsdCents: 900, accent: RED,
    image: "/products/home-201707-19.jpg", art: "🌚", sort: 43,
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
