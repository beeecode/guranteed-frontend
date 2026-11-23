"use client"

/** Contact form that confirms only after the BFF acknowledges persistence. */

import { useState } from "react"
import { siteInputStyle, siteLabelClassName } from "../components/formStyles"
import { usePublicEnquiry } from "../components/usePublicEnquiry"
export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const { error, isSubmitting, submitted, submit } = usePublicEnquiry("contact")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submit({
      full_name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject,
      message: form.message,
    })
  }

  return submitted ? (
    <div
      className="text-center py-20 bg-white"
      style={{ border: "1px solid rgba(28,10,4,0.08)", borderRadius: 4 }}
    >
      <div
        className="font-display font-black text-7xl mb-4"
        style={{ color: "#5C1010" }}
      >
        ✓
      </div>
      <h3 className="font-display font-bold text-[#1C0A04] text-3xl mb-3">
        Message Sent!
      </h3>
      <p className="text-[#7A5C3A] text-sm">
        We'll get back to you within one business day.
      </p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={siteLabelClassName}>Full Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 text-sm focus:outline-none"
            style={siteInputStyle}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className={siteLabelClassName}>Email Address *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 text-sm focus:outline-none"
            style={siteInputStyle}
            placeholder="your@email.com"
          />
        </div>
      </div>
      <div>
        <label className={siteLabelClassName}>Phone Number *</label>
        <input
          type="tel"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full px-4 py-3 text-sm focus:outline-none"
          style={siteInputStyle}
          placeholder="+234 801 234 5678"
          autoComplete="tel"
        />
      </div>
      <div>
        <label className={siteLabelClassName}>Subject *</label>
        <select
          required
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full px-4 py-3 text-sm focus:outline-none"
          style={siteInputStyle}
        >
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
        <textarea
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={8}
          className="w-full px-4 py-3 text-sm focus:outline-none resize-none"
          style={siteInputStyle}
          placeholder="How can we help you?"
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-10 py-4 text-sm font-semibold text-white hover:opacity-90 transition-all disabled:cursor-not-allowed disabled:opacity-60"
        style={{ background: "#5C1010", borderRadius: 4 }}
      >
        {isSubmitting ? "Sending…" : "Send Message →"}
      </button>
    </form>
  )
}
