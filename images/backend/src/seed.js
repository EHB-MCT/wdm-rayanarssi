const path = require('path');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seedDatabase() {
    console.log('🌱 Starting database seeding...');
    
    const client = new MongoClient(process.env.MONGODB_URI);
    
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('✅ Connected to database');
        
        const db = client.db('dev5');
        
        // 1. Seed products if collection is empty
        console.log('📦 Checking products collection...');
        const productsCount = await db.collection('products').countDocuments();
        
        if (productsCount === 0) {
            console.log('📥 Inserting products...');
            
            // Load products from JSON file using __dirname for reliable path
            const productsPath = path.join(__dirname, 'data', 'products.json');
            const products = require(productsPath);
            
            await db.collection('products').insertMany(products);
            console.log(`✅ Inserted ${products.length} products`);
        } else {
            console.log(`ℹ️  Products collection already has ${productsCount} items. Skipping product seeding.`);
        }
        
        // 2. Seed admin user if doesn't exist
        console.log('👤 Checking admin user...');
        const existingAdmin = await db.collection('users').findOne({ 
            email: 'admin@streetlabstore.com' 
        });
        
        if (!existingAdmin) {
            console.log('👥 Creating admin user...');
            
            const adminPassword = await bcrypt.hash('123', 10);
            const adminUser = {
                id: require('uuid-v4')(),
                username: 'Admin',
                email: 'admin@streetlabstore.com',
                password: adminPassword,
                amountOfLogins: 0,
                type: 0, // Admin type
            };
            
            await db.collection('users').insertOne(adminUser);
            console.log('✅ Admin user created (admin@streetlabstore.com / 123)');
        } else {
            console.log('ℹ️  Admin user already exists. Skipping admin seeding.');
        }
        
        console.log('🎉 Database seeding completed successfully!');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        await client.close();
        console.log('🔌 Database connection closed');
    }
}

// Only run script if called directly (not when imported)
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('✨ Seeding process finished');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedDatabase };