import { Router, Request, Response } from 'express';
import { query } from '../database';

const router = Router();

// Get annotations for a specific text excerpt
router.get('/text/:textId', async (req: Request, res: Response) => {
  try {
    const { textId } = req.params;
    
    const result = await query(
      'SELECT * FROM annotations WHERE text_excerpt_id = $1 ORDER BY start_index',
      [textId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching annotations:', error);
    res.status(500).json({ error: 'Failed to fetch annotations' });
  }
});

// Create new annotation
router.post('/', async (req: Request, res: Response) => {
  try {
    const { text_excerpt_id, start_index, end_index, selected_text, comment } = req.body;
    
    if (!text_excerpt_id || start_index === undefined || end_index === undefined || !selected_text) {
      res.status(400).json({ 
        error: 'text_excerpt_id, start_index, end_index, and selected_text are required' 
      });
      return;
    }
    
    // Verify text excerpt exists
    const textCheck = await query('SELECT id FROM text_excerpts WHERE id = $1', [text_excerpt_id]);
    if (textCheck.rows.length === 0) {
      res.status(404).json({ error: 'Text excerpt not found' });
      return;
    }
    
    const result = await query(
      'INSERT INTO annotations (text_excerpt_id, start_index, end_index, selected_text, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [text_excerpt_id, start_index, end_index, selected_text, comment]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating annotation:', error);
    res.status(500).json({ error: 'Failed to create annotation' });
  }
});

// Update annotation
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    
    const result = await query(
      'UPDATE annotations SET comment = $1 WHERE id = $2 RETURNING *',
      [comment, id]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Annotation not found' });
      return;
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating annotation:', error);
    res.status(500).json({ error: 'Failed to update annotation' });
  }
});

// Delete annotation
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM annotations WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Annotation not found' });
      return;
    }
    
    res.json({ message: 'Annotation deleted successfully' });
  } catch (error) {
    console.error('Error deleting annotation:', error);
    res.status(500).json({ error: 'Failed to delete annotation' });
  }
});

export default router;