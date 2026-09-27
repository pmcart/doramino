import { Resend } from 'resend';
import { createHandler } from './lib/handler.js';

export default createHandler(new Resend(process.env.RESEND_API_KEY));
