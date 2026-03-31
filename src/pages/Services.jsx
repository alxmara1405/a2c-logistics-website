import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Truck, Wrench, Route, DollarSign, ShieldCheck, Headphones } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PageTransition from '@/components/sections/PageTransition'
import ScrollReveal from '@/components/sections/ScrollReveal'

const services = [
  {
    icon: Truck,
    title: 'Consistent Freight',
    description:
      'Steady loads and well-planned lanes so you spend more time earning and less time waiting.',
  },
  {
    icon: Route,
    title: 'Dispatch Support',
    description:
      'Experienced dispatch that works with you — not against you. Optimized routes, clear communication, no surprises.',
  },
  {
    icon: DollarSign,
    title: 'Competitive Pay',
    description:
      'Transparent, top-of-market compensation. You know what you\'re earning and when you\'re getting paid.',
  },
  {
    icon: Wrench,
    title: 'Maintenance Support',
    description:
      'Keep your truck on the road with access to reliable repair and maintenance services when you need them.',
  },
  {
    icon: ShieldCheck,
    title: 'Safety & Compliance',
    description:
      'DOT compliance, safety support, and a team that prioritizes keeping you safe on every run.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description:
      'Round-the-clock access to your team. Whether it\'s a breakdown or a question, someone always picks up.',
  },
]

const whyUs = [
  'Founded by drivers who\'ve been in your seat',
  'Direct, honest communication — no runaround',
  'We invest in our drivers because your success is ours',
  'A company that treats you like a professional, not a number',
]

export default function Services() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-a2c-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-a2c-red font-semibold text-sm tracking-widest uppercase mb-4">
              What We Offer
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading text-a2c-white">
              Support That Keeps You{' '}
              <span className="text-a2c-red">Moving</span>
            </h1>
            <p className="mt-6 text-lg text-a2c-gray max-w-2xl mx-auto leading-relaxed">
              From steady freight to 24/7 support, we provide everything you need to
              focus on what you do best — driving.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-a2c-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <ScrollReveal key={service.title} delay={i * 0.08}>
                <motion.div whileHover={{ y: -6, transition: { duration: 0.3 } }}>
                  <Card className="h-full border-a2c-gray/30 hover:border-a2c-red/40 transition-colors">
                    <CardContent className="p-8">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-a2c-black mb-5">
                        <service.icon className="w-7 h-7 text-a2c-red" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-lg font-heading text-a2c-black mb-3">{service.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why A2C */}
      <section className="py-24 bg-a2c-light-gray">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <p className="text-a2c-red font-semibold text-sm tracking-widest uppercase mb-3">
                Why A2C
              </p>
              <h2 className="text-3xl sm:text-4xl text-a2c-black mb-8">
                Not Your Average Trucking Company
              </h2>
              <ul className="space-y-4">
                {whyUs.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-a2c-red flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <img
                src={`${import.meta.env.BASE_URL}assets/images/truck-highway.jpg`}
                alt="A2C truck on the highway"
                className="aspect-[4/3] object-cover rounded-lg w-full"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-a2c-black text-center">
        <div className="max-w-3xl mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-heading text-a2c-white mb-4">
              Ready to Join the Team?
            </h2>
            <p className="text-a2c-gray mb-8">
              Apply today and see why drivers choose A2C.
            </p>
            <Link to="/drive-with-us">
              <Button
                size="lg"
                className="bg-a2c-red hover:bg-a2c-red/90 text-white font-semibold px-8 py-6 text-base"
              >
                Drive With Us
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </PageTransition>
  )
}
