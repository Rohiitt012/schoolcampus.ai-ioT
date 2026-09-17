import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { sendWhatsAppNotification, getWhatsAppLogs } from '../services/whatsappService.js';
import { prisma } from '../config/prisma.js';

const router = Router();

// GET WhatsApp dispatch logs
router.get('/logs', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), (req, res) => {
  res.json({ success: true, data: getWhatsAppLogs() });
});

// POST send test WhatsApp notification
router.post('/send-test', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { toPhone, parentName, studentName, messageType, customText } = req.body;

    const result = await sendWhatsAppNotification({
      toPhone: toPhone || '+919876543210',
      parentName: parentName || 'Parent',
      studentName: studentName || 'Student',
      messageType: messageType || 'CUSTOM_TEST',
      details: { customText },
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
