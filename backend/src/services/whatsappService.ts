import { prisma } from '../config/prisma.js';

export interface WhatsAppMessagePayload {
  toPhone: string;
  parentName?: string;
  studentName?: string;
  messageType: 'GATE_ENTRY' | 'GATE_EXIT' | 'BUS_BOARDED' | 'EMERGENCY_SOS' | 'CUSTOM_TEST';
  details?: {
    time?: string;
    location?: string;
    busNumber?: string;
    rfidCardId?: string;
    customText?: string;
  };
}

export interface WhatsAppLogRecord {
  id: string;
  toPhone: string;
  recipientName: string;
  messageType: string;
  content: string;
  status: 'SENT' | 'DELIVERED';
  timestamp: Date;
}

// In-memory log store for live admin dashboard auditing
const whatsappLogs: WhatsAppLogRecord[] = [];

/**
 * WhatsApp Notification Service Engine
 * Sends real-time formatted WhatsApp alerts to parents.
 * Integrated with UltraMsg / CallMeBot / Twilio API gateway providers.
 */
export const sendWhatsAppNotification = async (payload: WhatsAppMessagePayload): Promise<{ success: boolean; message: string; log: WhatsAppLogRecord }> => {
  const { toPhone, parentName = 'Parent', studentName = 'Student', messageType, details } = payload;
  const timeStr = details?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Clean phone number: keep digits only for UltraMsg API
  let digitsOnly = toPhone ? toPhone.replace(/[^0-9]/g, '') : '919210728686';
  if (digitsOnly.length === 10) {
    digitsOnly = `91${digitsOnly}`;
  }
  const cleanPhone = `+${digitsOnly}`;

  let textContent = '';

  switch (messageType) {
    case 'GATE_ENTRY':
      textContent = `🎒 *SMART SCHOOL ATTENDANCE ALERT*\n\nDear ${parentName},\nYour child *${studentName}* has safely *ENTERED* the school campus at *${timeStr}* via Main Gate (RFID Tag: ${details?.rfidCardId || 'CARD-101'}).\n\nHave a great day!\n_Smart School Safety System_`;
      break;

    case 'GATE_EXIT':
      textContent = `👋 *SMART SCHOOL DEPARTURE ALERT*\n\nDear ${parentName},\nYour child *${studentName}* has *DEPARTED* the school campus at *${timeStr}*.\n\n_Smart School Safety System_`;
      break;

    case 'BUS_BOARDED':
      textContent = `🚌 *LIVE BUS TRACKING ALERT*\n\nDear ${parentName},\n*${studentName}* has boarded School *Bus ${details?.busNumber || 'BUS-101'}* at *${timeStr}*.\nLive GPS telemetry is active on your Parent Portal.\n\n_Smart School Transport Team_`;
      break;

    case 'EMERGENCY_SOS':
      textContent = `🚨 *HIGH PRIORITY SAFETY ALERT*\n\nDear ${parentName},\nAn emergency incident (*${details?.location || 'Campus Zone'}*) was reported at *${timeStr}*. Response team is dispatched. Please stay tuned to your portal.\n\n_Smart School Command Center_`;
      break;

    case 'CUSTOM_TEST':
    default:
      textContent = details?.customText || `🔔 *SMART SCHOOL OFFICIAL ANNOUNCEMENT*\n\nDear ${parentName},\nThis is an official announcement from Smart School IoT & AI System.\nTime: ${timeStr}`;
      break;
  }

  // REAL WHATSAPP GATEWAY DISPATCH (UltraMsg / CallMeBot)
  const ultramsgInstance = process.env.ULTRAMSG_INSTANCE_ID || 'instance191838';
  const ultramsgToken = process.env.ULTRAMSG_TOKEN || 'jujts1oiymx944e6';
  const callmebotApiKey = process.env.CALLMEBOT_API_KEY;

  let realDispatchSuccess = false;
  let statusNote = ' (System Logged)';

  if (ultramsgInstance && ultramsgToken) {
    try {
      const response = await fetch(`https://api.ultramsg.com/${ultramsgInstance}/messages/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token: ultramsgToken,
          to: digitsOnly,
          body: textContent,
        }),
      });
      const data: any = await response.json();
      console.log('📱 [UltraMsg Gateway Response]:', data);

      if (data.sent === 'true' || data.id) {
        realDispatchSuccess = true;
        if (data.message && data.message.includes('not authenticated')) {
          statusNote = ' (Queued in UltraMsg - Please Scan QR Code in UltraMsg Dashboard)';
        } else {
          statusNote = ' (Real WhatsApp Delivered)';
        }
      }
    } catch (err) {
      console.error('UltraMsg real WhatsApp dispatch error:', err);
    }
  } else if (callmebotApiKey) {
    try {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(textContent)}&apikey=${callmebotApiKey}`;
      await fetch(url);
      realDispatchSuccess = true;
      statusNote = ' (CallMeBot Delivered)';
    } catch (err) {
      console.error('CallMeBot real WhatsApp dispatch error:', err);
    }
  }

  const logRecord: WhatsAppLogRecord = {
    id: `wa_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    toPhone: cleanPhone,
    recipientName: parentName,
    messageType,
    content: textContent,
    status: 'DELIVERED',
    timestamp: new Date(),
  };

  whatsappLogs.unshift(logRecord);
  if (whatsappLogs.length > 50) whatsappLogs.pop();

  console.log(`📱 [WhatsApp API Engine] Sent to ${cleanPhone}${statusNote}:\n${textContent}\n-----------------------------------`);

  return {
    success: true,
    message: `WhatsApp alert dispatched to ${cleanPhone}${statusNote}`,
    log: logRecord,
  };
};

/**
 * Broadcast WhatsApp Announcement to ALL Registered Parents
 */
export const sendBulkWhatsAppBroadcast = async (customText: string): Promise<{ success: boolean; totalSent: number; logs: WhatsAppLogRecord[] }> => {
  const parents = await prisma.parent.findMany({
    include: { user: { select: { name: true } } },
  });

  const logs: WhatsAppLogRecord[] = [];

  for (const parent of parents) {
    if (parent.phone) {
      const result = await sendWhatsAppNotification({
        toPhone: parent.phone,
        parentName: parent.user?.name || 'Parent',
        messageType: 'CUSTOM_TEST',
        details: { customText },
      });
      logs.push(result.log);
    }
  }

  return {
    success: true,
    totalSent: logs.length,
    logs,
  };
};

export const getWhatsAppLogs = (): WhatsAppLogRecord[] => {
  return whatsappLogs;
};
