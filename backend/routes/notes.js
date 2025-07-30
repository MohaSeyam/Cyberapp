const express = require('express');
const { body, validationResult } = require('express-validator');
const { getRow, getAll, runQuery } = require('../config/database');

const router = express.Router();

// Validation middleware
const validateNote = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must be less than 255 characters'),
  body('content')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Content must be less than 10000 characters'),
  body('tags')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Tags must be less than 500 characters'),
  body('category')
    .optional()
    .isIn(['general', 'study', 'ideas', 'resources', 'personal'])
    .withMessage('Invalid category'),
  body('weekId')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Week ID must be between 1 and 50'),
  body('dayKey')
    .optional()
    .isIn(['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'])
    .withMessage('Invalid day key'),
  body('taskId')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Task ID must be less than 50 characters')
];

// Get all notes for current user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      category, 
      search, 
      weekId, 
      dayKey,
      sortBy = 'updated_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const validSortFields = ['created_at', 'updated_at', 'title', 'category'];
    const validSortOrders = ['ASC', 'DESC'];

    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sort field'
      });
    }

    if (!validSortOrders.includes(sortOrder.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sort order'
      });
    }

    // Build query
    let query = `
      SELECT id, title, content, tags, category, week_id, day_key, task_id, 
             is_favorite, is_pinned, created_at, updated_at
      FROM notes 
      WHERE user_id = ?
    `;
    const params = [userId];

    // Add filters
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (weekId) {
      query += ' AND week_id = ?';
      params.push(weekId);
    }

    if (dayKey) {
      query += ' AND day_key = ?';
      params.push(dayKey);
    }

    if (search) {
      query += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Add sorting and pagination
    query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const notes = await getAll(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM notes WHERE user_id = ?';
    const countParams = [userId];

    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    if (weekId) {
      countQuery += ' AND week_id = ?';
      countParams.push(weekId);
    }

    if (dayKey) {
      countQuery += ' AND day_key = ?';
      countParams.push(dayKey);
    }

    if (search) {
      countQuery += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const countResult = await getRow(countQuery, countParams);
    const total = countResult.total;

    res.json({
      success: true,
      data: {
        notes: notes.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content,
          tags: note.tags ? note.tags.split(',').map(tag => tag.trim()) : [],
          category: note.category,
          weekId: note.week_id,
          dayKey: note.day_key,
          taskId: note.task_id,
          isFavorite: Boolean(note.is_favorite),
          isPinned: Boolean(note.is_pinned),
          createdAt: note.created_at,
          updatedAt: note.updated_at
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notes'
    });
  }
});

// Get note by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const note = await getRow(
      `SELECT id, title, content, tags, category, week_id, day_key, task_id, 
              is_favorite, is_pinned, created_at, updated_at
       FROM notes 
       WHERE id = ? AND user_id = ?`,
      [noteId, userId]
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: note.id,
        title: note.title,
        content: note.content,
        tags: note.tags ? note.tags.split(',').map(tag => tag.trim()) : [],
        category: note.category,
        weekId: note.week_id,
        dayKey: note.day_key,
        taskId: note.task_id,
        isFavorite: Boolean(note.is_favorite),
        isPinned: Boolean(note.is_pinned),
        createdAt: note.created_at,
        updatedAt: note.updated_at
      }
    });

  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get note'
    });
  }
});

