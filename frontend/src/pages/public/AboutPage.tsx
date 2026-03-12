import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SEO } from '@/components/common/SEO';

const values = [
  {
    title: 'Craftsmanship',
    description:
      'Every cut, colour, and treatment is performed with precision and care. We never rush — your hair deserves time and attention.',
  },
  {
    title: 'Premium Products',
    description:
      'We use only salon-grade products from trusted brands. What goes on your hair matters as much as the technique.',
  },
  {
    title: 'Personalised Service',
    description:
      'No two clients are the same. We take time to understand your lifestyle, preferences, and hair goals before we begin.',
  },
  {
    title: 'Welcoming Environment',
    description:
      'From the moment you walk in, you should feel at ease. Our studio is designed to be a calm, comfortable space.',
  },
];

const milestones = [
  { year: '2014', event: 'Luxe Hair Studio opens its doors in New York City.' },
  { year: '2017', event: 'Expanded the team and moved to our current location on Luxe Avenue.' },
  { year: '2020', event: 'Launched online booking to make appointments easier for our clients.' },
  { year: '2023', event: 'Named one of the top hair studios in NYC by Style Magazine.' },
  { year: '2026', event: 'Continuing to grow — same commitment, same standards.' },
];

export function AboutPage() {
  return (
    <div className="flex flex-col">
      <SEO
        title="About Us"
        description="Learn about Luxe Hair Studio — our story, our values, and our commitment to delivering a premium hair care experience with every visit."
        canonical="/about"
      />
      {/* ─── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-luxe-950 via-luxe-900 to-luxe-800 text-white py-20 md:py-28">
        <div className="container max-w-2xl text-center space-y-4">
          <Badge variant="luxe" className="bg-white/10 text-white border-white/20 text-xs uppercase tracking-widest">
            Our Story
          </Badge>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold leading-tight">
            About Luxe Hair Studio
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            A studio built on passion, precision, and the belief that every client
            deserves to feel their absolute best.
          </p>
        </div>
      </section>

      {/* ─── Mission ───────────────────────────────────────────────────────────── */}
      <section className="py-16 container max-w-3xl">
        <div className="space-y-6 text-center">
          <Badge variant="luxe">Who We Are</Badge>
          <h2 className="text-3xl font-serif font-semibold">
            More Than a Hair Salon
          </h2>
          <p className="text-muted-foreground leading-relaxed text-base max-w-2xl mx-auto">
            Luxe Hair Studio was founded with a simple mission — to bring
            world-class hair care to clients who expect the best. Our stylists
            have trained internationally, and every service we offer reflects
            years of expertise combined with a genuine love for the craft.
          </p>
          <p className="text-muted-foreground leading-relaxed text-base max-w-2xl mx-auto">
            We believe a great hair experience goes beyond the cut or colour.
            It's the consultation, the attention to detail, the products we
            choose, and the way you feel when you leave. That's what we strive
            for with every single visit.
          </p>
        </div>
      </section>

      <Separator />

      {/* ─── Values ────────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-2 mb-10">
            <Badge variant="luxe">What We Stand For</Badge>
            <h2 className="text-3xl font-serif font-semibold">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {values.map(value => (
              <div
                key={value.title}
                className="bg-white rounded-xl border border-border p-6 space-y-2"
              >
                <h3 className="font-semibold text-foreground">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ─── Timeline ──────────────────────────────────────────────────────────── */}
      <section className="py-16 container max-w-2xl">
        <div className="text-center space-y-2 mb-10">
          <Badge variant="luxe">Our Journey</Badge>
          <h2 className="text-3xl font-serif font-semibold">How We Got Here</h2>
        </div>
        <div className="space-y-0">
          {milestones.map((milestone, idx) => (
            <div key={milestone.year} className="flex gap-6">
              {/* Line + dot */}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-luxe-600 mt-1 flex-shrink-0" />
                {idx !== milestones.length - 1 && (
                  <div className="w-px flex-1 bg-luxe-200 my-1" />
                )}
              </div>
              {/* Content */}
              <div className="pb-8">
                <p className="text-sm font-semibold text-luxe-700">{milestone.year}</p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  {milestone.event}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ─── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="py-16 container">
        <div className="bg-gradient-to-r from-luxe-800 to-luxe-600 rounded-2xl p-10
          text-center text-white space-y-4">
          <h2 className="text-3xl font-serif font-semibold">
            Come Experience It Yourself
          </h2>
          <p className="text-white/80 max-w-md mx-auto">
            Book an appointment online and see why our clients keep coming back.
          </p>
          <Button
            asChild
            size="xl"
            className="bg-white text-luxe-800 hover:bg-white/90 font-semibold mt-2"
          >
            <Link to="/book">Book an Appointment</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}