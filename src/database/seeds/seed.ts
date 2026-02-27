import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../../config/database/data-source';

async function seed() {
  const dataSource = new DataSource(dataSourceOptions);

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    // Seed dish categories
    await dataSource.query(`
      INSERT INTO dish_categories (id, name, slug, description, sort_order, is_active)
      VALUES
        (uuid_generate_v4(), 'Breakfast', 'breakfast', 'Morning meals', 1, true),
        (uuid_generate_v4(), 'Lunch', 'lunch', 'Midday meals', 2, true),
        (uuid_generate_v4(), 'Dinner', 'dinner', 'Evening meals', 3, true),
        (uuid_generate_v4(), 'Snacks', 'snacks', 'Light snacks', 4, true),
        (uuid_generate_v4(), 'Desserts', 'desserts', 'Sweet treats', 5, true),
        (uuid_generate_v4(), 'Salads', 'salads', 'Fresh salads', 6, true),
        (uuid_generate_v4(), 'Soups', 'soups', 'Warm soups', 7, true),
        (uuid_generate_v4(), 'Vegetarian', 'vegetarian', 'Meat-free dishes', 8, true),
        (uuid_generate_v4(), 'Vegan', 'vegan', 'Plant-based dishes', 9, true),
        (uuid_generate_v4(), 'Protein-Rich', 'protein-rich', 'High protein meals', 10, true)
      ON CONFLICT (slug) DO NOTHING;
    `);

    console.log('Dish categories seeded successfully');

    // Seed sample dishes
    await dataSource.query(`
      INSERT INTO dishes (id, name, description, servings, calories, protein_g, carbs_g, fats_g, is_public)
      VALUES
        (
          uuid_generate_v4(),
          'Grilled Chicken Breast',
          'Lean protein source, perfect for muscle building',
          1,
          165,
          31,
          0,
          3.6,
          true
        ),
        (
          uuid_generate_v4(),
          'Brown Rice (1 cup)',
          'Whole grain carbohydrate',
          1,
          216,
          5,
          45,
          1.8,
          true
        ),
        (
          uuid_generate_v4(),
          'Greek Yogurt (1 cup)',
          'High protein breakfast option',
          1,
          130,
          22,
          9,
          0.7,
          true
        ),
        (
          uuid_generate_v4(),
          'Oatmeal with Berries',
          'Nutritious breakfast with fiber',
          1,
          210,
          7,
          38,
          4,
          true
        ),
        (
          uuid_generate_v4(),
          'Caesar Salad',
          'Fresh salad with romaine lettuce',
          1,
          184,
          10,
          7,
          14,
          true
        )
      ON CONFLICT DO NOTHING;
    `);

    console.log('Sample dishes seeded successfully');

    console.log('Seeding completed!');
    await dataSource.destroy();
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
