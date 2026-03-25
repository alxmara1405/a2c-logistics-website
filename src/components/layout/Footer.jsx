import { Link } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'

const footerLinks = {
  company: [
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Fleet', path: '/fleet' },
  ],
  drivers: [
    { name: 'Drive With Us', path: '/drive-with-us' },
    { name: 'Contact', path: '/contact' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-a2c-black text-a2c-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/assets/images/A2C_Original_Primary_White.png"
                alt="A2C Logistics"
                className="h-12"
              />
              <span className="font-heading text-2xl text-a2c-white tracking-wider">
                A2C <span className="text-a2c-red">LOGISTICS</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed max-w-xs">
              Driven to be different. A driver-first trucking company built by people
              who understand the road.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-heading text-a2c-white text-sm mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm hover:text-a2c-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Driver Links */}
          <div>
            <h4 className="font-heading text-a2c-white text-sm mb-4">For Drivers</h4>
            <ul className="space-y-3">
              {footerLinks.drivers.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm hover:text-a2c-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} A2C Logistics CO. All rights reserved.</p>
          <p className="italic">Driven to be different.</p>
        </div>
      </div>
    </footer>
  )
}
