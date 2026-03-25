import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Truck, Shield, Clock, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PageTransition from '@/components/sections/PageTransition'
import ScrollReveal from '@/components/sections/ScrollReveal'
import Hero from '@/components/sections/Hero'

const services = [
  {
    icon: Truck,
    title: 'Steady Miles',
    description: 'Consistent freight and well-planned routes so you can focus on driving — not chasing loads.',
  },
  {
    icon: Shield,
    title: 'We Have Your Back',
    description: 'From dispatch to maintenance, our team supports you with real accountability — no runaround.',
  },
  {
    icon: Clock,
    title: 'Respect Your Time',
    description: 'Efficient scheduling, fast communication, and a company that values your time on and off the road.',
  },
  {
    icon: Users,
    title: 'Built by Drivers',
    description: 'Founded by people who\'ve been behind the wheel. We understand the realities you face every day.',
  },
]

const stats = [
  { number: '24/7', label: 'Operations' },
  { number: '100%', label: 'Commitment' },
  { number: '0', label: 'Excuses' },
]

export default function Home() {
  return (
    <PageTransition>
      <Hero />

      {/* Services Section */}
      <section className="py-24 bg-a2c-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-a2c-red font-semibold text-sm tracking-widest uppercase mb-3">
                Why A2C
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl text-a2c-black">
                A Better Place to Drive
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <ScrollReveal key={service.title} delay={i * 0.1}>
                <motion.div whileHover={{ y: -8, transition: { duration: 0.3 } }}>
                  <Card className="h-full border-a2c-gray/30 hover:border-a2c-red/30 transition-colors bg-white">
                    <CardContent className="p-8">
                      <service.icon className="w-10 h-10 text-a2c-red mb-4" strokeWidth={1.5} />
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

      {/* Stats Section */}
      <section className="py-20 bg-a2c-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            {stats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 0.15}>
                <div>
                  <p className="text-4xl sm:text-5xl md:text-6xl font-heading text-a2c-red">
                    {stat.number}
                  </p>
                  <p className="mt-2 text-sm sm:text-base text-a2c-gray uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-a2c-light-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-a2c-black mb-6">
              Ready to <span className="text-a2c-red">Drive</span> With Us?
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Whether you're a company driver looking for a better home or an owner-operator
              ready to grow, we're ready to talk.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/drive-with-us">
                <Button
                  size="lg"
                  className="bg-a2c-red hover:bg-a2c-red/90 text-white font-semibold px-8 py-6 text-base"
                >
                  Join Our Team
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-a2c-black text-a2c-black hover:bg-a2c-black hover:text-white px-8 py-6 text-base"
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
