'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Loader2, Sparkles, ArrowRight } from 'lucide-react';

const demoAccounts = [
  { role: 'Admin', email: 'admin@scholarsync.demo', password: 'demo123456', color: 'from-violet-500 to-indigo-500' },
  { role: 'Teacher', email: 'teacher@scholarsync.demo', password: 'demo123456', color: 'from-cyan-500 to-teal-500' },
  { role: 'Parent', email: 'parent@scholarsync.demo', password: 'demo123456', color: 'from-amber-500 to-orange-500' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 lg:hidden flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <GraduationCap className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg text-gradient">ScholarSync</span>
      </div>

      <div className="space-y-2 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gradient">Sign in</h1>
        <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-xl">{error}</div>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
          Sign in
        </Button>
      </form>

      <div className="mt-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-3 w-3 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick access</p>
        </div>
        <div className="space-y-2">
          {demoAccounts.map((account) => (
            <button
              key={account.role}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/60 bg-card/50 text-sm hover:bg-secondary/80 hover:ring-1 hover:ring-primary/20 transition-all duration-200 disabled:opacity-50 group"
              onClick={() => handleDemoLogin(account.email, account.password)}
              disabled={loading}
            >
              <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${account.color} shadow-lg`} />
              <span className="font-medium">{account.role}</span>
              <span className="text-xs text-muted-foreground font-mono ml-auto">{account.email}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-8 text-sm text-muted-foreground text-center">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-primary font-medium hover:underline underline-offset-4">
          Sign up
        </Link>
      </p>
    </div>
  );
}
