import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, Home, Heart, TrendingUp, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import PageTransition from '@/components/sections/PageTransition'
import ScrollReveal from '@/components/sections/ScrollReveal'

const benefits = [
  {
    icon: DollarSign,
    title: 'Competitive Pay',
    description: 'Top-of-market compensation packages designed to reward hard work and dedication.',
  },
  {
    icon: Home,
    title: 'Home Time',
    description: 'We understand life off the road matters too. Consistent home time you can count on.',
  },
  {
    icon: Heart,
    title: 'Driver Support',
    description: 'A team that has your back — from dispatch to maintenance, we keep you moving.',
  },
  {
    icon: TrendingUp,
    title: 'Career Growth',
    description: 'Opportunities to grow within the ecosystem. Your success is our success.',
  },
]

const requirements = [
  'Valid Class A CDL',
  'Clean driving record',
  'Minimum 1 year OTR experience',
  'Pass DOT physical and drug screening',
  'Professional attitude and strong work ethic',
]

export default function DriveWithUs() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const data = new FormData(form)

    // TODO: Replace with your Formspree endpoint
    try {
      const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      if (response.ok) {
        setSubmitted(true)
        form.reset()
      }
    } catch {
      alert('Something went wrong. Please try again or contact us directly.')
    }
  }

  return (
    <PageTransition>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-a2c-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-a2c-red font-semibold text-sm tracking-widest uppercase mb-4">
              Careers
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading text-a2c-white">
              Drive With{' '}
              <span className="text-a2c-red">A2C</span>
            </h1>
            <p className="mt-6 text-lg text-a2c-gray max-w-2xl mx-auto leading-relaxed">
              Join a driver-first organization that values your experience, supports your
              career, and keeps you on the road safely.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-a2c-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-a2c-red font-semibold text-sm tracking-widest uppercase mb-3">
                Why Drive For Us
              </p>
              <h2 className="text-3xl sm:text-4xl text-a2c-black">
                Benefits of Joining A2C
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <ScrollReveal key={benefit.title} delay={i * 0.1}>
                <Card className="h-full border-a2c-gray/30 hover:border-a2c-red/30 transition-colors">
                  <CardContent className="p-8 text-center">
                    <benefit.icon className="w-10 h-10 text-a2c-red mx-auto mb-4" strokeWidth={1.5} />
                    <h3 className="text-lg font-heading text-a2c-black mb-3">{benefit.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-24 bg-a2c-light-gray">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-a2c-red font-semibold text-sm tracking-widest uppercase mb-3">
                Requirements
              </p>
              <h2 className="text-3xl sm:text-4xl text-a2c-black">
                What We're Looking For
              </h2>
            </div>

            <div className="bg-white rounded-lg p-8 border border-a2c-gray/20">
              <ul className="space-y-4">
                {requirements.map((req) => (
                  <li key={req} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-a2c-red flex-shrink-0" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-24 bg-a2c-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-a2c-red font-semibold text-sm tracking-widest uppercase mb-3">
                Apply Now
              </p>
              <h2 className="text-3xl sm:text-4xl text-a2c-black">
                Driver Application
              </h2>
              <p className="mt-4 text-gray-600">
                Fill out the form below and our team will be in touch.
              </p>
            </div>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                <p className="text-green-800 font-semibold text-lg mb-2">Application Submitted!</p>
                <p className="text-green-600">
                  Thank you for your interest in driving with A2C. Our team will review your
                  application and be in touch soon.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  variant="outline"
                  className="mt-4"
                >
                  Submit Another Application
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    required
                    className="border-a2c-gray/50 focus:border-a2c-red"
                  />
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
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    required
                    className="border-a2c-gray/50 focus:border-a2c-red"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience (CDL Class A)</Label>
                  <Select name="experience" required>
                    <SelectTrigger className="border-a2c-gray/50 focus:border-a2c-red">
                      <SelectValue placeholder="Select your experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="less-than-1">Less than 1 year</SelectItem>
                      <SelectItem value="1-2">1–2 years</SelectItem>
                      <SelectItem value="3-5">3–5 years</SelectItem>
                      <SelectItem value="5-10">5–10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-a2c-red hover:bg-a2c-red/90 text-white font-semibold py-6"
                >
                  Submit Application
                </Button>
              </form>
            )}

            <Separator className="my-12" />

            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Have questions about driving for A2C?
              </p>
              <Link to="/contact">
                <Button
                  variant="outline"
                  className="border-a2c-black text-a2c-black hover:bg-a2c-black hover:text-white"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageTransition>
  )
}
