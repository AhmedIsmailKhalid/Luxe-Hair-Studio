import { useEffect, useState } from 'react';
import { api } from '@/config/api';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string;
  totalPrice: string;
  service: { id: string; name: string; durationMinutes: number };
  staff: { id: string; name: string; email: string };
}

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-luxe-100 text-luxe-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700',
  no_show: 'bg-orange-100 text-orange-700',
};

const STATUS_OPTIONS: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
  { value: 'no_show', label: 'No show' },
];

const NEXT_STATUSES: Partial<Record<BookingStatus, BookingStatus[]>> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'no_show', 'cancelled'],
};

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function fetchBookings() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (dateFilter) params.set('date', dateFilter);

      const res = await api.get(`/api/admin/bookings?${params.toString()}`);
      setBookings(res.data.data);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchBookings();
  }, [statusFilter, dateFilter]);

  async function updateStatus(bookingId: string, status: BookingStatus) {
    setUpdatingId(bookingId);
    try {
      await api.patch(`/api/admin/bookings/${bookingId}`, { status });
      await fetchBookings();
    } catch (err) {
      console.error('Failed to update booking status', err);
    } finally {
      setUpdatingId(null);
    }
  }

  async function cancelBooking(bookingId: string) {
    setUpdatingId(bookingId);
    try {
      await api.delete(`/api/admin/bookings/${bookingId}`);
      await fetchBookings();
    } catch (err) {
      console.error('Failed to cancel booking', err);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-foreground">Bookings</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as BookingStatus | 'all')}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-white
            focus:outline-none focus:ring-2 focus:ring-luxe-500"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-white
            focus:outline-none focus:ring-2 focus:ring-luxe-500"
        />

        {(statusFilter !== 'all' || dateFilter) && (
          <button
            onClick={() => { setStatusFilter('all'); setDateFilter(''); }}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground
              border border-input rounded-lg bg-white transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxe-600" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No bookings found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Service
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Stylist
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map(booking => (
                  <>
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setExpandedId(
                        expandedId === booking.id ? null : booking.id
                      )}
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{booking.clientName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {booking.clientEmail}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {booking.service?.name}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {booking.staff?.name}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-foreground">
                          {new Date(booking.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {booking.startTime} — {booking.endTime}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-medium text-foreground">
                        ${booking.totalPrice}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                          ${STATUS_STYLES[booking.status]}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="flex items-center gap-2"
                          onClick={e => e.stopPropagation()}
                        >
                          {NEXT_STATUSES[booking.status]?.map(nextStatus => (
                            <button
                              key={nextStatus}
                              disabled={updatingId === booking.id}
                              onClick={() => nextStatus === 'cancelled'
                                ? cancelBooking(booking.id)
                                : updateStatus(booking.id, nextStatus)
                              }
                              className={`px-2.5 py-1 rounded-md text-xs font-medium
                                transition-colors disabled:opacity-50
                                ${nextStatus === 'cancelled'
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-luxe-50 text-luxe-700 hover:bg-luxe-100'
                                }`}
                            >
                              {updatingId === booking.id ? '...' : nextStatus}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {expandedId === booking.id && (
                      <tr key={`${booking.id}-expanded`} className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                                Phone
                              </p>
                              <p className="text-foreground">{booking.clientPhone}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                                Booking ID
                              </p>
                              <p className="text-foreground font-mono text-xs">
                                {booking.id}
                              </p>
                            </div>
                            {booking.notes && (
                              <div className="col-span-2">
                                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                                  Notes
                                </p>
                                <p className="text-foreground">{booking.notes}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}