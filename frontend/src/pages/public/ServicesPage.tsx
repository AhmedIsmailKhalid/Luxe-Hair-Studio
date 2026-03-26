import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatPrice, formatDuration } from '@/lib/utils';
import { useServices } from '@/hooks/useServices';
import { SEO } from '@/components/common/SEO';
import SuspendedBanner from '@/components/common/SuspendedBanner';
import type { Service } from '../../../../shared/src/schemas/service.schema';

type Category = 'all' | 'haircut' | 'color' | 'treatment' | 'styling' | 'other';

const categoryLabels: Record<Category, string> = {
  all: 'All Services',
  haircut: 'Haircuts',
  color: 'Colour',
  treatment: 'Treatments',
  styling: 'Styling',
  other: 'Other',
};

function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <Badge variant="luxe" className="text-xs mb-2">
              {categoryLabels[service.category as Category] ?? service.category}
            </Badge>
            <h3 className="font-sans font-semibold text-foreground group-hover:text-luxe-700 transition-colors">
              {service.name}
            </h3>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-semibold text-luxe-700">
              {formatPrice(service.price)}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDuration(service.durationMinutes)}
            </div>
          </div>
        </div>
        {service.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {service.description}
          </p>
        )}
        <div className="pt-1">
          <Button asChild variant="luxe" size="sm" className="w-full">
            <Link to={`/book?serviceId=${service.id}`}>Book This Service</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ServiceSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="space-y-1 text-right">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}

export function ServicesPage() {
  const { services, isLoading, error, isUsingMockData } = useServices();
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const categories = ['all', ...Array.from(new Set(services.map(s => s.category)))] as Category[];
  const filtered = activeCategory === 'all'
    ? services
    : services.filter(s => s.category === activeCategory);

  return (
    <div className="py-12">
      <SEO
        title="Our Services"
        description="Browse our full range of premium hair services — haircuts, colour, balayage, treatments, styling and more. Transparent pricing. Book online instantly."
        canonical="/services"
      />

      {isUsingMockData && <SuspendedBanner />}

      <div className="container space-y-10">
        {/* ─── Header ─────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <Badge variant="luxe">Our Services</Badge>
          <h1 className="text-4xl font-serif font-semibold">Premium Hair Services</h1>
          <p className="text-muted-foreground leading-relaxed">
            From precision cuts to full colour transformations — every service is delivered
            with care, expertise, and the finest products.
          </p>
        </div>

        <Separator />

        {/* ─── Category Filter ─────────────────────────────────────────────────── */}
        {!isLoading && categories.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  activeCategory === cat
                    ? 'bg-luxe-700 text-white border-luxe-700'
                    : 'bg-background text-muted-foreground border-border hover:border-luxe-300 hover:text-luxe-700'
                }`}
              >
                {categoryLabels[cat] ?? cat}
              </button>
            ))}
          </div>
        )}

        {/* ─── Error ───────────────────────────────────────────────────────────── */}
        {error && (
          <div className="text-center py-12 space-y-3">
            <p className="text-muted-foreground">Failed to load services. Please try again.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {/* ─── Services Grid ───────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <ServiceSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {/* ─── Empty State ─────────────────────────────────────────────────────── */}
        {!isLoading && filtered.length === 0 && !error && (
          <div className="text-center py-16 text-muted-foreground">
            No services found in this category.
          </div>
        )}

        {/* ─── CTA ─────────────────────────────────────────────────────────────── */}
        {!isLoading && filtered.length > 0 && (
          <>
            <Separator />
            <div className="text-center space-y-3">
              <p className="text-muted-foreground">
                Not sure which service is right for you?
              </p>
              <Button asChild variant="luxe" size="lg">
                <Link to="/book">Browse All & Book</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}