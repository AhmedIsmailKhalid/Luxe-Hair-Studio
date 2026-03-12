import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-semibold text-luxe-700">
              Luxe Hair Studio
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium hair care services tailored to your unique style. 
              Book your appointment online and experience the difference.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Services', href: '/services' },
                { label: 'Our Team', href: '/team' },
                { label: 'Book Appointment', href: '/book' },
                { label: 'About Us', href: '/about' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-luxe-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>123 Luxe Avenue, Suite 100</li>
              <li>New York, NY 10001</li>
              <li className="pt-1">
                <a href="tel:+15551234567" className="hover:text-luxe-600 transition-colors">
                  +1 (555) 123-4567
                </a>
              </li>
              <li>
                <a href="mailto:hello@luxehairstudio.com" className="hover:text-luxe-600 transition-colors">
                  hello@luxehairstudio.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Luxe Hair Studio. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with care for our valued clients.
          </p>
        </div>
      </div>
    </footer>
  );
}