import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSpam, validatePrimary, validateSecondary, MAX_TEXT_LENGTH, MAX_FIELD_LENGTH } from './validate.js';

const validPrimary = { workEmail: 'a@example.com', company: 'Acme', firmType: 'Payment institution', role: 'COO', problem: 'Evidence is scattered.' };

test('isSpam true when honeypot filled', () => assert.equal(isSpam({ honeypot: 'x' }), true));
test('isSpam false when honeypot empty or missing', () => {
  assert.equal(isSpam({ honeypot: '' }), false);
  assert.equal(isSpam({}), false);
});

test('validatePrimary valid for complete fields', () => assert.equal(validatePrimary(validPrimary).valid, true));
test('validatePrimary rejects missing workEmail', () => {
  const r = validatePrimary({ ...validPrimary, workEmail: '' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some(e => e.includes('workEmail')));
});
test('validatePrimary rejects malformed workEmail', () => assert.equal(validatePrimary({ ...validPrimary, workEmail: 'not-an-email' }).valid, false));
test('validatePrimary rejects missing company/firmType/role/problem', () => {
  for (const field of ['company', 'firmType', 'role', 'problem']) {
    assert.equal(validatePrimary({ ...validPrimary, [field]: '' }).valid, false, field);
  }
});
test('validatePrimary rejects problem over MAX_TEXT_LENGTH', () => assert.equal(validatePrimary({ ...validPrimary, problem: 'x'.repeat(MAX_TEXT_LENGTH + 1) }).valid, false));
test('validatePrimary rejects company over MAX_FIELD_LENGTH', () => assert.equal(validatePrimary({ ...validPrimary, company: 'x'.repeat(MAX_FIELD_LENGTH + 1) }).valid, false));

test('validateSecondary valid with only workEmail', () => assert.equal(validateSecondary({ workEmail: 'a@example.com' }).valid, true));
test('validateSecondary rejects missing/malformed workEmail', () => {
  assert.equal(validateSecondary({ workEmail: '' }).valid, false);
  assert.equal(validateSecondary({ workEmail: 'nope' }).valid, false);
});
test('validateSecondary rejects optional field over MAX_TEXT_LENGTH', () => assert.equal(validateSecondary({ workEmail: 'a@example.com', currentTools: 'x'.repeat(MAX_TEXT_LENGTH + 1) }).valid, false));
