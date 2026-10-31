// Reference tests · READ-ONLY (ENG-04). Generated from the business's acceptance examples in the Context Nexus.
import { describe, expect, it } from 'vitest';
import { decideReminder, type DecideReminderInput } from '../../src/domain/decide-reminder.js';
import { loadReferenceCases } from './load-cases.js';

const cases = loadReferenceCases();

describe(`reference cases ${cases.version} · decideReminder`, () => {
  for (const c of cases.decideReminder) {
    it(c.name, () => {
      expect(decideReminder(c.input as DecideReminderInput)).toEqual(c.expected);
    });
  }
});
