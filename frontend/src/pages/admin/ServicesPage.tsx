import { useEffect, useState } from 'react';
import { api } from '@/config/api';

type ServiceCategory = 'haircut' | 'color' | 'treatment' | 'styling' | 'other';

interface Service {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: string;
  category: ServiceCategory;
  isActive: boolean;
}

interface ServiceFormData {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: ServiceCategory;
  isActive: boolean;
}

const EMPTY_FORM: ServiceFormData = {
  name: '',
  description: '',
  durationMinutes: 60,
  price: 0,
  category: 'haircut',
  isActive: true,
};

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  haircut: 'Haircut',
  color: 'Colour',
  treatment: 'Treatment',
  styling: 'Styling',
  other: 'Other',
};

const CATEGORY_STYLES: Record<ServiceCategory, string> = {
  haircut: 'bg-blue-100 text-blue-700',
  color: 'bg-purple-100 text-purple-700',
  treatment: 'bg-amber-100 text-amber-700',
  styling: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-700',
};

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchServices() {
    setIsLoading(true);
    try {
      const res = await api.get('/api/admin/services');
      setServices(res.data.data);
    } catch (err) {
      console.error('Failed to fetch services', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void fetchServices();
  }, []);

  function openCreate() {
    setEditingService(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(service: Service) {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description ?? '',
      durationMinutes: service.durationMinutes,
      price: parseFloat(service.price),
      category: service.category,
      isActive: service.isActive,
    });
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingService(null);
    setFormData(EMPTY_FORM);
    setFormError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setFormError('');

    try {
      if (editingService) {
        await api.patch(`/api/admin/services/${editingService.id}`, formData);
      } else {
        await api.post('/api/admin/services', formData);
      }
      await fetchServices();
      closeForm();
    } catch (err: any) {
      setFormError(
        err?.response?.data?.error ?? 'Something went wrong. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(service: Service) {
    try {
      await api.patch(`/api/admin/services/${service.id}`, {
        isActive: !service.isActive,
      });
      await fetchServices();
    } catch (err) {
      console.error('Failed to update service', err);
    }
  }

  async function deleteService(service: Service) {
    if (!window.confirm(`Delete "${service.name}"? This cannot be undone.`)) return;
    setDeletingId(service.id);
    try {
      await api.delete(`/api/admin/services/${service.id}`);
      await fetchServices();
    } catch (err) {
      console.error('Failed to delete service', err);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-foreground">Services</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {services.length} service{services.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-luxe-600 hover:bg-luxe-700 text-white text-sm
            font-medium rounded-lg transition-colors"
        >
          + Add service
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxe-600" />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No services yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Service
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Duration
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
                {services.map(service => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{service.name}</p>
                      {service.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate">
                          {service.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                        ${CATEGORY_STYLES[service.category]}`}>
                        {CATEGORY_LABELS[service.category]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {service.durationMinutes} min
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      ${service.price}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(service)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors
                          ${service.isActive
                            ? 'bg-luxe-100 text-luxe-700 hover:bg-luxe-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                      >
                        {service.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(service)}
                        className="px-2.5 py-1 rounded-md text-xs font-medium
                          bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteService(service)}
                        disabled={deletingId === service.id}
                        className="px-2.5 py-1 rounded-md text-xs font-medium
                          bg-red-50 text-red-600 hover:bg-red-100 transition-colors
                          disabled:opacity-50"
                      >
                        {deletingId === service.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                {editingService ? 'Edit service' : 'Add service'}
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
              {/* Name */}
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

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Description
                  <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm
                    focus:outline-none focus:ring-2 focus:ring-luxe-500 resize-none"
                />
              </div>

              {/* Category + Duration row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(p => ({
                      ...p, category: e.target.value as ServiceCategory,
                    }))}
                    className="w-full px-3 py-2 border border-input rounded-md text-sm
                      focus:outline-none focus:ring-2 focus:ring-luxe-500 bg-white"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={e => setFormData(p => ({
                      ...p, durationMinutes: parseInt(e.target.value),
                    }))}
                    min={15}
                    step={15}
                    required
                    className="w-full px-3 py-2 border border-input rounded-md text-sm
                      focus:outline-none focus:ring-2 focus:ring-luxe-500"
                  />
                </div>
              </div>

              {/* Price + Active row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData(p => ({
                      ...p, price: parseFloat(e.target.value),
                    }))}
                    min={0}
                    step={0.01}
                    required
                    className="w-full px-3 py-2 border border-input rounded-md text-sm
                      focus:outline-none focus:ring-2 focus:ring-luxe-500"
                  />
                </div>
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
              </div>

              {/* Error */}
              {formError && (
                <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md">
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
                  {isSaving ? 'Saving...' : editingService ? 'Save changes' : 'Add service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}