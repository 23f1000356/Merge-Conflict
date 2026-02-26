import sequelize from './src/config/database.js';
import { User } from './src/models/index.js';

const testUsers = [
  {
    fullName: 'Dr. Sarah Johnson',
    email: 'doctor@example.com',
    password: 'password123',
    phone: '555-0001',
    age: 45,
    gender: 'female',
    role: 'doctor',
    baselineCompleted: true
  },
  {
    fullName: 'John Doe',
    email: 'patient@example.com',
    password: 'password123',
    phone: '555-0002',
    age: 62,
    gender: 'male',
    role: 'patient',
    baselineCompleted: true
  },
  {
    fullName: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    phone: '555-0003',
    age: 50,
    gender: 'other',
    role: 'admin',
    baselineCompleted: false
  }
];

async function seedDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Sync models
    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    // Create test users
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
      } else {
        const user = await User.create(userData);
        console.log(`✓ Created user: ${userData.fullName} (${userData.email})`);
      }
    }

    console.log('\n✅ Database seeding complete!');
    console.log('\n📝 Test Credentials:');
    console.log('─────────────────────────────────────');
    testUsers.forEach(user => {
      console.log(`\nRole: ${user.role.toUpperCase()}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
