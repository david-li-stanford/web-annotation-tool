import { Router, Request, Response } from 'express';
import { query } from '../database';
import { requireAuth } from '../auth';

const router = Router();

// Get all text excerpts (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT id, title, content, created_at FROM text_excerpts ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching text excerpts:', error);
    res.status(500).json({ error: 'Failed to fetch text excerpts' });
  }
});

// Get single text excerpt with annotations (public)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get text excerpt
    const textResult = await query('SELECT * FROM text_excerpts WHERE id = $1', [id]);
    if (textResult.rows.length === 0) {
      res.status(404).json({ error: 'Text excerpt not found' });
      return;
    }
    
    // Get annotations for this text
    const annotationsResult = await query(
      'SELECT * FROM annotations WHERE text_excerpt_id = $1 ORDER BY start_index',
      [id]
    );
    
    res.json({
      ...textResult.rows[0],
      annotations: annotationsResult.rows
    });
  } catch (error) {
    console.error('Error fetching text excerpt:', error);
    res.status(500).json({ error: 'Failed to fetch text excerpt' });
  }
});

// Create new text excerpt (protected)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }
    
    const result = await query(
      'INSERT INTO text_excerpts (title, content) VALUES ($1, $2) RETURNING *',
      [title, content]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating text excerpt:', error);
    res.status(500).json({ error: 'Failed to create text excerpt' });
  }
});

// Update text excerpt (protected)
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }
    
    const result = await query(
      'UPDATE text_excerpts SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [title, content, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Text excerpt not found' });
      return;
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating text excerpt:', error);
    res.status(500).json({ error: 'Failed to update text excerpt' });
  }
});

// Delete text excerpt (protected)
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM text_excerpts WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Text excerpt not found' });
      return;
    }
    
    res.json({ message: 'Text excerpt deleted successfully' });
  } catch (error) {
    console.error('Error deleting text excerpt:', error);
    res.status(500).json({ error: 'Failed to delete text excerpt' });
  }
});

export default router;