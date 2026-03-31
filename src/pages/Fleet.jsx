import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Truck, Wrench, Gauge, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PageTransition from '@/components/sections/PageTransition'
import ScrollReveal from '@/components/sections/ScrollReveal'

const fleetFeatures = [
  {
    icon: Truck,
    title: 'Modern Equipment',
    description: 'Our fleet is maintained to the highest standards with late-model trucks and trailers.',
  },
  {
    icon: Wrench,
    title: 'Regular Maintenance',
    description: 'Rigorous preventive maintenance schedules keep our equipment safe and reliable on every run.',
  },
  {
    icon: Gauge,
    title: 'Performance Tracking',
    description: 'Advanced telematics and monitoring ensure optimal fuel efficiency and on-time performance.',
  },
  {
    icon: Shield,
    title: 'Safety First',
    description: 'DOT-compliant equipment with comprehensive safety inspections before every dispatch.',
  },
]

const equipmentTypes = [
  { type: 'Dry Van', description: 'Standard enclosed trailers for general freight', image: 'truck-closeup.jpg' },
  { type: 'Flatbed', description: 'Open trailers for oversized and heavy cargo', image: 'truck-highway.jpg' },
  { type: 'Reefer', description: 'Temperature-controlled trailers for perishable goods', image: 'truck-road.jpg' },
  { type: 'Step Deck', description: 'Low-profile trailers for tall or heavy equipment', image: 'trucks-parked.jpg' },
]

export default function Fleet() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-a2c-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-a2c-red font-semibold text-sm tracking-widest uppercase mb-4">
              Our Fleet
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading text-a2c-white">
              Equipment You Can{' '}
              <span className="text-a2c-red">Count On</span>
            </h1>
            <p className="mt-6 text-lg text-a2c-gray max-w-2xl mx-auto leading-relaxed">
              Well-maintained, modern equipment driven by experienced professionals.
              Our fleet is built for reliability.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Fleet Features */}
      <section className="py-24 bg-a2c-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fleetFeatures.map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 0.1}>
                <motion.div whileHover={{ y: -6, transition: { duration: 0.3 } }}>
                  <Card className="h-full border-a2c-gray/30 hover:border-a2c-red/30 transition-colors">
                    <CardContent className="p-8 text-center">
                      <feature.icon className="w-10 h-10 text-a2c-red mx-auto mb-4" strokeWidth={1.5} />
                      <h3 className="text-lg font-heading text-a2c-black mb-3">{feature.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment Types */}
      <section className="py-24 bg-a2c-light-gray">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-a2c-red font-semibold text-sm tracking-widest uppercase mb-3">
                Equipment
              </p>
              <h2 className="text-3xl sm:text-4xl text-a2c-black">
                Trailer Types
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {equipmentTypes.map((item, i) => (
              <ScrollReveal key={item.type} delay={i * 0.1}>
                <div className="bg-white rounded-lg p-8 border border-a2c-gray/20">
                  <img
                    src={`${import.meta.env.BASE_URL}assets/images/${item.image}`}
                    alt={item.type}
                    className="aspect-[16/9] object-cover rounded mb-6 w-full"
                  />
                  <h3 className="font-heading text-xl text-a2c-black mb-2">{item.type}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Gallery Placeholder */}
      <section className="py-24 bg-a2c-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-a2c-red font-semibold text-sm tracking-widest uppercase mb-3">
                Gallery
              </p>
              <h2 className="text-3xl sm:text-4xl text-a2c-black">
                Our Fleet in Action
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {['hero-truck.jpg', 'truck-highway.jpg', 'truck-road.jpg', 'fleet-aerial.jpg', 'truck-closeup.jpg', 'trucks-parked.jpg'].map((img, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <img
                  src={`${import.meta.env.BASE_URL}assets/images/${img}`}
                  alt={`Fleet photo ${i + 1}`}
                  className="aspect-[4/3] object-cover rounded-lg w-full"
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-a2c-black text-center">
        <div className="max-w-3xl mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-heading text-a2c-white mb-4">
              Interested in Our Fleet?
            </h2>
            <p className="text-a2c-gray mb-8">
              Contact us to learn more about our equipment and capabilities.
            </p>
            <Link to="/contact">
              <Button
                size="lg"
                className="bg-a2c-red hover:bg-a2c-red/90 text-white font-semibold px-8 py-6 text-base"
              >
                Get in Touch
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </PageTransition>
  )
}