// Create new note
router.post('/', validateNote, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { 
      title, 
      content, 
      tags, 
      category = 'general',
      weekId,
      dayKey,
      taskId
    } = req.body;

    const result = await runQuery(
      `INSERT INTO notes (user_id, title, content, tags, category, week_id, day_key, task_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        content || '',
        tags ? tags.join(', ') : '',
        category,
        weekId || null,
        dayKey || null,
        taskId || null
      ]
    );

    const newNote = await getRow(
      'SELECT id, title, content, tags, category, week_id, day_key, task_id, created_at, updated_at FROM notes WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: {
        id: newNote.id,
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags ? newNote.tags.split(',').map(tag => tag.trim()) : [],
        category: newNote.category,
        weekId: newNote.week_id,
        dayKey: newNote.day_key,
        taskId: newNote.task_id,
        isFavorite: false,
        isPinned: false,
        createdAt: newNote.created_at,
        updatedAt: newNote.updated_at
      }
    });

  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create note'
    });
  }
});

// Update note
router.put('/:id', validateNote, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const noteId = req.params.id;
    const { 
      title, 
      content, 
      tags, 
      category,
      weekId,
      dayKey,
      taskId,
      isFavorite,
      isPinned
    } = req.body;

    // Check if note exists and belongs to user
    const existingNote = await getRow(
      'SELECT id FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Update note
    await runQuery(
      `UPDATE notes 
       SET title = ?, content = ?, tags = ?, category = ?, week_id = ?, day_key = ?, task_id = ?,
           is_favorite = ?, is_pinned = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [
        title,
        content || '',
        tags ? tags.join(', ') : '',
        category || 'general',
        weekId || null,
        dayKey || null,
        taskId || null,
        isFavorite ? 1 : 0,
        isPinned ? 1 : 0,
        noteId,
        userId
      ]
    );

    const updatedNote = await getRow(
      'SELECT id, title, content, tags, category, week_id, day_key, task_id, is_favorite, is_pinned, created_at, updated_at FROM notes WHERE id = ?',
      [noteId]
    );

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: {
        id: updatedNote.id,
        title: updatedNote.title,
        content: updatedNote.content,
        tags: updatedNote.tags ? updatedNote.tags.split(',').map(tag => tag.trim()) : [],
        category: updatedNote.category,
        weekId: updatedNote.week_id,
        dayKey: updatedNote.day_key,
        taskId: updatedNote.task_id,
        isFavorite: Boolean(updatedNote.is_favorite),
        isPinned: Boolean(updatedNote.is_pinned),
        createdAt: updatedNote.created_at,
        updatedAt: updatedNote.updated_at
      }
    });

  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update note'
    });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    // Check if note exists and belongs to user
    const existingNote = await getRow(
      'SELECT id FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    await runQuery(
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete note'
    });
  }
});

// Toggle favorite status
router.patch('/:id/favorite', async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const note = await getRow(
      'SELECT id, is_favorite FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    const newFavoriteStatus = !note.is_favorite;

    await runQuery(
      'UPDATE notes SET is_favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newFavoriteStatus ? 1 : 0, noteId]
    );

    res.json({
      success: true,
      message: `Note ${newFavoriteStatus ? 'added to' : 'removed from'} favorites`,
      data: {
        isFavorite: newFavoriteStatus
      }
    });

  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle favorite status'
    });
  }
});

// Toggle pinned status
router.patch('/:id/pin', async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const note = await getRow(
      'SELECT id, is_pinned FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    const newPinnedStatus = !note.is_pinned;

    await runQuery(
      'UPDATE notes SET is_pinned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPinnedStatus ? 1 : 0, noteId]
    );

    res.json({
      success: true,
      message: `Note ${newPinnedStatus ? 'pinned' : 'unpinned'}`,
      data: {
        isPinned: newPinnedStatus
      }
    });

  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle pin status'
    });
  }
});

// Get notes by week and day
router.get('/week/:weekId/day/:dayKey', async (req, res) => {
  try {
    const userId = req.user.id;
    const { weekId, dayKey } = req.params;

    const notes = await getAll(
      `SELECT id, title, content, tags, category, task_id, is_favorite, is_pinned, created_at, updated_at
       FROM notes 
       WHERE user_id = ? AND week_id = ? AND day_key = ?
       ORDER BY is_pinned DESC, updated_at DESC`,
      [userId, weekId, dayKey]
    );

    res.json({
      success: true,
      data: notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        tags: note.tags ? note.tags.split(',').map(tag => tag.trim()) : [],
        category: note.category,
        taskId: note.task_id,
        isFavorite: Boolean(note.is_favorite),
        isPinned: Boolean(note.is_pinned),
        createdAt: note.created_at,
        updatedAt: note.updated_at
      }))
    });

  } catch (error) {
    console.error('Get notes by week/day error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notes'
    });
  }
});

// Get notes by task
router.get('/task/:taskId', async (req, res) => {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;

    const notes = await getAll(
      `SELECT id, title, content, tags, category, week_id, day_key, is_favorite, is_pinned, created_at, updated_at
       FROM notes 
       WHERE user_id = ? AND task_id = ?
       ORDER BY is_pinned DESC, updated_at DESC`,
      [userId, taskId]
    );

    res.json({
      success: true,
      data: notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        tags: note.tags ? note.tags.split(',').map(tag => tag.trim()) : [],
        category: note.category,
        weekId: note.week_id,
        dayKey: note.day_key,
        isFavorite: Boolean(note.is_favorite),
        isPinned: Boolean(note.is_pinned),
        createdAt: note.created_at,
        updatedAt: note.updated_at
      }))
    });

  } catch (error) {
    console.error('Get notes by task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notes'
    });
  }
});

module.exports = router;