const express = require('express');
const router = express.Router();
const Note = require('../models/Note.js');
const fetchuser = require('../middleware/fetchuser.js');
const { body, validationResult } = require('express-validator');

// Route-1; Get all the notes  using: GET "/api/notes/fetchallnotes" .  login require
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Internal server Error');
    }
});

// Route-2; Add your notes using: Post "/api/notes/addnote" .  login require
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 6 character').isLength({ min: 6 })
], async (req, res) => {
    try {
        const { title, description, tag } = req.body
        // If there are errors, return bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Internal server Error');
    }
})

// Route-3; update your notes using: Put "/api/notes/updatenote" .  login require
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        // Create a new Note object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };
        // Find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send('Not Allowed');
        }
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Internal server Error');
    }
})
// Route-4; Delete your notes using: Delete "/api/notes/deletenote" .  login require
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        // Find the note to be deleted and delete it
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }
        // Allow deletion only if user owns the account
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send('Not Allowed');
        }
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Sucess": "Note has been deleted", note: note });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Internal server Error');
    }
})
module.exports = router;