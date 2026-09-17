import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { sendWhatsAppNotification, getWhatsAppLogs, sendBulkWhatsAppBroadcast } from '../services/whatsappService.js';
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

// POST broadcast WhatsApp announcement to ALL registered parents
router.post('/broadcast', authenticateJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { customText } = req.body;

    if (!customText) {
      res.status(400).json({ success: false, message: 'Announcement text is required' });
      return;
    }

    const result = await sendBulkWhatsAppBroadcast(customText);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
