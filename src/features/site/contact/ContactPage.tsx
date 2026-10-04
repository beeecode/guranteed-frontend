import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { ContactForm } from './ContactForm';

export function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Let's Talk"
        title="Get In"
        highlight="Touch."
        waveWidth={160}
        description="We'd love to hear from you. Our friendly team is always ready to help."
        descriptionMaxWidthClassName="max-w-xl"
      />

      {/* Content */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="section-number mb-4">Contact Information</div>

              {[
                { icon: MapPin, title: 'Address', lines: ['14 Learning Lane,', 'Education District, Lagos State'] },
                { icon: Phone, title: 'Phone', lines: ['+234 801 234 5678', '+234 802 987 6543'] },
                { icon: Mail, title: 'Email', lines: ['info@gfms.edu.ng', 'admissions@gfms.edu.ng'] },
                { icon: Clock, title: 'Hours', lines: ['Monday – Friday: 7:30am – 4:00pm', 'Saturday: 9:00am – 12:00pm'] },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 mb-2">
                    <item.icon className="w-4 h-4" style={{ color: '#5C1010' }} />
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#7A5C3A' }}>{item.title}</span>
                  </div>
                  {item.lines.map((l, j) => <div key={j} className="text-sm pl-7" style={{ color: '#7A5C3A' }}>{l}</div>)}
                </div>
              ))}

              {/* Map placeholder */}
              <div className="mt-6 flex items-center justify-center h-44 bg-white" style={{ border: '1.5px dashed rgba(28,10,4,0.15)', borderRadius: 4 }}>
                <div className="text-center">
                  <MapPin className="w-6 h-6 mx-auto mb-2" style={{ color: '#5C1010' }} />
                  <p className="text-xs font-medium uppercase tracking-widest" style={{ color: '#7A5C3A' }}>Interactive Map</p>
                  <p className="text-xs mt-1" style={{ color: '#B8967A' }}>14 Learning Lane, Lagos</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="section-number mb-6">Send A Message</div>

              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
