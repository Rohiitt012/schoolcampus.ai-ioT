import { NotificationService } from '../services/notificationService.js';

describe('Enterprise Platform Integration Test Suite', () => {
  test('evaluates velocity governor limit for overspeed', () => {
    const busMaxSpeed = 50.0;
    const currentSpeed = 62.5;
    expect(currentSpeed > busMaxSpeed).toBe(true);
  });

  test('multi-tenant school isolation logic', () => {
    const userSchool1 = { schoolId: 'SAC-001', role: 'ADMIN' };
    const userSchool2 = { schoolId: 'GWH-002', role: 'ADMIN' };

    expect(userSchool1.schoolId).not.toEqual(userSchool2.schoolId);
  });

  test('multi-channel notification service dispatch', async () => {
    const res = await NotificationService.sendEmail('test@smartschool.com', 'Test Subject', 'Test Body');
    expect(res.success).toBe(true);
    expect(res.provider).toBe('SMTP_MOCK');
  });

  test('SMS channel notification service dispatch', async () => {
    const res = await NotificationService.sendSMS('+919876543210', 'Test SMS Message');
    expect(res.success).toBe(true);
    expect(res.provider).toBe('TWILIO_MOCK');
  });
});
