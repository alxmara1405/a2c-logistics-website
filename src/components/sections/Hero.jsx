import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import AnimatedBackground from './AnimatedBackground'

export default function Hero() {
  return (
    <section className="relative flex items-center justify-center bg-a2c-black overflow-hidden" style={{ height: '100dvh' }}>
      {/* Background image + overlay */}
      <img
        src={`${import.meta.env.BASE_URL}assets/images/hero-truck.jpg`}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-a2c-black/75" />
      <AnimatedBackground />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(239,57,44,0.08)_0%,_transparent_70%)]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-a2c-red font-semibold text-sm sm:text-base tracking-widest uppercase mb-4"
        >
          A2C Logistics CO.
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-4xl sm:text-5xl md:text-7xl font-heading text-a2c-white leading-tight"
        >
          Driven to be{' '}
          <span className="text-a2c-red">different.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-6 text-lg sm:text-xl text-a2c-gray max-w-2xl mx-auto leading-relaxed"
        >
          A driver-first trucking company built by people who understand the road.
          Better support, real accountability, and a team that has your back — every mile.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/contact">
            <Button
              size="lg"
              className="bg-a2c-red hover:bg-a2c-red/90 text-white font-semibold px-8 py-6 text-base"
            >
              Contact Us
            </Button>
          </Link>
          <Link to="/drive-with-us">
            <Button
              size="lg"
              variant="outline"
              className="border-a2c-gray bg-transparent text-a2c-white hover:bg-a2c-gray/20 hover:text-a2c-white px-8 py-6 text-base transition-colors"
            >
              Drive With Us
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="w-6 h-10 rounded-full border-2 border-a2c-gray/40 flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 rounded-full bg-a2c-gray/60" />
        </motion.div>
      </motion.div>
    </section>
  )
}
