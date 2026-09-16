import { prisma } from '../config/prisma.js';
import { getIO } from '../sockets/socketManager.js';

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type?: 'ATTENDANCE' | 'ALERT' | 'INFO';
  email?: string;
  phone?: string;
}

export class NotificationService {
  /**
   * Primary dispatcher emitting multi-channel notifications
   */
  static async sendNotification(payload: NotificationPayload) {
    const { userId, title, message, type = 'INFO', email, phone } = payload;

    // 1. In-App Notification (Database Record)
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        isRead: false,
      },
    });

    // 2. Real-time Socket.IO Broadcast
    try {
      const io = getIO();
      io.to(`user:${userId}`).emit('notification:new', notification);
    } catch (err) {
      // Socket not initialized or client disconnected
    }

    // 3. Email Channel Abstraction (Zero-cost demo fallback)
    if (email || process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
      this.sendEmail(email || 'parent@smartschool.com', title, message);
    }

    // 4. SMS Channel Abstraction (Zero-cost demo fallback)
    if (phone || process.env.ENABLE_SMS_NOTIFICATIONS === 'true') {
      this.sendSMS(phone || '+919876543210', `${title}: ${message}`);
    }

    // 5. WhatsApp Channel Abstraction
    this.sendWhatsApp(phone || '+919876543210', `${title}: ${message}`);

    // 6. Push Notification Abstraction
    this.sendPushNotification(userId, title, message);

    return notification;
  }

  static async sendEmail(to: string, subject: string, body: string) {
    console.log(`[NOTIFICATION SERVICE -> EMAIL] To: ${to} | Subject: "${subject}" | Body: "${body}"`);
    return { success: true, provider: 'SMTP_MOCK' };
  }

  static async sendSMS(to: string, message: string) {
    console.log(`[NOTIFICATION SERVICE -> SMS] To: ${to} | Message: "${message}"`);
    return { success: true, provider: 'TWILIO_MOCK' };
  }

  static async sendWhatsApp(to: string, message: string) {
    console.log(`[NOTIFICATION SERVICE -> WHATSAPP] To: ${to} | Message: "${message}"`);
    return { success: true, provider: 'WHATSAPP_API_MOCK' };
  }

  static async sendPushNotification(userId: string, title: string, body: string) {
    console.log(`[NOTIFICATION SERVICE -> WEBPUSH] User: ${userId} | Title: "${title}" | Body: "${body}"`);
    return { success: true, provider: 'FCM_WEBPUSH_MOCK' };
  }
}
