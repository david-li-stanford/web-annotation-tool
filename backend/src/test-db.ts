import { query, getClient } from './database';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  console.log('Testing database connection...');
  console.log('Database config:');
  console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`Port: ${process.env.DB_PORT || '5432'}`);
  console.log(`Database: ${process.env.DB_NAME || 'text_annotation'}`);
  console.log(`User: ${process.env.DB_USER || 'postgres'}`);
  console.log('---');

  try {
    // Test basic connection
    const result = await query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Database connection successful!');
    console.log('Current time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].pg_version);
    
    // Test if our tables exist
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('text_excerpts', 'annotations')
    `);
    
    console.log('\n📋 Tables status:');
    if (tablesResult.rows.length === 0) {
      console.log('❌ No tables found. Run: npm run init-db');
    } else {
      tablesResult.rows.forEach(row => {
        console.log('✅', row.table_name);
      });
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.log('\n💡 PostgreSQL server is not running. To fix this:');
        console.log('1. Install PostgreSQL: sudo apt update && sudo apt install postgresql postgresql-contrib');
        console.log('2. Start PostgreSQL: sudo service postgresql start');
        console.log('3. Create database: sudo -u postgres createdb text_annotation');
        console.log('4. Set password: sudo -u postgres psql -c "ALTER USER postgres PASSWORD \'password\';"');
      } else if (error.message.includes('database') && error.message.includes('does not exist')) {
        console.log('\n💡 Database does not exist. Create it with:');
        console.log('sudo -u postgres createdb text_annotation');
      }
    }
  }
  
  process.exit(0);
};

testConnection();