import { useEffect, useState } from 'react';
import { api } from '@/config/api';

interface ServiceOption {
  id: string;
  name: string;
  category: string;
}

interface StaffService {
  id: string;
  service: {
    id: string;
    name: string;
  };
}

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  specialties: string[];
  isActive: boolean;
  staffServices: StaffService[];
  availability: AvailabilitySlot[];
}

interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  specialties: string;
  isActive: boolean;
}

const EMPTY_FORM: StaffFormData = {
  name: '',
  email: '',
  phone: '',
  bio: '',
  specialties: '',
  isActive: true,
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_AVAILABILITY: AvailabilitySlot[] = [
  { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isAvailable: false },
  { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },
  { dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isAvailable: false },
];

const CATEGORY_LABELS: Record<string, string> = {
  haircut: 'Haircut',
  color: 'Colour',
  treatment: 'Treatment',
  styling: 'Styling',
  other: 'Other',
};

export function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [allServices, setAllServices] = useState<ServiceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState<StaffFormData>(EMPTY_FORM);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(DEFAULT_AVAILABILITY);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function fetchStaff() {
    setIsLoading(true);
    try {
      const [staffRes, servicesRes] = await Promise.all([
        api.get('/api/admin/staff'),
        api.get('/api/admin/services'),
      ]);
      setStaff(staffRes.data.data);
      setAllServices(servicesRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchStaff();
  }, []);

  function openCreate() {
    setEditingStaff(null);
    setFormData(EMPTY_FORM);
    setAvailability(DEFAULT_AVAILABILITY);
    setSelectedServiceIds([]);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(member: StaffMember) {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone ?? '',
      bio: member.bio ?? '',
      specialties: member.specialties.join(', '),
      isActive: member.isActive,
    });

    const merged = DEFAULT_AVAILABILITY.map(defaultSlot => {
      const existing = member.availability?.find(
        a => a.dayOfWeek === defaultSlot.dayOfWeek
      );
      return existing ?? defaultSlot;
    });
    setAvailability(merged);
    setSelectedServiceIds(member.staffServices?.map(ss => ss.service.id) ?? []);
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingStaff(null);
    setFormData(EMPTY_FORM);
    setAvailability(DEFAULT_AVAILABILITY);
    setSelectedServiceIds([]);
    setFormError('');
  }

  function toggleServiceSelection(serviceId: string) {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  }

  function updateAvailabilitySlot(
    dayOfWeek: number,
    field: keyof AvailabilitySlot,
    value: string | boolean
  ) {
    setAvailability(prev =>
      prev.map(slot =>
        slot.dayOfWeek === dayOfWeek ? { ...slot, [field]: value } : slot
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setFormError('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
        specialties: formData.specialties
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        isActive: formData.isActive,
      };

      let staffId: string;

      if (editingStaff) {
        await api.patch(`/api/admin/staff/${editingStaff.id}`, payload);
        staffId = editingStaff.id;
      } else {
        const res = await api.post('/api/admin/staff', payload);
        staffId = res.data.data.id;
      }

      // Save availability and services in parallel
      await Promise.all([
        ...availability.map(slot =>
          api.post(`/api/admin/staff/${staffId}/availability`, {
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: slot.isAvailable,
          }).catch(() => null)
        ),
        api.post(`/api/admin/staff/${staffId}/services`, {
          serviceIds: selectedServiceIds,
        }),
      ]);

      await fetchStaff();
      closeForm();
    } catch (err: any) {
      setFormError(
        err?.response?.data?.error ?? 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(member: StaffMember) {
    try {
      await api.patch(`/api/admin/staff/${member.id}`, {
        isActive: !member.isActive,
      });
      await fetchStaff();
    } catch (err) {
      console.error('Failed to update staff member', err);
    }
  }

  async function deleteStaff(member: StaffMember) {
    if (!window.confirm(`Remove "${member.name}"? This cannot be undone.`)) return;
    setDeletingId(member.id);
    try {
      await api.delete(`/api/admin/staff/${member.id}`);
      await fetchStaff();
    } catch (err) {
      console.error('Failed to delete staff member', err);
    } finally {
      setDeletingId(null);
    }
  }

  // Group services by category for the checkbox list
  const servicesByCategory = allServices.reduce<Record<string, ServiceOption[]>>(
    (acc, service) => {
      const cat = service.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(service);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-foreground">Staff</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {staff.length} team member{staff.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-luxe-600 hover:bg-luxe-700 text-white text-sm
            font-medium rounded-lg transition-colors"
        >
          + Add staff
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxe-600" />
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No staff members yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Specialties
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Services
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
                {staff.map(member => (
                  <>
                    <tr
                      key={member.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setExpandedId(
                        expandedId === member.id ? null : member.id
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-luxe-100 flex items-center
                            justify-center flex-shrink-0">
                            <span className="text-luxe-700 text-xs font-semibold">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {member.specialties.slice(0, 2).map(s => (
                            <span key={s}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600
                                rounded-full text-xs">
                              {s}
                            </span>
                          ))}
                          {member.specialties.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600
                              rounded-full text-xs">
                              +{member.specialties.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {member.staffServices?.length ?? 0} services
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={e => { e.stopPropagation(); toggleActive(member); }}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium
                            transition-colors
                            ${member.isActive
                              ? 'bg-luxe-100 text-luxe-700 hover:bg-luxe-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                        >
                          {member.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="flex items-center gap-2"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            onClick={() => openEdit(member)}
                            className="px-2.5 py-1 rounded-md text-xs font-medium
                              bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteStaff(member)}
                            disabled={deletingId === member.id}
                            className="px-2.5 py-1 rounded-md text-xs font-medium
                              bg-red-50 text-red-600 hover:bg-red-100 transition-colors
                              disabled:opacity-50"
                          >
                            {deletingId === member.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {expandedId === member.id && (
                      <tr key={`${member.id}-expanded`} className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="grid grid-cols-2 gap-6 text-sm">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground
                                uppercase mb-2">
                                Weekly Availability
                              </p>
                              <div className="space-y-1">
                                {member.availability
                                  ?.sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                                  .map(slot => (
                                    <div key={slot.dayOfWeek}
                                      className="flex items-center justify-between">
                                      <span className={`text-xs ${slot.isAvailable
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'}`}>
                                        {DAY_NAMES[slot.dayOfWeek]}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {slot.isAvailable
                                          ? `${slot.startTime} — ${slot.endTime}`
                                          : 'Off'
                                        }
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground
                                uppercase mb-2">
                                Assigned Services
                              </p>
                              <div className="space-y-1">
                                {member.staffServices?.map(ss => (
                                  <p key={ss.id} className="text-xs text-foreground">
                                    {ss.service.name}
                                  </p>
                                ))}
                              </div>
                            </div>
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

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh]
            overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center
              justify-between sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-foreground">
                {editingStaff ? 'Edit staff member' : 'Add staff member'}
              </h3>
              <button
                onClick={closeForm}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              {/* Name + Email */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-input rounded-md text-sm
                      focus:outline-none focus:ring-2 focus:ring-luxe-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-input rounded-md text-sm
                      focus:outline-none focus:ring-2 focus:ring-luxe-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Phone
                  <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm
                    focus:outline-none focus:ring-2 focus:ring-luxe-500"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Bio
                  <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm
                    focus:outline-none focus:ring-2 focus:ring-luxe-500 resize-none"
                />
              </div>

              {/* Specialties */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Specialties
                  <span className="text-muted-foreground font-normal ml-1">
                    (comma separated)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.specialties}
                  onChange={e => setFormData(p => ({ ...p, specialties: e.target.value }))}
                  placeholder="Balayage, Colour Correction, Precision Cuts"
                  className="w-full px-3 py-2 border border-input rounded-md text-sm
                    focus:outline-none focus:ring-2 focus:ring-luxe-500"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={e => setFormData(p => ({
                    ...p, isActive: e.target.value === 'active',
                  }))}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm
                    focus:outline-none focus:ring-2 focus:ring-luxe-500 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Services */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Assigned Services
                  <span className="text-muted-foreground font-normal ml-1">
                    ({selectedServiceIds.length} selected)
                  </span>
                </label>
                <div className="border border-input rounded-md overflow-hidden">
                  {Object.entries(servicesByCategory).map(([category, services], catIdx) => (
                    <div key={category}>
                      <div className={`px-4 py-2 bg-gray-50 border-b border-border
                        ${catIdx !== 0 ? 'border-t' : ''}`}>
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {CATEGORY_LABELS[category] ?? category}
                        </span>
                      </div>
                      {services.map((service, idx) => (
                        <div
                          key={service.id}
                          className={`flex items-center gap-3 px-4 py-2.5
                            ${idx !== services.length - 1 ? 'border-b border-border' : ''}`}
                        >
                          <input
                            type="checkbox"
                            id={`service-${service.id}`}
                            checked={selectedServiceIds.includes(service.id)}
                            onChange={() => toggleServiceSelection(service.id)}
                            className="accent-luxe-600"
                          />
                          <label
                            htmlFor={`service-${service.id}`}
                            className="text-sm text-foreground cursor-pointer flex-1"
                          >
                            {service.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Weekly Availability
                </label>
                <div className="border border-input rounded-md overflow-hidden">
                  {availability.map((slot, idx) => (
                    <div
                      key={slot.dayOfWeek}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm
                        ${idx !== 0 ? 'border-t border-border' : ''}
                        ${slot.isAvailable ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <input
                        type="checkbox"
                        checked={slot.isAvailable}
                        onChange={e => updateAvailabilitySlot(
                          slot.dayOfWeek, 'isAvailable', e.target.checked
                        )}
                        className="accent-luxe-600"
                      />
                      <span className={`w-24 text-sm ${slot.isAvailable
                        ? 'text-foreground'
                        : 'text-muted-foreground'}`}>
                        {DAY_NAMES[slot.dayOfWeek]}
                      </span>
                      {slot.isAvailable ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={e => updateAvailabilitySlot(
                              slot.dayOfWeek, 'startTime', e.target.value
                            )}
                            className="px-2 py-1 border border-input rounded text-xs
                              focus:outline-none focus:ring-1 focus:ring-luxe-500"
                          />
                          <span className="text-muted-foreground text-xs">to</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={e => updateAvailabilitySlot(
                              slot.dayOfWeek, 'endTime', e.target.value
                            )}
                            className="px-2 py-1 border border-input rounded text-xs
                              focus:outline-none focus:ring-1 focus:ring-luxe-500"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Off</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div className="bg-destructive/10 text-destructive text-sm px-3 py-2
                  rounded-md">
                  {formError}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground
                    hover:text-foreground border border-input rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium bg-luxe-600 hover:bg-luxe-700
                    text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingStaff ? 'Save changes' : 'Add staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}