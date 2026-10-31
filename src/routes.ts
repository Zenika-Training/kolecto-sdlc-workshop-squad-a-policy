import type { FastifyInstance } from 'fastify';
import { FLAG } from './config.js';
import { customers, invoices, payments } from './data.js';
import { decideReminder } from './domain/decide-reminder.js';
import { NotImplementedError } from './domain/not-implemented.js';
import { sendError } from './errors.js';
import { isEnabled, type Flags } from './flags.js';

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Squad A route, described by teams/squad-a-policy/contracts/reminder-decision.md. */
export function registerRoutes(app: FastifyInstance, flags: Flags): void {
  app.get<{ Params: { invoiceId: string }; Querystring: { today?: string } }>('/v1/invoices/:invoiceId/reminder-decision', async (request, reply) => {
    if (!isEnabled(flags, FLAG)) return sendError(reply, 404, 'REMINDER_FEATURE_DISABLED', `Feature disabled (flag ${FLAG})`);
    const today = request.query.today;
    if (!today || !DAY.test(today)) return sendError(reply, 400, 'REMINDER_INVALID_TODAY', 'Query parameter today=YYYY-MM-DD is required');
    const invoice = invoices().find((i) => i.id === request.params.invoiceId);
    if (!invoice) return sendError(reply, 404, 'REMINDER_INVOICE_NOT_FOUND', 'Unknown invoice', { invoiceId: request.params.invoiceId });
    const customer = customers().find((c) => c.id === invoice.customerId);
    if (!customer) return sendError(reply, 500, 'REMINDER_DATA_INCONSISTENT', 'Invoice without customer', { invoiceId: invoice.id });
    try {
      return decideReminder({ invoice, payments: payments().filter((p) => p.invoiceId === invoice.id), customer, today });
    } catch (error) {
      if (error instanceof NotImplementedError) return sendError(reply, 501, 'REMINDER_NOT_IMPLEMENTED', error.message);
      throw error;
    }
  });
}
