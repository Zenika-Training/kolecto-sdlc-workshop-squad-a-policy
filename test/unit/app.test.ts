import { describe, expect, it } from 'vitest';
import { buildApp } from '../../src/app.js';

const on = { reminders_policy_decision: true };
const off = { reminders_policy_decision: false };
const url = (id: string, today = '2026-11-20') => `/v1/invoices/${id}/reminder-decision?today=${today}`;

describe('starter squad-a-policy', () => {
  it('answers /health with the squad and its flags', async () => {
    const res = await buildApp({ flags: off }).inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: 'ok', squad: 'squad-a-policy', flags: off });
  });

  it('hides the route while the flag is off', async () => {
    const res = await buildApp({ flags: off }).inject({ method: 'GET', url: url('inv_0005') });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ code: 'REMINDER_FEATURE_DISABLED' });
  });

  it('rejects a missing or malformed today (SEC-04)', async () => {
    const res = await buildApp({ flags: on }).inject({ method: 'GET', url: url('inv_0005', '20/11/2026') });
    expect(res.statusCode).toBe(400);
  });

  it('returns 404 for an unknown invoice', async () => {
    const res = await buildApp({ flags: on }).inject({ method: 'GET', url: url('inv_9999') });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ code: 'REMINDER_INVOICE_NOT_FOUND' });
  });

  // Starter behaviour: replace this test once decideReminder is implemented.
  it('answers 501 while decideReminder is a stub', async () => {
    const res = await buildApp({ flags: on }).inject({ method: 'GET', url: url('inv_0005') });
    expect(res.statusCode).toBe(501);
  });

  it('counts requests in /metrics', async () => {
    const app = buildApp({ flags: off });
    await app.inject({ method: 'GET', url: '/health' });
    const res = await app.inject({ method: 'GET', url: '/metrics' });
    expect(res.json().requests).toMatchObject({ '/health 200': 1 });
  });
});
