import { useEffect, useState } from 'react';
import { api } from '@/config/api';

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  todayBookings: number;
}

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  accent?: boolean;
}

function StatCard({ label, value, description, accent }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl border p-6 ${accent ? 'border-luxe-200' : 'border-border'}`}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`text-3xl font-semibold mt-1 ${accent ? 'text-luxe-700' : 'text-foreground'}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    todayBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [allRes, todayRes] = await Promise.all([
          api.get('/api/admin/bookings'),
          api.get(`/api/admin/bookings?date=${new Date().toISOString().split('T')[0]}`),
        ]);

        const all = allRes.data.data;
        const today = todayRes.data.data;

        setStats({
          totalBookings: all.length,
          pendingBookings: all.filter((b: any) => b.status === 'pending').length,
          confirmedBookings: all.filter((b: any) => b.status === 'confirmed').length,
          todayBookings: today.length,
        });

        setRecentBookings(all.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    }

    void fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxe-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif text-foreground">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Appointments"
          value={stats.todayBookings}
          description="Scheduled for today"
          accent
        />
        <StatCard
          label="Pending"
          value={stats.pendingBookings}
          description="Awaiting confirmation"
        />
        <StatCard
          label="Confirmed"
          value={stats.confirmedBookings}
          description="Ready to go"
        />
        <StatCard
          label="Total Bookings"
          value={stats.totalBookings}
          description="All time"
        />
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Recent Bookings</h3>
        </div>
        {recentBookings.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground text-sm">
            No bookings yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentBookings.map(booking => (
              <div key={booking.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{booking.clientName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {booking.service?.name} with {booking.staff?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(booking.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })} at {booking.startTime}
                  </p>
                  <span className={`
                    inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium
                    ${booking.status === 'confirmed' ? 'bg-luxe-100 text-luxe-700' : ''}
                    ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                    ${booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                    ${booking.status === 'completed' ? 'bg-gray-100 text-gray-700' : ''}
                  `}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}