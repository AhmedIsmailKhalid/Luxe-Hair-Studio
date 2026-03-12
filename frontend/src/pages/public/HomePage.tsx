import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { useServices } from '@/hooks/useServices';
import { useStaff } from '@/hooks/useStaff';
import { SEO } from '@/components/common/SEO';


const features = [
  {
    title: 'Easy Online Booking',
    description: 'Book your appointment 24/7 from any device. No phone calls needed.',
  },
  {
    title: 'Expert Stylists',
    description: 'Our team of skilled professionals are dedicated to bringing your vision to life.',
  },
  {
    title: 'Premium Products',
    description: 'We use only the finest salon-grade products for every service.',
  },
  {
    title: 'Flexible Scheduling',
    description: 'Choose the time and stylist that works best for your schedule.',
  },
];

const categoryLabels: Record<string, string> = {
  haircut: 'Haircut',
  color: 'Colour',
  treatment: 'Treatment',
  styling: 'Styling',
  other: 'Other',
};

export function HomePage() {
  const { services, isLoading: servicesLoading } = useServices();
  const { staff, isLoading: staffLoading } = useStaff();

  const featuredServices = services.slice(0, 4);
  const featuredStaff = staff.slice(0, 2);

  return (
    <div className="flex flex-col">
      <SEO
        title="Premium Hair Salon NYC"
        description="Luxe Hair Studio — expert stylists, precision cuts, colour transformations and treatments in New York City. Book your appointment online in minutes."
        canonical="/"
      />
      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-luxe-950 via-luxe-900 to-luxe-800 text-white py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-luxe-400 rounded-full blur-3xl" />
        </div>
        <div className="container relative z-10 text-center space-y-6 max-w-3xl mx-auto">
          <Badge variant="luxe" className="bg-white/10 text-white border-white/20 text-xs uppercase tracking-widest">
            Premium Hair Studio
          </Badge>
          <h1 className="text-4xl md:text-6xl font-serif font-semibold leading-tight">
            Where Every Visit Is a
            <span className="block text-gold-300 mt-1">Luxe Experience</span>
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-xl mx-auto">
            Expert stylists. Premium products. Personalised service.
            Book your appointment online in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild size="xl" className="bg-white text-luxe-800 hover:bg-white/90 font-semibold">
              <Link to="/book">Book an Appointment</Link>
            </Button>
            {/* <Button asChild size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent">
              <Link to="/services">View Services</Link>
            </Button> */}
            <Button asChild size="xl" className="bg-white text-luxe-800 hover:bg-white/90 font-semibold">
              <Link to="/services">View Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(feature => (
              <div key={feature.title} className="text-center space-y-2 p-4">
                <h3 className="font-sans font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ─── Featured Services ─────────────────────────────────────────────────── */}
      <section className="py-16 container">
        <div className="text-center space-y-2 mb-10">
          <Badge variant="luxe">Our Services</Badge>
          <h2 className="text-3xl font-serif font-semibold">Crafted for You</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            From precision cuts to colour transformations — we offer a full range of premium hair services.
          </p>
        </div>

        {servicesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredServices.map(service => (
              <Card key={service.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <Badge variant="luxe" className="text-xs">
                    {categoryLabels[service.category] ?? service.category}
                  </Badge>
                  <h3 className="font-sans font-semibold text-foreground group-hover:text-luxe-700 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-semibold text-luxe-700">
                      {formatPrice(service.price)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {service.durationMinutes} min
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button asChild variant="outline">
            <Link to="/services">View All Services</Link>
          </Button>
        </div>
      </section>

      <Separator />

      {/* ─── Featured Team ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-2 mb-10">
            <Badge variant="luxe">Meet the Team</Badge>
            <h2 className="text-3xl font-serif font-semibold">Our Expert Stylists</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Passionate professionals dedicated to making you look and feel your best.
            </p>
          </div>

          {staffLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {featuredStaff.map(member => (
                <Card key={member.id} className="overflow-hidden">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-luxe-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-luxe-700 font-semibold text-lg font-serif">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-sans font-semibold text-foreground">{member.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {member.specialties.slice(0, 2).join(' · ')}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link to="/team">Meet the Full Team</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="py-16 container">
        <div className="bg-gradient-to-r from-luxe-800 to-luxe-600 rounded-2xl p-10 text-center text-white space-y-4">
          <h2 className="text-3xl font-serif font-semibold">Ready for Your Luxe Experience?</h2>
          <p className="text-white/80 max-w-md mx-auto">
            Book your appointment online in minutes. Choose your service, your stylist, and your time.
          </p>
          <Button asChild size="xl" className="bg-white text-luxe-800 hover:bg-white/90 font-semibold mt-2">
            <Link to="/book">Book Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}