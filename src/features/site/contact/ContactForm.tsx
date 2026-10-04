'use client';

import { useState } from 'react';
import { siteInputStyle, siteLabelClassName } from '../components/formStyles';

/** Contact form with a local "Message Sent" confirmation. */
export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSent(true); };

  return (
    sent ? (
      <div className="text-center py-20 bg-white" style={{ border: '1px solid rgba(28,10,4,0.08)', borderRadius: 4 }}>
        <div className="font-display font-black text-7xl mb-4" style={{ color: '#5C1010' }}>✓</div>
        <h3 className="font-display font-bold text-[#1C0A04] text-3xl mb-3">Message Sent!</h3>
        <p className="text-[#7A5C3A] text-sm">We'll get back to you within one business day.</p>
      </div>
    ) : (
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div><label className={siteLabelClassName}>Full Name *</label><input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 text-sm focus:outline-none" style={siteInputStyle} placeholder="Your full name" /></div>
          <div><label className={siteLabelClassName}>Email Address *</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 text-sm focus:outline-none" style={siteInputStyle} placeholder="your@email.com" /></div>
        </div>
        <div>
          <label className={siteLabelClassName}>Subject *</label>
          <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-3 text-sm focus:outline-none" style={siteInputStyle}>
            <option value="">Select a subject...</option>
            <option>Admission Enquiry</option>
            <option>Fee Information</option>
            <option>CBT Portal Support</option>
            <option>General Enquiry</option>
            <option>Partnership / Collaboration</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className={siteLabelClassName}>Message *</label>
          <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={8} className="w-full px-4 py-3 text-sm focus:outline-none resize-none" style={siteInputStyle} placeholder="How can we help you?" />
        </div>
        <button type="submit" className="px-10 py-4 text-sm font-semibold text-white hover:opacity-90 transition-all" style={{ background: '#5C1010', borderRadius: 4 }}>
          Send Message →
        </button>
      </form>
    )
  );
}
