import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Services', href: '/services' },
  { label: 'Our Team', href: '/team' },
  { label: 'About', href: '/about' },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-semibold text-luxe-700">
            Luxe Hair Studio
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-luxe-600',
                location.pathname === link.href
                  ? 'text-luxe-700'
                  : 'text-muted-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button asChild variant="luxe" size="sm">
            <Link to="/book">Book Now</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
          onClick={() => setIsMenuOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className={cn('block h-0.5 bg-current transition-all', isMenuOpen && 'rotate-45 translate-y-[7px]')} />
            <span className={cn('block h-0.5 bg-current transition-all', isMenuOpen && 'opacity-0')} />
            <span className={cn('block h-0.5 bg-current transition-all', isMenuOpen && '-rotate-45 -translate-y-[9px]')} />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
          {navLinks.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'block text-sm font-medium py-2 transition-colors hover:text-luxe-600',
                location.pathname === link.href
                  ? 'text-luxe-700'
                  : 'text-muted-foreground'
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Button asChild variant="luxe" size="sm" className="w-full mt-2">
            <Link to="/book" onClick={() => setIsMenuOpen(false)}>Book Now</Link>
          </Button>
        </div>
      )}
    </header>
  );
}