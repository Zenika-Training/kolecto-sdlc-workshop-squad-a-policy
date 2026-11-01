import { NotImplementedError } from './not-implemented.js';
import type { Customer, Invoice, Payment } from './types.js';

export interface DecideReminderInput {
  invoice: Invoice;
  /** Every payment received for this invoice, whatever its date. */
  payments: Payment[];
  customer: Customer;
  /** Reference day, YYYY-MM-DD (never the system clock: decision D-06). */
  today: string;
}

/**
 * The decision for one invoice and one day. Its exact shape is yours to define in your spec and publish
 * in the `reminder-decision` contract: squad B consumes it field for field.
 */
export type ReminderDecision = Record<string, unknown>;

/**
 * Squad A · Policy. Business rules RR-01 to RR-05; exact expected outputs in the reference cases.
 * Reuse Core Billing (src/billing/) where it already does the job: `npm run graph`, then `graphify query`.
 */
export function decideReminder(input: DecideReminderInput): ReminderDecision {
  void input;
  throw new NotImplementedError('decideReminder');
}
