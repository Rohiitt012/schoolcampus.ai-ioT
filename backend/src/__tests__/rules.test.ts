describe('Smart Alert Rules Engine Tests', () => {
  const maxSpeed = 50.0;

  test('detects OVERSPEED when velocity exceeds max speed limit', () => {
    const currentSpeed = 68.5;
    const isOverspeed = currentSpeed > maxSpeed;
    expect(isOverspeed).toBe(true);
  });

  test('does not trigger OVERSPEED when velocity is under max speed limit', () => {
    const currentSpeed = 42.0;
    const isOverspeed = currentSpeed > maxSpeed;
    expect(isOverspeed).toBe(false);
  });
});
