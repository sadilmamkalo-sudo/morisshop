const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { ticketResponseEmail } = require('../utils/email');
const { protect, adminOnly, hasPermission } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { subject, message, priority } = req.body;
    const ticket = await Ticket.create({ user: req.user._id, subject, message, priority });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/mytickets', protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, adminOnly, hasPermission('manage_tickets'), async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;
    const tickets = await Ticket.find(query).populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('user', 'name email phone').populate('responses.user', 'name role');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.user._id.toString() !== req.user._id.toString() && req.user.role === 'client') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/status', protect, adminOnly, hasPermission('manage_tickets'), async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status, assignedTo }, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/respond', protect, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    ticket.responses.push({ user: req.user._id, message: req.body.message });
    if (req.user.role !== 'client' && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }
    await ticket.save();
    const user = await User.findById(ticket.user);
    if (user) ticketResponseEmail(ticket, user);
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
