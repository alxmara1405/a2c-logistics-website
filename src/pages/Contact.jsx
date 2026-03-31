import { useState } from 'react'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import PageTransition from '@/components/sections/PageTransition'
import ScrollReveal from '@/components/sections/ScrollReveal'

const contactInfo = [
  { icon: Phone, label: 'Phone', value: '(XXX) XXX-XXXX', href: 'tel:' },
  { icon: Mail, label: 'Email', value: 'info@a2clogistics.com', href: 'mailto:info@a2clogistics.com' },
  { icon: MapPin, label: 'Location', value: 'Lincoln, NE', href: null },
  { icon: Clock, label: 'Hours', value: 'Mon–Fri: 8AM–6PM', href: null },
]

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const data = new FormData(form)

    // TODO: Replace with your Formspree endpoint
    // Example: https://formspree.io/f/mvzvrleo
    try {
      const response = await fetch('https://formspree.io/f/mvzvrleo', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      if (response.ok) {
        setSubmitted(true)
        form.reset()
      }
    } catch {
      alert('Something went wrong. Please try again or email us directly.')
    }
  }

  return (
    <PageTransition>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-a2c-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-a2c-red font-semibold text-sm tracking-widest uppercase mb-4">
              Contact
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading text-a2c-white">
              Let's <span className="text-a2c-red">Talk</span>
            </h1>
            <p className="mt-6 text-lg text-a2c-gray max-w-2xl mx-auto leading-relaxed">
              Have a question, need a quote, or want to learn more? Reach out and we'll
              get back to you quickly.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-24 bg-a2c-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Contact Info */}
            <ScrollReveal>
              <div>
                <p className="text-a2c-red font-semibold text-sm tracking-widest uppercase mb-3">
                  Get In Touch
                </p>
                <h2 className="text-3xl font-heading text-a2c-black mb-8">
                  Contact Information
                </h2>

                <div className="space-y-6">
                  {contactInfo.map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-a2c-black flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-a2c-red" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 uppercase tracking-wider">{item.label}</p>
                        {item.href ? (
                          <a
                            href={item.href + (item.href.includes(':') ? item.value : '')}
                            className="text-a2c-black font-medium hover:text-a2c-red transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-a2c-black font-medium">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Contact Form */}
            <ScrollReveal delay={0.15}>
              <div>
                <p className="text-a2c-red font-semibold text-sm tracking-widest uppercase mb-3">
                  Send a Message
                </p>
                <h2 className="text-3xl font-heading text-a2c-black mb-8">
                  Q&A Form
                </h2>

                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                    <p className="text-green-800 font-semibold text-lg mb-2">Message Sent!</p>
                    <p className="text-green-600">
                      Thank you for reaching out. We'll get back to you shortly.
                    </p>
                    <Button
                      onClick={() => setSubmitted(false)}
                      variant="outline"
                      className="mt-4"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="John"
                          required
                          className="border-a2c-gray/50 focus:border-a2c-red"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Doe"
                          required
                          className="border-a2c-gray/50 focus:border-a2c-red"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        className="border-a2c-gray/50 focus:border-a2c-red"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone (optional)</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="border-a2c-gray/50 focus:border-a2c-red"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="Quote Request, General Inquiry, etc."
                        required
                        className="border-a2c-gray/50 focus:border-a2c-red"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us how we can help..."
                        rows={5}
                        required
                        className="border-a2c-gray/50 focus:border-a2c-red resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-a2c-red hover:bg-a2c-red/90 text-white font-semibold py-6"
                    >
                      Send Message
                    </Button>
                  </form>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
