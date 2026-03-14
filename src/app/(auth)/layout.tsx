export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex mesh-gradient">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-[45%] items-center justify-center p-12 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

        <div className="relative text-center space-y-8 max-w-sm">
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 animate-float" style={{ animationDuration: '4s' }}>
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
                <path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
              </svg>
            </div>
            <span className="text-3xl font-bold tracking-tight text-gradient">ScholarSync</span>
          </div>
          <p className="text-muted-foreground leading-relaxed text-sm">
            A modern school management platform for administrators, teachers, and parents.
          </p>
          <div className="flex justify-center gap-8 pt-4">
            {[
              { value: '60+', label: 'Students' },
              { value: '6', label: 'Classes' },
              { value: '92%', label: 'Attendance' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <span className="block text-2xl font-bold text-gradient">{stat.value}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-card/30 frost" />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
