'use client';

import { useState } from 'react';
import { siteInputStyle, siteLabelClassName } from '../components/formStyles';

const classOptions = ['Pre-Primary (Nursery)', 'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'Junior Secondary 1', 'Junior Secondary 2', 'Junior Secondary 3'];

/** Admission enquiry form with a local "Thank You" confirmation. */
export function AdmissionsForm() {
  const [formData, setFormData] = useState({ name: '', parent: '', email: '', phone: '', class: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); };

  return (
    submitted ? (
      <div className="text-center py-16 bg-white" style={{ border: '1px solid rgba(28,10,4,0.08)', borderRadius: 4 }}>
        <div className="font-display font-black text-6xl mb-4" style={{ color: '#5C1010' }}>✓</div>
        <h3 className="font-display font-bold text-[#1C0A04] text-3xl mb-3">Thank You!</h3>
        <p className="text-[#7A5C3A] text-sm">We've received your enquiry. Our team will reach out within 24 hours.</p>
      </div>
    ) : (
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div><label className={siteLabelClassName}>Child's Full Name *</label><input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 text-sm focus:outline-none focus:ring-2" style={{ ...siteInputStyle, '--tw-ring-color': '#5C1010' } as React.CSSProperties} placeholder="e.g. Amara Johnson" /></div>
          <div><label className={siteLabelClassName}>Parent / Guardian *</label><input type="text" required value={formData.parent} onChange={e => setFormData({ ...formData, parent: e.target.value })} className="w-full px-4 py-3 text-sm focus:outline-none" style={siteInputStyle} placeholder="e.g. Mrs. Ngozi Johnson" /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div><label className={siteLabelClassName}>Email Address *</label><input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 text-sm focus:outline-none" style={siteInputStyle} placeholder="your@email.com" /></div>
          <div><label className={siteLabelClassName}>Phone Number *</label><input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 text-sm focus:outline-none" style={siteInputStyle} placeholder="+234 801 234 5678" /></div>
        </div>
        <div>
          <label className={siteLabelClassName}>Class Applying For *</label>
          <select required value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })} className="w-full px-4 py-3 text-sm focus:outline-none" style={siteInputStyle}>
            <option value="">Select a class...</option>
            {classOptions.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={siteLabelClassName}>Additional Message</label>
          <textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={5} className="w-full px-4 py-3 text-sm focus:outline-none resize-none" style={siteInputStyle} placeholder="Any questions or special requirements..." />
        </div>
        <button type="submit" className="px-10 py-4 text-sm font-semibold text-white hover:opacity-90 transition-all" style={{ background: '#5C1010', borderRadius: 4 }}>
          Submit Application →
        </button>
      </form>
    )
  );
}
