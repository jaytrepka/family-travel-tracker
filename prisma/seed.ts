import { PrismaClient, Continent } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";

// Load .env.local
if (fs.existsSync(".env.local")) {
  const lines = fs.readFileSync(".env.local", "utf8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database…");

  // ── Family members ────────────────────────────────────────────────────────
  const [oliver, vilem, lucinka, janek] = await Promise.all([
    prisma.person.upsert({
      where: { name: "Oliver" },
      update: {},
      create: { name: "Oliver", color: "#3B82F6", emoji: "👦", order: 0 },
    }),
    prisma.person.upsert({
      where: { name: "Vilém" },
      update: {},
      create: { name: "Vilém", color: "#22C55E", emoji: "🧒", order: 1 },
    }),
    prisma.person.upsert({
      where: { name: "Lucinka" },
      update: {},
      create: { name: "Lucinka", color: "#EF4444", emoji: "👧", order: 2 },
    }),
    prisma.person.upsert({
      where: { name: "Janek" },
      update: {},
      create: { name: "Janek", color: "#F59E0B", emoji: "👨", order: 3 },
    }),
  ]);

  console.log("✅ People seeded");

  // ── Sample countries ──────────────────────────────────────────────────────
  const countries: { code: string; name: string; continent: Continent }[] = [
    { code: "CZE", name: "Czech Republic", continent: "EUROPE" },
    { code: "ALB", name: "Albania", continent: "EUROPE" },
    { code: "HRV", name: "Croatia", continent: "EUROPE" },
    { code: "ITA", name: "Italy", continent: "EUROPE" },
    { code: "FRA", name: "France", continent: "EUROPE" },
    { code: "DEU", name: "Germany", continent: "EUROPE" },
    { code: "ESP", name: "Spain", continent: "EUROPE" },
    { code: "GRC", name: "Greece", continent: "EUROPE" },
    { code: "AUT", name: "Austria", continent: "EUROPE" },
    { code: "SVK", name: "Slovakia", continent: "EUROPE" },
    { code: "POL", name: "Poland", continent: "EUROPE" },
    { code: "HUN", name: "Hungary", continent: "EUROPE" },
    { code: "THA", name: "Thailand", continent: "ASIA" },
    { code: "JPN", name: "Japan", continent: "ASIA" },
    { code: "USA", name: "United States", continent: "NORTH_AMERICA" },
    { code: "MEX", name: "Mexico", continent: "NORTH_AMERICA" },
    { code: "EGY", name: "Egypt", continent: "AFRICA" },
    { code: "MAR", name: "Morocco", continent: "AFRICA" },
    { code: "AUS", name: "Australia", continent: "OCEANIA" },
  ];

  for (const c of countries) {
    await prisma.country.upsert({ where: { code: c.code }, update: {}, create: c });
  }

  console.log("✅ Countries seeded");

  // ── Sample trip ───────────────────────────────────────────────────────────
  const trip = await prisma.trip.upsert({
    where: { slug: "albania-2026" },
    update: {},
    create: {
      title: "Albánie 2026",
      slug: "albania-2026",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-07-14"),
      description:
        "Our adventurous family trip to Albania — beautiful beaches, mountains, and amazing food.",
      funFacts:
        "Albania has over 300,000 bunkers built during communism.\nThe national drink is raki.\nAlbania is one of the most budget-friendly countries in Europe.",
      blogUrl: "https://albania2026a.blogspot.com/",
      published: true,
      participants: {
        create: [
          { personId: oliver.id },
          { personId: vilem.id },
          { personId: lucinka.id },
          { personId: janek.id },
        ],
      },
      countries: {
        create: [{ countryCode: "ALB" }],
      },
      places: {
        create: [
          {
            name: "Tirana",
            description: "Capital city — Skanderbeg Square, colorful buildings.",
            category: "SIGHTSEEING",
            order: 0,
          },
          {
            name: "Berat",
            description: 'The "City of a Thousand Windows" — UNESCO World Heritage Site.',
            category: "SIGHTSEEING",
            order: 1,
          },
          {
            name: "Ksamil Beach",
            description: "Crystal clear turquoise waters on the Albanian Riviera.",
            category: "KID_FRIENDLY",
            order: 2,
          },
        ],
      },
    },
  });

  console.log(`✅ Sample trip seeded: ${trip.title}`);
  console.log("\n🎉 Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
