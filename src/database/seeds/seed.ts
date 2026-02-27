import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../../config/database/data-source';

async function seed() {
  const dataSource = new DataSource(dataSourceOptions);

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...');
    const tablesToTruncate = [
      'dish_ratings',
      'meal_dishes',
      'meals',
      'user_daily_logs',
      'body_measurements',
      'user_calorie_targets',
      'user_settings',
      'diet_preferences',
      'dish_cooking_steps',
      'dish_ingredients',
      'dish_category_mapping',
      'dishes',
      'dish_categories',
      'user_oauth_accounts',
      'user_profiles',
      'users',
    ];

    for (const table of tablesToTruncate) {
      try {
        await dataSource.query(`TRUNCATE TABLE ${table} CASCADE;`);
        console.log(`  ✓ Cleared ${table}`);
      } catch (error) {
        console.log(`  ⊘ Skipped ${table} (table may not exist yet)`);
      }
    }

    // Seed dish categories
    console.log('Seeding dish categories...');
    await dataSource.query(`
      INSERT INTO dish_categories (id, name, slug, description, sort_order, is_active)
      VALUES
        ('10000001-0000-4000-8000-000000000001', 'Breakfast', 'breakfast', 'Morning meals', 1, true),
        ('10000002-0000-4000-8000-000000000002', 'Lunch', 'lunch', 'Midday meals', 2, true),
        ('10000003-0000-4000-8000-000000000003', 'Dinner', 'dinner', 'Evening meals', 3, true),
        ('10000004-0000-4000-8000-000000000004', 'Snacks', 'snacks', 'Light snacks', 4, true),
        ('10000005-0000-4000-8000-000000000005', 'Desserts', 'desserts', 'Sweet treats', 5, true),
        ('10000006-0000-4000-8000-000000000006', 'Salads', 'salads', 'Fresh salads', 6, true),
        ('10000007-0000-4000-8000-000000000007', 'Soups', 'soups', 'Warm soups', 7, true),
        ('10000008-0000-4000-8000-000000000008', 'Vegetarian', 'vegetarian', 'Meat-free dishes', 8, true),
        ('10000009-0000-4000-8000-000000000009', 'Vegan', 'vegan', 'Plant-based dishes', 9, true),
        ('1000000a-0000-4000-8000-00000000000a', 'Protein-Rich', 'protein-rich', 'High protein meals', 10, true)
      ON CONFLICT (slug) DO NOTHING;
    `);
    console.log('Dish categories seeded successfully');

    // Seed users (password for all test users: "password123")
    console.log('Seeding users...');
    await dataSource.query(`
      INSERT INTO users (id, email, password_hash, auth_provider, is_guest, is_active, email_verified, last_login_at)
      VALUES
        ('00000001-0000-4000-8000-000000000001', 'john.doe@example.com', '$2b$10$3dd58urUuDyjxNhZqP2NYuHSnk/2d2bAtGOZJg44pzFizNLKsROH2', 'email', false, true, true, NOW() - INTERVAL '2 days'),
        ('00000002-0000-4000-8000-000000000002', 'jane.smith@example.com', '$2b$10$3dd58urUuDyjxNhZqP2NYuHSnk/2d2bAtGOZJg44pzFizNLKsROH2', 'email', false, true, true, NOW() - INTERVAL '1 day'),
        ('00000003-0000-4000-8000-000000000003', 'mike.johnson@example.com', '$2b$10$3dd58urUuDyjxNhZqP2NYuHSnk/2d2bAtGOZJg44pzFizNLKsROH2', 'email', false, true, false, NOW() - INTERVAL '5 hours'),
        ('00000004-0000-4000-8000-000000000004', 'sarah.williams@example.com', '$2b$10$3dd58urUuDyjxNhZqP2NYuHSnk/2d2bAtGOZJg44pzFizNLKsROH2', 'email', false, true, true, NOW() - INTERVAL '3 days'),
        ('00000005-0000-4000-8000-000000000005', NULL, NULL, 'google', false, true, true, NOW() - INTERVAL '12 hours')
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log('Users seeded successfully');

    // Seed user profiles
    console.log('Seeding user profiles...');
    await dataSource.query(`
      INSERT INTO user_profiles (id, user_id, first_name, last_name, date_of_birth, gender, height_cm, current_weight_kg, timezone, country_code)
      VALUES
        ('00000011-0000-4000-8000-000000000011', '00000001-0000-4000-8000-000000000001', 'John', 'Doe', '1990-05-15', 'male', 180.00, 82.50, 'America/New_York', 'US'),
        ('00000012-0000-4000-8000-000000000012', '00000002-0000-4000-8000-000000000002', 'Jane', 'Smith', '1995-08-22', 'female', 165.00, 58.00, 'America/Los_Angeles', 'US'),
        ('00000013-0000-4000-8000-000000000013', '00000003-0000-4000-8000-000000000003', 'Mike', 'Johnson', '1988-12-10', 'male', 175.00, 90.00, 'America/Chicago', 'US'),
        ('00000014-0000-4000-8000-000000000014', '00000004-0000-4000-8000-000000000004', 'Sarah', 'Williams', '1992-03-28', 'female', 170.00, 65.00, 'Europe/London', 'GB'),
        ('00000015-0000-4000-8000-000000000015', '00000005-0000-4000-8000-000000000005', 'Alex', 'Brown', '1985-07-14', 'other', 168.00, 72.00, 'America/Denver', 'US');
    `);
    console.log('User profiles seeded successfully');

    // Seed user settings
    console.log('Seeding user settings...');
    await dataSource.query(`
      INSERT INTO user_settings (id, user_id, activity_level, goal, measurement_system)
      VALUES
        ('00000021-0000-4000-8000-000000000021', '00000001-0000-4000-8000-000000000001', 'moderate', 'lose_weight', 'metric'),
        ('00000022-0000-4000-8000-000000000022', '00000002-0000-4000-8000-000000000002', 'light', 'maintain_weight', 'imperial'),
        ('00000023-0000-4000-8000-000000000023', '00000003-0000-4000-8000-000000000003', 'very', 'gain_weight', 'metric'),
        ('00000024-0000-4000-8000-000000000024', '00000004-0000-4000-8000-000000000004', 'moderate', 'lose_weight', 'metric'),
        ('00000025-0000-4000-8000-000000000025', '00000005-0000-4000-8000-000000000005', 'sedentary', 'maintain_weight', 'metric');
    `);
    console.log('User settings seeded successfully');

    // Seed user calorie targets
    console.log('Seeding calorie targets...');
    await dataSource.query(`
      INSERT INTO user_calorie_targets (id, user_id, target_calories, target_protein_g, target_carbs_g, target_fats_g, target_date)
      VALUES
        ('00000031-0000-4000-8000-000000000031', '00000001-0000-4000-8000-000000000001', 2000, 150.00, 200.00, 65.00, CURRENT_DATE - INTERVAL '30 days'),
        ('00000032-0000-4000-8000-000000000032', '00000002-0000-4000-8000-000000000002', 1800, 100.00, 220.00, 60.00, CURRENT_DATE - INTERVAL '15 days'),
        ('00000033-0000-4000-8000-000000000033', '00000003-0000-4000-8000-000000000003', 2800, 180.00, 350.00, 90.00, CURRENT_DATE - INTERVAL '7 days'),
        ('00000034-0000-4000-8000-000000000034', '00000004-0000-4000-8000-000000000004', 1600, 120.00, 150.00, 55.00, CURRENT_DATE - INTERVAL '20 days'),
        ('00000035-0000-4000-8000-000000000035', '00000005-0000-4000-8000-000000000005', 2200, 130.00, 250.00, 75.00, CURRENT_DATE - INTERVAL '10 days');
    `);
    console.log('Calorie targets seeded successfully');

    // Seed body measurements
    console.log('Seeding body measurements...');
    await dataSource.query(`
      INSERT INTO body_measurements (id, user_id, weight_kg, height_cm, measured_at)
      VALUES
        (uuid_generate_v4(), '00000001-0000-4000-8000-000000000001', 85.00, 180.00, NOW() - INTERVAL '30 days'),
        (uuid_generate_v4(), '00000001-0000-4000-8000-000000000001', 84.00, 180.00, NOW() - INTERVAL '23 days'),
        (uuid_generate_v4(), '00000001-0000-4000-8000-000000000001', 82.50, 180.00, NOW() - INTERVAL '15 days'),
        (uuid_generate_v4(), '00000002-0000-4000-8000-000000000002', 59.00, 165.00, NOW() - INTERVAL '20 days'),
        (uuid_generate_v4(), '00000002-0000-4000-8000-000000000002', 58.00, 165.00, NOW() - INTERVAL '10 days'),
        (uuid_generate_v4(), '00000003-0000-4000-8000-000000000003', 92.00, 175.00, NOW() - INTERVAL '14 days'),
        (uuid_generate_v4(), '00000003-0000-4000-8000-000000000003', 90.00, 175.00, NOW() - INTERVAL '7 days');
    `);
    console.log('Body measurements seeded successfully');

    // Seed dishes with more variety
    console.log('Seeding dishes...');
    await dataSource.query(`
      INSERT INTO dishes (id, name, description, servings, calories, protein_g, carbs_g, fats_g, fiber_g, sugar_g, sodium_mg, prep_time_minutes, cook_time_minutes, is_public, average_rating, rating_count)
      VALUES
        ('00000101-0000-4000-8000-000000000101', 'Grilled Chicken Breast', 'Lean protein source, perfect for muscle building', 1, 165, 31.00, 0.00, 3.60, 0.00, 0.00, 74.00, 5, 15, true, 4.50, 15),
        ('00000102-0000-4000-8000-000000000102', 'Brown Rice (1 cup)', 'Whole grain carbohydrate', 1, 216, 5.00, 45.00, 1.80, 3.50, 0.00, 10.00, 2, 45, true, 4.20, 8),
        ('00000103-0000-4000-8000-000000000103', 'Greek Yogurt (1 cup)', 'High protein breakfast option', 1, 130, 22.00, 9.00, 0.70, 0.00, 7.00, 60.00, 0, 0, true, 4.80, 22),
        ('00000104-0000-4000-8000-000000000104', 'Oatmeal with Berries', 'Nutritious breakfast with fiber', 1, 210, 7.00, 38.00, 4.00, 6.00, 8.00, 5.00, 5, 10, true, 4.60, 18),
        ('00000105-0000-4000-8000-000000000105', 'Caesar Salad', 'Fresh salad with romaine lettuce', 1, 184, 10.00, 7.00, 14.00, 2.00, 3.00, 470.00, 10, 0, true, 4.30, 12),
        ('00000106-0000-4000-8000-000000000106', 'Salmon Fillet', 'Omega-3 rich fish, grilled to perfection', 1, 280, 39.00, 0.00, 13.00, 0.00, 0.00, 86.00, 5, 12, true, 4.70, 25),
        ('00000107-0000-4000-8000-000000000107', 'Quinoa Bowl', 'Complete protein grain with vegetables', 1, 320, 12.00, 58.00, 5.00, 8.00, 4.00, 15.00, 10, 20, true, 4.40, 14),
        ('00000108-0000-4000-8000-000000000108', 'Scrambled Eggs', 'Classic breakfast protein', 2, 182, 12.00, 2.00, 14.00, 0.00, 1.00, 340.00, 2, 5, true, 4.50, 30),
        ('00000109-0000-4000-8000-000000000109', 'Sweet Potato', 'Complex carbohydrate, baked', 1, 103, 2.30, 24.00, 0.20, 3.80, 7.40, 41.00, 5, 45, true, 4.60, 16),
        ('0000010a-0000-4000-8000-00000000010a', 'Avocado Toast', 'Healthy fats with whole grain bread', 1, 250, 6.00, 28.00, 14.00, 7.00, 2.00, 290.00, 5, 3, true, 4.70, 40),
        ('0000010b-0000-4000-8000-00000000010b', 'Protein Smoothie', 'Post-workout recovery drink', 1, 285, 35.00, 30.00, 4.50, 3.00, 20.00, 150.00, 5, 0, true, 4.50, 19),
        ('0000010c-0000-4000-8000-00000000010c', 'Chicken Stir Fry', 'Asian-inspired with mixed vegetables', 2, 420, 45.00, 35.00, 12.00, 5.00, 8.00, 680.00, 15, 12, true, 4.40, 11),
        ('0000010d-0000-4000-8000-00000000010d', 'Lentil Soup', 'Hearty vegetarian protein source', 2, 230, 18.00, 40.00, 1.00, 16.00, 4.00, 570.00, 10, 30, true, 4.30, 9),
        ('0000010e-0000-4000-8000-00000000010e', 'Tuna Salad', 'Light and refreshing lunch option', 1, 200, 33.00, 8.00, 4.00, 2.00, 4.00, 420.00, 10, 0, true, 4.20, 13),
        ('0000010f-0000-4000-8000-00000000010f', 'Beef Tacos', 'Mexican-style with lean ground beef', 2, 380, 28.00, 32.00, 16.00, 4.00, 3.00, 620.00, 10, 15, true, 4.60, 27);
    `);
    console.log('Dishes seeded successfully');

    // Seed dish category mappings
    console.log('Seeding dish category mappings...');
    await dataSource.query(`
      INSERT INTO dish_category_mapping (dish_id, category_id)
      VALUES
        ('00000101-0000-4000-8000-000000000101', '1000000a-0000-4000-8000-00000000000a'),
        ('00000101-0000-4000-8000-000000000101', '10000003-0000-4000-8000-000000000003'),
        ('00000103-0000-4000-8000-000000000103', '10000001-0000-4000-8000-000000000001'),
        ('00000103-0000-4000-8000-000000000103', '1000000a-0000-4000-8000-00000000000a'),
        ('00000104-0000-4000-8000-000000000104', '10000001-0000-4000-8000-000000000001'),
        ('00000104-0000-4000-8000-000000000104', '10000008-0000-4000-8000-000000000008'),
        ('00000105-0000-4000-8000-000000000105', '10000006-0000-4000-8000-000000000006'),
        ('00000105-0000-4000-8000-000000000105', '10000002-0000-4000-8000-000000000002'),
        ('00000106-0000-4000-8000-000000000106', '1000000a-0000-4000-8000-00000000000a'),
        ('00000106-0000-4000-8000-000000000106', '10000003-0000-4000-8000-000000000003'),
        ('00000107-0000-4000-8000-000000000107', '10000008-0000-4000-8000-000000000008'),
        ('00000107-0000-4000-8000-000000000107', '10000009-0000-4000-8000-000000000009'),
        ('00000108-0000-4000-8000-000000000108', '10000001-0000-4000-8000-000000000001'),
        ('0000010a-0000-4000-8000-00000000010a', '10000001-0000-4000-8000-000000000001'),
        ('0000010a-0000-4000-8000-00000000010a', '10000009-0000-4000-8000-000000000009'),
        ('0000010d-0000-4000-8000-00000000010d', '10000007-0000-4000-8000-000000000007'),
        ('0000010d-0000-4000-8000-00000000010d', '10000008-0000-4000-8000-000000000008');
    `);
    console.log('Dish category mappings seeded successfully');

    // Seed dish ingredients
    console.log('Seeding dish ingredients...');
    await dataSource.query(`
      INSERT INTO dish_ingredients (id, dish_id, name, quantity, unit, sort_order)
      VALUES
        (uuid_generate_v4(), '00000101-0000-4000-8000-000000000101', 'Chicken breast', '200', 'g', 1),
        (uuid_generate_v4(), '00000101-0000-4000-8000-000000000101', 'Olive oil', '1', 'tbsp', 2),
        (uuid_generate_v4(), '00000101-0000-4000-8000-000000000101', 'Salt and pepper', '1', 'pinch', 3),
        (uuid_generate_v4(), '00000104-0000-4000-8000-000000000104', 'Rolled oats', '0.5', 'cup', 1),
        (uuid_generate_v4(), '00000104-0000-4000-8000-000000000104', 'Mixed berries', '1', 'cup', 2),
        (uuid_generate_v4(), '00000104-0000-4000-8000-000000000104', 'Milk', '1', 'cup', 3),
        (uuid_generate_v4(), '00000104-0000-4000-8000-000000000104', 'Honey', '1', 'tbsp', 4),
        (uuid_generate_v4(), '0000010a-0000-4000-8000-00000000010a', 'Whole grain bread', '2', 'slices', 1),
        (uuid_generate_v4(), '0000010a-0000-4000-8000-00000000010a', 'Avocado', '1', 'whole', 2),
        (uuid_generate_v4(), '0000010a-0000-4000-8000-00000000010a', 'Lemon juice', '1', 'tsp', 3),
        (uuid_generate_v4(), '0000010a-0000-4000-8000-00000000010a', 'Red pepper flakes', '1', 'pinch', 4);
    `);
    console.log('Dish ingredients seeded successfully');

    // Seed dish cooking steps
    console.log('Seeding cooking steps...');
    await dataSource.query(`
      INSERT INTO dish_cooking_steps (id, dish_id, step_number, instruction)
      VALUES
        (uuid_generate_v4(), '00000101-0000-4000-8000-000000000101', 1, 'Season chicken breast with salt and pepper'),
        (uuid_generate_v4(), '00000101-0000-4000-8000-000000000101', 2, 'Heat grill to medium-high heat'),
        (uuid_generate_v4(), '00000101-0000-4000-8000-000000000101', 3, 'Grill chicken for 6-7 minutes per side'),
        (uuid_generate_v4(), '00000101-0000-4000-8000-000000000101', 4, 'Let rest for 5 minutes before serving'),
        (uuid_generate_v4(), '00000104-0000-4000-8000-000000000104', 1, 'Combine oats and milk in a pot'),
        (uuid_generate_v4(), '00000104-0000-4000-8000-000000000104', 2, 'Cook over medium heat for 8-10 minutes'),
        (uuid_generate_v4(), '00000104-0000-4000-8000-000000000104', 3, 'Top with berries and honey before serving');
    `);
    console.log('Cooking steps seeded successfully');

    // Seed user daily logs
    console.log('Seeding daily logs...');
    await dataSource.query(`
      INSERT INTO user_daily_logs (id, user_id, log_date, calories_consumed, protein_consumed_g, carbs_consumed_g, fats_consumed_g, water_intake_liters, notes)
      VALUES
        ('00000201-0000-4000-8000-000000000201', '00000001-0000-4000-8000-000000000001', CURRENT_DATE - INTERVAL '2 days', 1950, 145.00, 195.00, 62.00, 2.5, 'Great workout day'),
        ('00000202-0000-4000-8000-000000000202', '00000001-0000-4000-8000-000000000001', CURRENT_DATE - INTERVAL '1 day', 2100, 155.00, 210.00, 68.00, 2.0, 'Felt good'),
        ('00000203-0000-4000-8000-000000000203', '00000001-0000-4000-8000-000000000001', CURRENT_DATE, 1800, 140.00, 180.00, 60.00, 1.8, NULL),
        ('00000204-0000-4000-8000-000000000204', '00000002-0000-4000-8000-000000000002', CURRENT_DATE - INTERVAL '1 day', 1750, 95.00, 215.00, 58.00, 2.2, 'Yoga class'),
        ('00000205-0000-4000-8000-000000000205', '00000002-0000-4000-8000-000000000002', CURRENT_DATE, 1820, 102.00, 225.00, 61.00, 2.4, NULL),
        ('00000206-0000-4000-8000-000000000206', '00000003-0000-4000-8000-000000000003', CURRENT_DATE, 2750, 175.00, 340.00, 88.00, 3.0, 'Bulking phase');
    `);
    console.log('Daily logs seeded successfully');

    // Seed meals
    console.log('Seeding meals...');
    await dataSource.query(`
      INSERT INTO meals (id, daily_log_id, meal_type, total_calories, total_protein_g, total_carbs_g, total_fats_g, consumed_at)
      VALUES
        ('00000301-0000-4000-8000-000000000301', '00000201-0000-4000-8000-000000000201', 'breakfast', 340, 29.00, 47.00, 4.70, (CURRENT_DATE - INTERVAL '2 days') + TIME '08:30:00'),
        ('00000302-0000-4000-8000-000000000302', '00000201-0000-4000-8000-000000000201', 'lunch', 600, 55.00, 52.00, 18.60, (CURRENT_DATE - INTERVAL '2 days') + TIME '12:45:00'),
        ('00000303-0000-4000-8000-000000000303', '00000201-0000-4000-8000-000000000201', 'dinner', 445, 50.00, 45.00, 15.80, (CURRENT_DATE - INTERVAL '2 days') + TIME '19:00:00'),
        ('00000304-0000-4000-8000-000000000304', '00000202-0000-4000-8000-000000000202', 'breakfast', 460, 42.00, 68.00, 5.20, (CURRENT_DATE - INTERVAL '1 day') + TIME '07:30:00'),
        ('00000305-0000-4000-8000-000000000305', '00000203-0000-4000-8000-000000000203', 'breakfast', 340, 29.00, 47.00, 4.70, CURRENT_DATE + TIME '08:00:00'),
        ('00000306-0000-4000-8000-000000000306', '00000203-0000-4000-8000-000000000203', 'lunch', 630, 64.00, 58.00, 19.40, CURRENT_DATE + TIME '13:00:00');
    `);
    console.log('Meals seeded successfully');

    // Seed meal dishes with nutritional snapshots
    console.log('Seeding meal dishes...');
    await dataSource.query(`
      INSERT INTO meal_dishes (id, meal_id, dish_id, servings, calories_at_time, protein_at_time_g, carbs_at_time_g, fats_at_time_g)
      VALUES
        (uuid_generate_v4(), '00000301-0000-4000-8000-000000000301', '00000103-0000-4000-8000-000000000103', 1.0, 130, 22.00, 9.00, 0.70),
        (uuid_generate_v4(), '00000301-0000-4000-8000-000000000301', '00000104-0000-4000-8000-000000000104', 1.0, 210, 7.00, 38.00, 4.00),
        (uuid_generate_v4(), '00000302-0000-4000-8000-000000000302', '00000101-0000-4000-8000-000000000101', 1.5, 248, 46.50, 0.00, 5.40),
        (uuid_generate_v4(), '00000302-0000-4000-8000-000000000302', '00000102-0000-4000-8000-000000000102', 1.0, 216, 5.00, 45.00, 1.80),
        (uuid_generate_v4(), '00000302-0000-4000-8000-000000000302', '00000105-0000-4000-8000-000000000105', 1.0, 184, 10.00, 7.00, 14.00);
    `);
    console.log('Meal dishes seeded successfully');

    // Seed dish ratings
    console.log('Seeding dish ratings...');
    await dataSource.query(`
      INSERT INTO dish_ratings (id, dish_id, user_id, rating, review)
      VALUES
        (uuid_generate_v4(), '00000101-0000-4000-8000-000000000101', '00000001-0000-4000-8000-000000000001', 5, 'Perfect for meal prep!'),
        (uuid_generate_v4(), '00000103-0000-4000-8000-000000000103', '00000001-0000-4000-8000-000000000001', 5, 'Best protein breakfast'),
        (uuid_generate_v4(), '00000104-0000-4000-8000-000000000104', '00000002-0000-4000-8000-000000000002', 4, 'Very filling and tasty'),
        (uuid_generate_v4(), '00000106-0000-4000-8000-000000000106', '00000001-0000-4000-8000-000000000001', 5, 'Amazing flavor!'),
        (uuid_generate_v4(), '00000106-0000-4000-8000-000000000106', '00000002-0000-4000-8000-000000000002', 4, 'Good omega-3 source'),
        (uuid_generate_v4(), '0000010a-0000-4000-8000-00000000010a', '00000002-0000-4000-8000-000000000002', 5, 'My favorite breakfast!'),
        (uuid_generate_v4(), '0000010a-0000-4000-8000-00000000010a', '00000004-0000-4000-8000-000000000004', 5, 'Quick and healthy'),
        (uuid_generate_v4(), '0000010f-0000-4000-8000-00000000010f', '00000003-0000-4000-8000-000000000003', 5, 'Great for cheat day');
    `);
    console.log('Dish ratings seeded successfully');

    // Seed diet preferences
    console.log('Seeding diet preferences...');
    await dataSource.query(`
      INSERT INTO diet_preferences (id, user_id, preference_type, preference_value)
      VALUES
        (uuid_generate_v4(), '00000002-0000-4000-8000-000000000002', 'dietary_restriction', 'vegetarian'),
        (uuid_generate_v4(), '00000002-0000-4000-8000-000000000002', 'allergen', 'nuts'),
        (uuid_generate_v4(), '00000004-0000-4000-8000-000000000004', 'dietary_restriction', 'gluten-free'),
        (uuid_generate_v4(), '00000005-0000-4000-8000-000000000005', 'allergen', 'dairy'),
        (uuid_generate_v4(), '00000005-0000-4000-8000-000000000005', 'dietary_restriction', 'vegan');
    `);
    console.log('Diet preferences seeded successfully');

    console.log('===========================================');
    console.log('All seeding completed successfully!');
    console.log('===========================================');
    console.log('Summary:');
    console.log('- 10 dish categories');
    console.log('- 5 users with profiles');
    console.log('- 15 dishes with nutrition data');
    console.log('- Body measurements tracking');
    console.log('- Daily logs with meals');
    console.log('- Dish ratings and reviews');
    console.log('- Diet preferences and restrictions');
    console.log('===========================================');

    await dataSource.destroy();
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
