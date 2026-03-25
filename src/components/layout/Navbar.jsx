import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Fleet', path: '/fleet' },
  { name: 'Drive With Us', path: '/drive-with-us' },
  { name: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-a2c-black/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}assets/images/A2C_Original_Primary_White.png`}
              alt="A2C Logistics"
              className="h-12"
            />
            <span className="text-a2c-white font-heading text-2xl tracking-wider">
              A2C <span className="text-a2c-red">LOGISTICS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                  location.pathname === link.path
                    ? 'text-a2c-red'
                    : 'text-a2c-gray hover:text-a2c-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/contact">
              <Button className="ml-4 bg-a2c-red hover:bg-a2c-red/90 text-white font-semibold">
                Contact Us
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-a2c-white p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-a2c-black border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 text-base font-medium rounded-md transition-colors ${
                    location.pathname === link.path
                      ? 'text-a2c-red bg-white/5'
                      : 'text-a2c-gray hover:text-a2c-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/contact" onClick={() => setMobileOpen(false)}>
                <Button className="w-full mt-4 bg-a2c-red hover:bg-a2c-red/90 text-white font-semibold">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
