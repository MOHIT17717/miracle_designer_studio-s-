const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const { prisma } = require('./db');

async function seed() {
  console.log('🌱 Seeding database...');

  // ─── Categories ─────────────────────────────────────────
  const categories = [
    { name: 'Sarees', description: 'Exquisite handwoven and designer sarees for every occasion', sortOrder: 1 },
    { name: 'Lehengas', description: 'Stunning bridal and party lehengas with intricate embroidery', sortOrder: 2 },
    { name: 'Kurtis', description: 'Elegant designer kurtis for casual and festive wear', sortOrder: 3 },
    { name: 'Jewelry', description: 'Traditional and contemporary jewelry pieces', sortOrder: 4 },
    { name: 'Makeup Kits', description: 'Professional-grade makeup kits and beauty essentials', sortOrder: 5 },
    { name: 'Accessories', description: 'Clutches, dupattas, and fashion accessories', sortOrder: 6 },
  ];

  const catMap = {};
  for (const cat of categories) {
    const existing = await prisma.category.findUnique({ where: { name: cat.name } });
    if (existing) {
      catMap[cat.name] = existing.id;
      console.log(`  ✓ Category "${cat.name}" already exists`);
    } else {
      const created = await prisma.category.create({ data: cat });
      catMap[cat.name] = created.id;
      console.log(`  + Created category "${cat.name}"`);
    }
  }

  // ─── Products ───────────────────────────────────────────
  const products = [
    {
      name: 'Banarasi Silk Saree',
      description: 'Luxurious pure Banarasi silk saree with golden zari work and intricate motifs. Perfect for weddings and festive occasions. Comes with matching blouse piece.',
      price: 12999,
      salePrice: 9999,
      categoryId: catMap['Sarees'],
      stock: 15,
      tags: JSON.stringify(['silk', 'wedding', 'festive', 'bestseller']),
      images: JSON.stringify([]),
    },
    {
      name: 'Kanjeevaram Silk Saree',
      description: 'Authentic Kanjeevaram silk saree with temple border and rich pallu. Handwoven by master weavers from Tamil Nadu.',
      price: 18500,
      salePrice: null,
      categoryId: catMap['Sarees'],
      stock: 8,
      tags: JSON.stringify(['silk', 'traditional', 'premium']),
      images: JSON.stringify([]),
    },
    {
      name: 'Georgette Embroidered Saree',
      description: 'Lightweight georgette saree with delicate sequin and thread embroidery. Ideal for parties and receptions.',
      price: 5999,
      salePrice: 4499,
      categoryId: catMap['Sarees'],
      stock: 22,
      tags: JSON.stringify(['party', 'lightweight', 'embroidered']),
      images: JSON.stringify([]),
    },
    {
      name: 'Royal Bridal Lehenga',
      description: 'Heavy bridal lehenga with velvet base, zardozi embroidery, and kundan work. Includes dupatta and blouse. A showstopper for your special day.',
      price: 45000,
      salePrice: 38999,
      categoryId: catMap['Lehengas'],
      stock: 5,
      tags: JSON.stringify(['bridal', 'premium', 'heavy', 'bestseller']),
      images: JSON.stringify([]),
    },
    {
      name: 'Party Wear Lehenga',
      description: 'Stunning net and silk lehenga with mirror and sequin work. Perfect for sangeet and reception celebrations.',
      price: 22000,
      salePrice: 17999,
      categoryId: catMap['Lehengas'],
      stock: 10,
      tags: JSON.stringify(['party', 'sangeet', 'reception']),
      images: JSON.stringify([]),
    },
    {
      name: 'Anarkali Designer Kurti',
      description: 'Flared Anarkali kurti in premium cotton silk with gota patti work. Comes with matching palazzo pants.',
      price: 3999,
      salePrice: 2999,
      categoryId: catMap['Kurtis'],
      stock: 30,
      tags: JSON.stringify(['festive', 'cotton-silk', 'bestseller']),
      images: JSON.stringify([]),
    },
    {
      name: 'Chikankari Lucknowi Kurti',
      description: 'Handcrafted Lucknowi Chikankari kurti in pure georgette. Elegant and timeless design for all occasions.',
      price: 4500,
      salePrice: null,
      categoryId: catMap['Kurtis'],
      stock: 18,
      tags: JSON.stringify(['handcrafted', 'traditional', 'georgette']),
      images: JSON.stringify([]),
    },
    {
      name: 'Kundan Bridal Jewelry Set',
      description: 'Exquisite kundan necklace set with earrings, maang tikka, and passa. Gold-plated with premium kundan stones.',
      price: 15999,
      salePrice: 12999,
      categoryId: catMap['Jewelry'],
      stock: 7,
      tags: JSON.stringify(['bridal', 'kundan', 'gold-plated', 'premium']),
      images: JSON.stringify([]),
    },
    {
      name: 'Pearl Jhumka Earrings',
      description: 'Elegant pearl and gold jhumka earrings with intricate filigree work. Perfect for both traditional and fusion looks.',
      price: 2499,
      salePrice: 1999,
      categoryId: catMap['Jewelry'],
      stock: 25,
      tags: JSON.stringify(['earrings', 'pearl', 'jhumka']),
      images: JSON.stringify([]),
    },
    {
      name: 'Professional Bridal Makeup Kit',
      description: 'Complete bridal makeup kit with foundation, contour, lip palette, eye shadows, and brushes. Premium international brands.',
      price: 8999,
      salePrice: 6999,
      categoryId: catMap['Makeup Kits'],
      stock: 12,
      tags: JSON.stringify(['bridal', 'professional', 'complete-kit']),
      images: JSON.stringify([]),
    },
    {
      name: 'Everyday Glow Makeup Set',
      description: 'Curated set with BB cream, blush, lip tint, mascara, and setting spray. Perfect for everyday natural glow.',
      price: 3499,
      salePrice: null,
      categoryId: catMap['Makeup Kits'],
      stock: 20,
      tags: JSON.stringify(['everyday', 'natural', 'glow']),
      images: JSON.stringify([]),
    },
    {
      name: 'Embroidered Clutch Purse',
      description: 'Handcrafted clutch purse with zardozi embroidery and pearl accents. Matches perfectly with ethnic wear.',
      price: 1999,
      salePrice: 1499,
      categoryId: catMap['Accessories'],
      stock: 35,
      tags: JSON.stringify(['clutch', 'embroidered', 'ethnic']),
      images: JSON.stringify([]),
    },
  ];

  for (const prod of products) {
    const existing = await prisma.product.findFirst({ where: { name: prod.name } });
    if (existing) {
      console.log(`  ✓ Product "${prod.name}" already exists`);
    } else {
      await prisma.product.create({ data: prod });
      console.log(`  + Created product "${prod.name}"`);
    }
  }

  // ─── Festival Offer ─────────────────────────────────────
  const existingOffer = await prisma.offer.findFirst({ where: { title: 'Summer Festival Sale' } });
  if (!existingOffer) {
    const allProducts = await prisma.product.findMany({ take: 6 });
    await prisma.offer.create({
      data: {
        title: 'Summer Festival Sale',
        description: 'Celebrate the season with up to 30% off on selected designer pieces. Limited time festive collection!',
        discount: 30,
        festivalName: 'Summer Collection',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        products: {
          create: allProducts.slice(0, 4).map((p) => ({ productId: p.id })),
        },
      },
    });
    console.log('  + Created "Summer Festival Sale" offer');
  } else {
    console.log('  ✓ Offer "Summer Festival Sale" already exists');
  }

  console.log('\n✅ Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
