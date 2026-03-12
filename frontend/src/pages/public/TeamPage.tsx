import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { getInitials } from '@/lib/utils';
import { useStaff } from '@/hooks/useStaff';
import type { StaffWithServices } from '@/lib/staff.api';
import { SEO } from '@/components/common/SEO';

function StaffCard({ member }: { member: StaffWithServices }) {
  const services = member.staffServices.map(ss => ss.service);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        {/* Avatar Header */}
        <div className="bg-gradient-to-br from-luxe-800 to-luxe-600 p-8 flex flex-col items-center text-white space-y-3">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center ring-4 ring-white/30">
            <span className="text-2xl font-serif font-semibold">
              {getInitials(member.name)}
            </span>
          </div>
          <div className="text-center">
            <h3 className="font-sans font-semibold text-lg">{member.name}</h3>
            <p className="text-white/70 text-sm mt-0.5">
              {member.specialties.slice(0, 2).join(' · ')}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          {member.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {member.bio}
            </p>
          )}

          {member.specialties.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Specialties
              </p>
              <div className="flex flex-wrap gap-1.5">
                {member.specialties.map(specialty => (
                  <Badge key={specialty} variant="luxe" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {services.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Services Offered
              </p>
              <div className="flex flex-wrap gap-1.5">
                {services.map(service => (
                  <Badge key={service.id} variant="outline" className="text-xs">
                    {service.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <Button asChild variant="luxe" size="sm" className="w-full">
            <Link to={`/book?staffId=${member.id}`}>
              Book with {member.name.split(' ')[0]}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StaffSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-muted h-48 animate-pulse" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamPage() {
  const { staff, isLoading, error } = useStaff();

  return (
    <div className="py-12">
      <SEO
        title="Meet Our Stylists"
        description="Meet the Luxe Hair Studio team — experienced, passionate stylists dedicated to bringing your vision to life. View their specialties and book directly."
        canonical="/team"
      />
      <div className="container space-y-10">
        {/* ─── Header ─────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <Badge variant="luxe">Our Team</Badge>
          <h1 className="text-4xl font-serif font-semibold">Meet Our Stylists</h1>
          <p className="text-muted-foreground leading-relaxed">
            Our passionate team of professionals bring years of expertise and a genuine
            love for their craft to every appointment.
          </p>
        </div>

        <Separator />

        {/* ─── Error ───────────────────────────────────────────────────────────── */}
        {error && (
          <div className="text-center py-12 space-y-3">
            <p className="text-muted-foreground">Failed to load team members. Please try again.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {/* ─── Staff Grid ──────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {Array.from({ length: 2 }).map((_, i) => <StaffSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {staff.map(member => (
              <StaffCard key={member.id} member={member} />
            ))}
          </div>
        )}

        {/* ─── CTA ─────────────────────────────────────────────────────────────── */}
        {!isLoading && staff.length > 0 && (
          <>
            <Separator />
            <div className="text-center space-y-3">
              <p className="text-muted-foreground">
                Ready to book with one of our expert stylists?
              </p>
              <Button asChild variant="luxe" size="lg">
                <Link to="/book">Book an Appointment</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}