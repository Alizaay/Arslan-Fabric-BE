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
    { name: 'Formal Stitched', slug: 'formal-stitched', websiteStatus: 'showing', showOnHomepage: true },
    { name: 'Formal Unstitched', slug: 'formal-unstitched', websiteStatus: 'showing' },
    { name: 'Semi-Formal', slug: 'semi-formal', websiteStatus: 'showing' },
    { name: 'New Arrivals', slug: 'new-arrivals', websiteStatus: 'showing', showOnHomepage: true },
  ]);

  const products = await Product.insertMany([
    {
      name: 'Noor Organza Stitched Suit',
      articleCode: 'AF-001',
      description: 'Premium organza stitched 3-piece with resham embroidery.',
      category: categories[0]._id,
      productType: '3 Piece suit',
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
        { size: 'XL', quantity: 0 },
      ],
      images: ['Assets/images/products-detail-main-image (4).png'],
      tags: ['bestseller', 'formal'],
      featured: true,
      newArrival: true,
      showOnWebsite: true,
      availabilityStatus: 'in_stock',
    },
    {
      name: 'Meher Gold',
      articleCode: 'AF-004',
      description: 'Hand-crafted luxury ensemble with gold tilla embroidery.',
      category: categories[0]._id,
      productType: '3 Piece suit',
      price: 18500,
      stock: 8,
      images: ['Assets/images/wishlist-page-products-image (2).png'],
      newArrival: true,
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
    status: 'new',
    subtotal: 16500,
    shipping: 275,
    total: 16775,
    timeline: [{ status: 'placed', title: 'Order placed', detail: 'Awaiting review' }],
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
