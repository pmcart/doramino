import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPrimaryEmail, buildSecondaryEmail } from './email.js';

test('buildPrimaryEmail includes all submitted fields', () => {
  const { subject, text } = buildPrimaryEmail({ workEmail: 'a@example.com', company: 'Acme', firmType: 'Payment institution', role: 'COO', problem: 'Evidence is scattered.' });
  assert.match(subject, /Acme/);
  for (const value of ['a@example.com', 'Acme', 'Payment institution', 'COO', 'Evidence is scattered.']) {
    assert.ok(text.includes(value), value);
  }
});

test('buildSecondaryEmail includes submitted fields and tags the email', () => {
  const { subject, text } = buildSecondaryEmail({ workEmail: 'a@example.com', currentTools: 'Spreadsheets', itProvider: 'Acme Cloud', nextExercise: 'Q4 recovery test' });
  assert.match(subject, /a@example\.com/);
  for (const value of ['a@example.com', 'Spreadsheets', 'Acme Cloud', 'Q4 recovery test']) {
    assert.ok(text.includes(value), value);
  }
});
