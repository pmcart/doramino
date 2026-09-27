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

test('buildPrimaryEmail strips CR/LF from the subject line even if a field contains them', () => {
  const { subject } = buildPrimaryEmail({ workEmail: 'a@example.com', company: 'Acme\r\nBcc: evil@example.com', firmType: 'Payment institution', role: 'COO', problem: 'Evidence is scattered.' });
  assert.doesNotMatch(subject, /[\r\n]/);
});

test('buildSecondaryEmail strips CR/LF from the subject line even if workEmail contains them', () => {
  const { subject } = buildSecondaryEmail({ workEmail: 'a@example.com\r\nBcc: evil@example.com' });
  assert.doesNotMatch(subject, /[\r\n]/);
});

test('buildPrimaryEmail keeps ordinary newlines in the body text readable', () => {
  const { text } = buildPrimaryEmail({ workEmail: 'a@example.com', company: 'Acme', firmType: 'Payment institution', role: 'COO', problem: 'Line one\nLine two' });
  assert.ok(text.includes('Line one\nLine two'));
});
