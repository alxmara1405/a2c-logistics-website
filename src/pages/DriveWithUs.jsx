import { Link } from 'react-router-dom'
import { DollarSign, Home, Heart, TrendingUp, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

            {/* Placeholder form — fields TBD by user */}
            <div className="bg-a2c-light-gray rounded-lg p-10 border border-a2c-gray/20 text-center">
              <p className="text-gray-500 mb-2 font-heading text-lg">Application Form</p>
              <p className="text-gray-400 text-sm mb-6">
                Form fields will be configured once the field list is provided.
              </p>
              <p className="text-gray-400 text-sm">
                Powered by Formspree — submissions sent directly to your email.
              </p>
            </div>

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
