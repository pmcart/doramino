import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from './handler.js';

const validPrimary = { formType: 'primary', workEmail: 'a@example.com', company: 'Acme', firmType: 'Payment institution', role: 'COO', problem: 'Evidence is scattered.' };

function fakeClient({ error = null } = {}) {
  const calls = [];
  return { calls, emails: { send: async (params) => { calls.push(params); return { data: error ? null : { id: '1' }, error }; } } };
}

function postRequest(body) {
  return new Request('http://localhost/.netlify/functions/submit-lead', { method: 'POST', body: JSON.stringify(body) });
}

test('valid primary submission emails patrickmcart@gmail.com from onboarding@resend.dev', async () => {
  const client = fakeClient();
  const res = await createHandler(client)(postRequest(validPrimary));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(client.calls.length, 1);
  assert.equal(client.calls[0].to, 'patrickmcart@gmail.com');
  assert.equal(client.calls[0].from, 'onboarding@resend.dev');
});

test('honeypot filled skips send but still returns ok', async () => {
  const client = fakeClient();
  const res = await createHandler(client)(postRequest({ ...validPrimary, honeypot: 'x' }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(client.calls.length, 0);
});

test('missing required field returns 400 and does not send', async () => {
  const client = fakeClient();
  const res = await createHandler(client)(postRequest({ ...validPrimary, workEmail: '' }));
  assert.equal(res.status, 400);
  assert.equal((await res.json()).ok, false);
  assert.equal(client.calls.length, 0);
});

test('valid secondary submission sends with secondary content', async () => {
  const client = fakeClient();
  const res = await createHandler(client)(postRequest({ formType: 'secondary', workEmail: 'a@example.com', currentTools: 'Spreadsheets' }));
  assert.equal(res.status, 200);
  assert.equal(client.calls.length, 1);
});

test('unknown formType returns 400', async () => {
  const res = await createHandler(fakeClient())(postRequest({ formType: 'bogus' }));
  assert.equal(res.status, 400);
});

test('malformed JSON body returns 400', async () => {
  const req = new Request('http://localhost/.netlify/functions/submit-lead', { method: 'POST', body: '{not json' });
  const res = await createHandler(fakeClient())(req);
  assert.equal(res.status, 400);
});

test('resend error response returns 500', async () => {
  const client = fakeClient({ error: { message: 'invalid key' } });
  const res = await createHandler(client)(postRequest(validPrimary));
  assert.equal(res.status, 500);
  assert.equal((await res.json()).ok, false);
});
