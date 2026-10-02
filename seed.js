require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');
const DeliverySettings = require('./models/DeliverySettings');
const DeliveryArea = require('./models/DeliveryArea');
const Setting = require('./models/Setting');

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    DeliverySettings.deleteMany({}),
    DeliveryArea.deleteMany({}),
    Setting.deleteMany({}),
  ]);

  const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@12345', 10);
  const customerHash = await bcrypt.hash(process.env.CUSTOMER_DEMO_PASSWORD || 'Customer@12345', 10);

  const admin = await User.create({
    name: 'Arsalan Admin',
    email: (process.env.ADMIN_EMAIL || 'admin@arsalanfabrics.com').toLowerCase(),
    passwordHash: adminHash,
    role: 'admin',
  });

  const customer = await User.create({
    name: 'Ayesha Khan',
    email: (process.env.CUSTOMER_DEMO_EMAIL || 'ayesha.k@email.com').toLowerCase(),
    phone: '+92 300 1234567',
    passwordHash: customerHash,
    role: 'customer',
    status: 'premium',
    addresses: [
      {
        label: 'Home',
        firstName: 'Ayesha',
        lastName: 'Khan',
        phone: '+92 300 1234567',
        country: 'Pakistan',
        city: 'Lahore',
        province: 'Punjab',
        postalCode: '54000',
        addressLine: 'House 12, Street 3, Gulberg III',
        isDefault: true,
      },
    ],
  });

  const categories = await Category.insertMany([
    { name: 'Formal Stitched', slug: 'formal-stitched', websiteStatus: 'showing', showOnHomepage: true, sortOrder: 1 },
    { name: 'Formal Unstitched', slug: 'formal-unstitched', websiteStatus: 'showing', sortOrder: 2 },
    { name: 'Formal Dresses', slug: 'formal-dresses', websiteStatus: 'showing', sortOrder: 3 },
    { name: 'Semi-Formal', slug: 'semi-formal', websiteStatus: 'showing', sortOrder: 4 },
    { name: 'Ready to Wear', slug: 'ready-to-wear', websiteStatus: 'showing', sortOrder: 5 },
    { name: 'New Arrivals', slug: 'new-arrivals', websiteStatus: 'showing', showOnHomepage: true, sortOrder: 0 },
  ]);

  const cat = (slug) => categories.find((c) => c.slug === slug)._id;
  const img = (n) => `Assets/images/3-pieces-collection-page-product (${n}).png`;

  const products = await Product.insertMany([
    {
      name: 'Noor Organza Stitched Suit',
      articleCode: 'AF-001',
      description: 'Premium organza stitched 3-piece with resham embroidery.',
      category: cat('formal-stitched'),
      productType: 'Ready to Wear',
      pieceType: '3 Piece',
      fabric: 'Organza & Silk',
      color: 'Pale Champagne',
      season: "Spring / Summer '26",
      price: 16500,
      stock: 14,
      sizeInventory: [
        { size: 'XS', quantity: 2 },
        { size: 'S', quantity: 4 },
        { size: 'M', quantity: 3 },
        { size: 'L', quantity: 3 },
      ],
      images: ['Assets/images/products-detail-main-image (4).png'],
      tags: ['bestseller', 'formal'],
      featured: true,
      newArrival: true,
      showOnWebsite: true,
      ratingAvg: 5,
      reviewCount: 18,
    },
    {
      name: 'Meher Gold',
      articleCode: 'AF-004',
      description: 'Hand-crafted luxury ensemble with gold tilla embroidery.',
      category: cat('formal-stitched'),
      productType: '3 Piece suit',
      pieceType: '3 Piece',
      fabric: 'Raw Silk',
      price: 18500,
      salePrice: 16900,
      stock: 8,
      images: ['Assets/images/wishlist-page-products-image (2).png'],
      tags: ['bestseller'],
      newArrival: true,
      showOnWebsite: true,
    },
    {
      name: 'Zariyah',
      articleCode: 'AF-101',
      description: 'Raw silk 3-piece complete with handcrafted patches.',
      category: cat('formal-unstitched'),
      productType: 'Formal Unstitched',
      pieceType: '3 Piece',
      fabric: 'Raw Silk',
      price: 19500,
      salePrice: 16500,
      stock: 20,
      images: [img(12)],
      tags: ['bestseller'],
      showOnWebsite: true,
    },
    {
      name: 'Soraya',
      articleCode: 'AF-102',
      category: cat('formal-unstitched'),
      productType: 'Formal Unstitched',
      pieceType: '3 Piece',
      fabric: 'Chiffon',
      price: 18200,
      stock: 15,
      images: [img(11)],
      newArrival: true,
      showOnWebsite: true,
    },
    {
      name: 'Elara Semi-Formal',
      articleCode: 'AF-201',
      category: cat('semi-formal'),
      productType: 'Semi-Formal',
      pieceType: '2 Piece',
      fabric: 'Lawn',
      price: 8900,
      stock: 30,
      images: [img(10)],
      showOnWebsite: true,
    },
    {
      name: 'Riva RTW Edit',
      articleCode: 'AF-301',
      category: cat('ready-to-wear'),
      productType: 'Ready to Wear',
      pieceType: '2 Piece',
      fabric: 'Cotton Silk',
      price: 12500,
      stock: 12,
      images: [img(9)],
      featured: true,
      showOnWebsite: true,
    },
    {
      name: 'Nadia Formal Dress',
      articleCode: 'AF-401',
      category: cat('formal-dresses'),
      productType: 'Formal Dress',
      pieceType: '1 Piece',
      fabric: 'Velvet',
      price: 22000,
      salePrice: 18900,
      stock: 6,
      images: [img(8)],
      tags: ['bestseller'],
      showOnWebsite: true,
    },
    {
      name: 'Premium Lawn Fabric',
      articleCode: 'AF-501',
      category: cat('formal-unstitched'),
      productType: 'Fabric',
      pieceType: 'Fabric',
      fabric: 'Lawn',
      price: 4500,
      stock: 50,
      images: [img(7)],
      showOnWebsite: true,
    },
    {
      name: 'Dilara Organza',
      articleCode: 'AF-103',
      category: cat('formal-unstitched'),
      pieceType: '3 Piece',
      fabric: 'Organza',
      price: 17500,
      salePrice: 14900,
      stock: 10,
      images: [img(6)],
      newArrival: true,
      showOnWebsite: true,
    },
    {
      name: 'Classic 2-Piece Lawn',
      articleCode: 'AF-601',
      category: cat('semi-formal'),
      pieceType: '2 Piece',
      fabric: 'Lawn',
      price: 7200,
      stock: 25,
      images: [img(5)],
      showOnWebsite: true,
    },
  ]);

  await DeliverySettings.create({
    standardCharge: 250,
    freeShippingEnabled: true,
    freeShippingMin: 10000,
    billingType: 'city',
  });

  await DeliveryArea.insertMany([
    { city: 'Lahore', charge: 200, estimatedTime: '2-3 Days', isActive: true },
    { city: 'Islamabad', charge: 300, estimatedTime: '3-4 Days', isActive: true },
    { city: 'Karachi', charge: 300, estimatedTime: '3-5 Days', isActive: true },
  ]);

  await Setting.insertMany([
    {
      key: 'announcementText',
      value: 'COMPLIMENTARY EXPRESS SHIPPING ACROSS PAKISTAN ON ORDERS ABOVE RS. 15,000',
    },
    { key: 'freeShippingThreshold', value: 15000 },
    { key: 'storeName', value: 'Arsalan Fabrics' },
    { key: 'contactEmail', value: 'support@arsalanfabrics.com' },
  ]);

  await Order.create({
    orderNumber: '#AF1024',
    user: customer._id,
    customerName: 'Ayesha Khan',
    customerEmail: customer.email,
    customerPhone: customer.phone,
    items: [
      {
        product: products[0]._id,
        name: products[0].name,
        sku: products[0].articleCode,
        size: 'S',
        color: 'Pale Champagne',
        quantity: 1,
        price: 16500,
        image: products[0].images[0],
      },
    ],
    shippingAddress: customer.addresses[0],
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    status: 'shipped',
    trackingId: 'LP-882910',
    courier: 'Leopards Courier',
    subtotal: 16500,
    shipping: 250,
    total: 16750,
    timeline: [
      { status: 'placed', title: 'Order placed', detail: 'Awaiting review' },
      { status: 'processing', title: 'Processing at atelier', detail: 'Quality check complete' },
      { status: 'shipped', title: 'Shipped via Leopards', detail: 'Tracking LP-882910' },
    ],
  });

  console.log('Seed complete');
  console.log('Admin:', admin.email);
  console.log('Customer:', customer.email);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
