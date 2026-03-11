import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Product from '../../models/productModel.js';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true }
});
const Category = mongoose.model('Category', categorySchema);

let mongoServer;
let electronicsCategoryId;
let computersCategoryId;

// Setup connection to a test MongoDB server
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  
  // Create test categories first
  const electronicsCategory = new Category({ name: 'Electronics' });
  const computersCategory = new Category({ name: 'Computers' });
  
  const savedElectronics = await electronicsCategory.save();
  const savedComputers = await computersCategory.save();
  
  electronicsCategoryId = savedElectronics._id;
  computersCategoryId = savedComputers._id;
});

// Close connection after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear product data between tests
afterEach(async () => {
  await Product.deleteMany({});
});

describe('Product Model', () => {
  it('should create a new product successfully', async () => {
    const productData = {
			name: "Test Product",
			description: "This is a test product",
			price: 99.99,
			category: electronicsCategoryId,
			brand: "Test Brand",
			quantity: 10,
			image: "/images/test.jpg",
			countInStock: 10,
			rating: 0,
			numReviews: 0,
		};
    
    const product = new Product(productData);
    const savedProduct = await product.save();
    
    expect(savedProduct._id).toBeDefined();
    expect(savedProduct.name).toBe(productData.name);
    expect(savedProduct.price).toBe(productData.price);
    expect(savedProduct.category.toString()).toBe(electronicsCategoryId.toString());
  });
  
  it('should require name, description, price, category, brand, quantity, and image', async () => {
    const product = new Product({});
    
    let error;
    try {
      await product.save();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors).toBeDefined();
  });
  
  it('should be able to find products by category', async () => {
    // Create test products
    await Product.create([
			{
				name: "Product 1",
				description: "Description 1",
				price: 99.99,
				category: electronicsCategoryId,
				brand: "Brand 1",
				quantity: 10,
				image: "/images/product1.jpg",
				countInStock: 10,
			},
			{
				name: "Product 2",
				description: "Description 2",
				price: 149.99,
				category: computersCategoryId,
				brand: "Brand 2",
				quantity: 5,
				image: "/images/product2.jpg",
				countInStock: 5,
			},
		]);
    
    const electronicsProducts = await Product.find({ category: electronicsCategoryId });
    expect(electronicsProducts.length).toBe(1);
    expect(electronicsProducts[0].name).toBe('Product 1');
    
    const computersProducts = await Product.find({ category: computersCategoryId });
    expect(computersProducts.length).toBe(1);
    expect(computersProducts[0].name).toBe('Product 2');
  });
});