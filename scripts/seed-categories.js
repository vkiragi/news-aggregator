const { PrismaClient } = require('../lib/generated/prisma');

const prisma = new PrismaClient();

const categories = [
  {
    name: 'General',
    description: 'General news and current events',
    icon: 'newspaper',
    color: '#3b82f6'
  },
  {
    name: 'Technology',
    description: 'Technology news, startups, and innovation',
    icon: 'cpu',
    color: '#10b981'
  },
  {
    name: 'Business',
    description: 'Business news, markets, and economy',
    icon: 'trending-up',
    color: '#f59e0b'
  },
  {
    name: 'Sports',
    description: 'Sports news and updates',
    icon: 'trophy',
    color: '#ef4444'
  },
  {
    name: 'Entertainment',
    description: 'Entertainment, movies, music, and celebrities',
    icon: 'music',
    color: '#8b5cf6'
  },
  {
    name: 'Science',
    description: 'Science news and discoveries',
    icon: 'flask-conical',
    color: '#06b6d4'
  },
  {
    name: 'Health',
    description: 'Health news and medical updates',
    icon: 'heart',
    color: '#ec4899'
  },
  {
    name: 'Politics',
    description: 'Political news and government updates',
    icon: 'building2',
    color: '#84cc16'
  },
  {
    name: 'World',
    description: 'International news and global events',
    icon: 'globe',
    color: '#6366f1'
  },
  {
    name: 'Environment',
    description: 'Environmental news and climate updates',
    icon: 'leaf',
    color: '#22c55e'
  }
];

async function seedCategories() {
  try {
    console.log('🌱 Starting category seeding...');
    
    for (const category of categories) {
      const existingCategory = await prisma.category.findUnique({
        where: { name: category.name }
      });
      
      if (existingCategory) {
        console.log(`⏭️ Category "${category.name}" already exists, skipping...`);
        continue;
      }
      
      await prisma.category.create({
        data: category
      });
      
      console.log(`✅ Created category: ${category.name}`);
    }
    
    console.log('🎉 Category seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories(); 