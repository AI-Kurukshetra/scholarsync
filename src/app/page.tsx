import Link from 'next/link';
import {
  GraduationCap, Users, ClipboardCheck, BookOpen, CreditCard, Calendar,
  Globe, Brain, ArrowRight, CheckCircle2, Sparkles,
  MessageSquare, Bus, Library, FileText, Building2, Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  { icon: Users, title: 'Student Information System', desc: 'Complete profiles with enrollment, demographics, and academic history', color: 'from-violet-500 to-indigo-500' },
  { icon: CreditCard, title: 'Fee Management', desc: 'Automated fee tracking, invoice generation, and payment status', color: 'from-amber-500 to-orange-500' },
  { icon: ClipboardCheck, title: 'Attendance Tracking', desc: 'Digital attendance marking with automated reports and analytics', color: 'from-cyan-500 to-teal-500' },
  { icon: BookOpen, title: 'Grade Management', desc: 'Gradebook with assignment tracking and grade calculations', color: 'from-pink-500 to-rose-500' },
  { icon: Calendar, title: 'Timetable Management', desc: 'Class scheduling with room allocation and teacher assignments', color: 'from-emerald-500 to-green-500' },
  { icon: MessageSquare, title: 'Parent Communication', desc: 'In-app messaging between teachers, parents, and admin', color: 'from-blue-500 to-indigo-500' },
  { icon: FileText, title: 'Examination Management', desc: 'Exam scheduling, result processing, and report card generation', color: 'from-red-500 to-pink-500' },
  { icon: Library, title: 'Library Management', desc: 'Book catalog, issue/return tracking, and fine management', color: 'from-teal-500 to-cyan-500' },
  { icon: Bus, title: 'Transport Management', desc: 'Route planning, vehicle tracking, and student assignments', color: 'from-orange-500 to-amber-500' },
  { icon: Building2, title: 'Hostel Management', desc: 'Room allocation, mess management, and visitor tracking', color: 'from-purple-500 to-violet-500' },
  { icon: Package, title: 'Inventory Management', desc: 'Asset tracking, equipment maintenance, and stock monitoring', color: 'from-lime-500 to-green-500' },
  { icon: Brain, title: 'AI-Powered Analytics', desc: 'Predict student performance and identify at-risk students', color: 'from-fuchsia-500 to-purple-500' },
];

const stats = [
  { value: '23+', label: 'Modules' },
  { value: '48', label: 'Pages' },
  { value: '3', label: 'User Roles' },
  { value: '27', label: 'DB Tables' },
];

const highlights = [
  'Role-based access control (Admin, Teacher, Parent)',
  'Multi-language support (English & Hindi)',
  'Real-time data with Supabase',
  'AI-powered student risk assessment',
  'CSV data export for all modules',
  'Dark mode by default with theme toggle',
  'Responsive design for mobile & desktop',
  'Secure authentication with Supabase Auth',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen mesh-gradient relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/8 blur-[100px] animate-float" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-accent/8 blur-[100px] animate-float" style={{ animationDelay: '-4s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-4 border-b border-border/20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <GraduationCap className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gradient">ScholarSync</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">
              Get Started <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-6 lg:px-12 pt-20 pb-16 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">Next-Generation School Management Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
          <span className="text-gradient">Digitize Your School</span>
          <br />
          <span className="text-foreground/80">Operations & Administration</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          A comprehensive platform covering student management, attendance, grades, fees, examinations,
          library, transport, hostel, payroll, and AI-powered analytics — all in one place.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button size="lg" className="px-8 shadow-lg shadow-primary/25" asChild>
            <Link href="/login">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="px-8" asChild>
            <Link href="#features">Explore Features</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-2xl bg-card/30 frost border border-border/30">
              <span className="block text-3xl font-bold text-gradient">{stat.value}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 px-6 lg:px-12 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gradient mb-3">Complete Feature Suite</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Every tool a school needs — from enrollment to graduation</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-5 rounded-xl border border-border/30 bg-card/20 frost hover:bg-card/40 hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Highlights */}
      <section className="relative z-10 px-6 lg:px-12 py-16 max-w-4xl mx-auto">
        <div className="rounded-2xl bg-card/30 frost border border-border/30 p-8 lg:p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gradient mb-2">Built for Modern Schools</h2>
            <p className="text-sm text-muted-foreground">Enterprise-grade features with a focus on usability and security</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-2.5 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-foreground/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="relative z-10 px-6 lg:px-12 py-12 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gradient mb-2">Tech Stack</h2>
          <p className="text-sm text-muted-foreground">Built with modern, production-ready technologies</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            'Next.js 14', 'TypeScript', 'Supabase', 'PostgreSQL', 'Tailwind CSS',
            'shadcn/ui', 'Recharts', 'Playwright', 'Jest', 'Vercel',
          ].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 rounded-full text-xs font-medium border border-border/40 bg-card/30 frost text-foreground/70 hover:text-foreground hover:border-primary/30 transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 lg:px-12 py-16 max-w-4xl mx-auto text-center">
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-10">
          <h2 className="text-3xl font-bold text-gradient mb-3">Ready to Transform Your School?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of schools digitizing their operations with ScholarSync.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8 shadow-lg shadow-primary/25" asChild>
              <Link href="/login">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/20 px-6 lg:px-12 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <GraduationCap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gradient">ScholarSync</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Built with Next.js + Supabase</span>
            <span className="hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5">
              <Globe className="h-3 w-3" />
              <span>English & Hindi</span>
            </div>
            <span className="hidden sm:inline">|</span>
            <span>© 2025 ScholarSync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
