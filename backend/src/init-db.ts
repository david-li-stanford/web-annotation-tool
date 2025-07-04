import { query } from './database';

const createTables = async () => {
  try {
    // Create text_excerpts table
    await query(`
      CREATE TABLE IF NOT EXISTS text_excerpts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create annotations table
    await query(`
      CREATE TABLE IF NOT EXISTS annotations (
        id SERIAL PRIMARY KEY,
        text_excerpt_id INTEGER REFERENCES text_excerpts(id) ON DELETE CASCADE,
        start_index INTEGER NOT NULL,
        end_index INTEGER NOT NULL,
        selected_text TEXT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

createTables();