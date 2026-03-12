import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-luxe-700">Luxe Hair Studio</h1>
          <p className="text-muted-foreground mt-1 text-sm">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-border p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Sign in</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@luxehairstudio.com"
                required
                className="w-full px-3 py-2 border border-input rounded-md text-sm
                  focus:outline-none focus:ring-2 focus:ring-luxe-500 focus:border-transparent
                  placeholder:text-muted-foreground"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 border border-input rounded-md text-sm
                  focus:outline-none focus:ring-2 focus:ring-luxe-500 focus:border-transparent
                  placeholder:text-muted-foreground"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-luxe-600 hover:bg-luxe-700 text-white font-medium
                py-2.5 px-4 rounded-md text-sm transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Luxe Hair Studio © 2026
        </p>
      </div>
    </div>
  );
}