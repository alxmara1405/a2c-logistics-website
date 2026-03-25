import { Link } from 'react-router-dom'
import { Target, Eye, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import PageTransition from '@/components/sections/PageTransition'
import ScrollReveal from '@/components/sections/ScrollReveal'

const values = [
  {
    icon: Target,
    title: 'Accountability',
    description:
      'We take ownership of every load, every mile, every outcome. No excuses — just dependable execution.',
  },
  {
    icon: Eye,
    title: 'Responsiveness',
    description:
      'Fast communication, proactive updates, and a team that treats your freight like their own.',
  },
  {
    icon: Heart,
    title: 'Driver-First Culture',
    description:
      'Built by operators who understand life on the road. We invest in our drivers because better drivers mean better service.',
  },
]

export default function About() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-a2c-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="text-a2c-red font-semibold text-sm tracking-widest uppercase mb-4">
              About Us
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading text-a2c-white">
              Built by Drivers,{' '}
              <span className="text-a2c-red">for Drivers</span>
            </h1>
            <p className="mt-6 text-lg text-a2c-gray max-w-2xl mx-auto leading-relaxed">
              A trucking company grounded in real-world experience, built to give drivers
              the support, respect, and opportunity they deserve.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-a2c-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              {/* Placeholder for company photo */}
              <div className="aspect-[4/3] bg-a2c-light-gray rounded-lg flex items-center justify-center">
                <span className="text-a2c-gray text-sm">Company Photo</span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.15}>
              <p className="text-a2c-red font-semibold text-sm tracking-widest uppercase mb-3">
                Our Story
              </p>
              <h2 className="text-3xl sm:text-4xl text-a2c-black mb-6">
                Real-World Experience on Every Mile
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                In an industry where drivers are often treated as replaceable, A2C Logistics
                stands apart. We were built by operators who know what it's like behind the wheel —
                and we run this company with that perspective every day.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our focus is on creating a place where drivers can build sustainable careers
                and long-term success — with real support, honest communication, and a team
                that treats you like a professional.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-a2c-light-gray">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-a2c-red font-semibold text-sm tracking-widest uppercase mb-3">
                What Sets Us Apart
              </p>
              <h2 className="text-3xl sm:text-4xl text-a2c-black">
                Our Values
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {values.map((value, i) => (
              <ScrollReveal key={value.title} delay={i * 0.1}>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-a2c-black mb-6">
                    <value.icon className="w-7 h-7 text-a2c-red" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-heading text-a2c-black mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team Placeholder */}
      <section className="py-24 bg-a2c-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-a2c-red font-semibold text-sm tracking-widest uppercase mb-3">
                Leadership
              </p>
              <h2 className="text-3xl sm:text-4xl text-a2c-black">
                Meet the Team
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-40 h-40 rounded-full bg-a2c-light-gray mx-auto mb-4 flex items-center justify-center">
                    <span className="text-a2c-gray text-xs">Photo</span>
                  </div>
                  <h3 className="font-heading text-a2c-black">Team Member</h3>
                  <p className="text-sm text-gray-500 mt-1">Title / Role</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-a2c-black text-center">
        <div className="max-w-3xl mx-auto px-4">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-heading text-a2c-white mb-6">
              Ready to Work With Us?
            </h2>
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
