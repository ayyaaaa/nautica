'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Anchor,
  ArrowRight,
  Shield,
  Ship,
  FileText,
  CheckCircle2,
  Menu,
  X,
  BarChart3,
  Clock,
  Globe,
  Users,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ModeToggle } from '@/components/mode-toggle'

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* --- LIQUID GLASS NAVBAR --- */}
      {/* Changed bg-background to bg-background/60 and added backdrop-blur-xl */}
      <header className="border-b sticky top-0 z-50 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-foreground">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Anchor className="h-6 w-6 text-primary" />
            </div>
            <span>Nautica Harbor</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex gap-6 text-sm font-medium text-muted-foreground">
              <Link href="#features" className="hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="hover:text-primary transition-colors">
                How it Works
              </Link>
              <Link href="#faq" className="hover:text-primary transition-colors">
                FAQ
              </Link>
            </nav>
            <div className="flex items-center gap-3 pl-6 border-l border-border/50">
              <ModeToggle />
              <Button asChild variant="ghost">
                <Link href="/login">Log In</Link>
              </Button>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                <Link href="/register">Register Vessel</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <ModeToggle />
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b bg-background/95 backdrop-blur-xl p-4 flex flex-col gap-4">
            <Link
              href="#features"
              className="text-sm font-medium py-2 border-b"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium py-2 border-b"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How it Works
            </Link>
            <div className="flex flex-col gap-2 mt-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/login">Operator Login</Link>
              </Button>
              <Button asChild className="w-full justify-start">
                <Link href="/register">Register New Vessel</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* --- HERO SECTION --- */}
        <section className="relative py-20 lg:py-32 overflow-hidden bg-background">
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium border-primary/20 bg-primary/5 text-primary mb-8">
              <span className="inline-block h-2 w-2 rounded-full bg-primary mr-2"></span>
              System Live: Accepting New Registrations
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-foreground">
              Harbor Management <br />
              <span className="text-primary">Reimagined for Speed</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              The all-in-one digital platform for vessel operators and harbor masters. Register
              vessels, secure berthing slots, and manage permits instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto rounded-full" asChild>
                <Link href="/register">
                  Start Registration <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg w-full sm:w-auto rounded-full"
                asChild
              >
                <Link href="/login">Access Operator Portal</Link>
              </Button>
            </div>

            {/* Mockup / Visual */}
            <div className="mt-16 relative mx-auto max-w-5xl rounded-xl border bg-muted/20 p-2 lg:mt-24">
              <div className="rounded-lg border bg-background overflow-hidden">
                <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/20"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500/20"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500/20"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 items-center justify-center opacity-80">
                  {/* Abstract Representation of the UI */}
                  <div className="space-y-4">
                    <div className="h-8 w-3/4 bg-muted rounded"></div>
                    <div className="h-4 w-1/2 bg-muted/50 rounded"></div>
                    <div className="h-32 w-full bg-muted/10 rounded border"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-8 w-full bg-muted rounded"></div>
                    <div className="h-4 w-2/3 bg-muted/50 rounded"></div>
                    <div className="h-32 w-full bg-muted/20 rounded"></div>
                  </div>
                  <div className="space-y-4 hidden md:block">
                    <div className="h-8 w-1/2 bg-muted rounded"></div>
                    <div className="h-4 w-3/4 bg-muted/50 rounded"></div>
                    <div className="h-32 w-full bg-muted/20 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- STATS SECTION --- */}
        <section className="border-y bg-muted/10">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-foreground mb-2">24/7</div>
                <div className="text-sm font-medium text-muted-foreground">Digital Access</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-foreground mb-2">100%</div>
                <div className="text-sm font-medium text-muted-foreground">Paperless</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-foreground mb-2">Instant</div>
                <div className="text-sm font-medium text-muted-foreground">Verification</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-foreground mb-2">Secure</div>
                <div className="text-sm font-medium text-muted-foreground">Data Storage</div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section id="features" className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4 tracking-tight">
                Everything you need to manage your fleet
              </h2>
              <p className="text-muted-foreground text-lg">
                Replacing outdated harbor paperwork with a modern, fast, and secure digital
                infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<FileText />}
                title="Instant Registration"
                description="Submit applications online with digital document uploads. No need to visit the harbor office physically."
              />
              <FeatureCard
                icon={<BarChart3 />}
                title="Real-time Status"
                description="Track your application progress from 'Pending' to 'Approved' in real-time through the operator portal."
              />
              <FeatureCard
                icon={<Shield />}
                title="Bank-Grade Security"
                description="Your personal data, ID cards, and vessel registration documents are encrypted and stored securely."
              />
              <FeatureCard
                icon={<Clock />}
                title="Day-to-Day Permits"
                description="Need a quick stop? Request temporary day-to-day berthing slots instantly for short visits."
              />
              <FeatureCard
                icon={<Globe />}
                title="Anywhere Access"
                description="Manage your vessel from your phone, tablet, or office computer. The platform is fully responsive."
              />
              <FeatureCard
                icon={<Users />}
                title="Multi-Vessel Fleet"
                description="One operator account can manage multiple vessels. Perfect for businesses with larger fleets."
              />
            </div>
          </div>
        </section>

        {/* --- ROLE SPLIT SECTION --- */}
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left: Operators */}
              <div className="space-y-6">
                <div className="inline-block p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Ship className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-bold">For Vessel Operators</h3>
                <p className="text-lg text-muted-foreground">
                  Stop wasting time in queues. Nautica allows you to submit all your documents
                  digitally. Get notified via email or SMS when your slot is approved.
                </p>
                <ul className="space-y-3">
                  <CheckItem text="Digital ID & Document Upload" />
                  <CheckItem text="Download Printable Permits" />
                  <CheckItem text="Manage Renewals Online" />
                </ul>
                <Button variant="link" className="px-0 text-blue-600 dark:text-blue-400" asChild>
                  <Link href="/register">Create Operator Account &rarr;</Link>
                </Button>
              </div>

              {/* Right: Harbor Masters */}
              <div className="space-y-6">
                <div className="inline-block p-3 rounded-xl bg-primary/10 text-primary">
                  <Anchor className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-bold">For Harbor Masters</h3>
                <p className="text-lg text-muted-foreground">
                  Gain complete visibility over your harbor. Approve or reject applications with a
                  single click and access vessel data instantly during inspections.
                </p>
                <ul className="space-y-3">
                  <CheckItem text="Centralized Admin Dashboard" />
                  <CheckItem text="One-Click Approval Workflows" />
                  <CheckItem text="Searchable Vessel Database" />
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS --- */}
        <section id="how-it-works" className="py-24 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold mb-16 text-center">How to Get Started</h2>

            <div className="relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute left-[50%] top-0 bottom-0 w-px bg-border -translate-x-1/2" />

              <div className="space-y-12">
                <Step
                  number="1"
                  title="Create an Application"
                  desc="Click 'Register Vessel' and fill in your operator details and vessel specifications."
                  side="left"
                />
                <Step
                  number="2"
                  title="Upload Documents"
                  desc="Securely upload your ID card, vessel registration, and photos directly from your device."
                  side="right"
                />
                <Step
                  number="3"
                  title="Get Approved"
                  desc="Receive a digital notification once the Harbor Master reviews and approves your berthing slot."
                  side="left"
                />
                <Step
                  number="4"
                  title="Dock & Operate"
                  desc="Download your digital permit from the portal and present it whenever requested."
                  side="right"
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section id="faq" className="py-24 bg-muted/10">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <FaqItem
                q="Is there a fee to register?"
                a="Registration on the platform is free. Berthing fees may apply depending on the size of your vessel and duration of stay, which are handled separately by the harbor office."
              />
              <FaqItem
                q="What documents do I need?"
                a="You will need a valid ID Card or Passport copy, a passport-sized photo, and your Vessel Registration documents (for permanent slots)."
              />
              <FaqItem
                q="Can I register multiple vessels?"
                a="Yes! One operator account can manage an unlimited number of vessels. You can switch between them in your portal."
              />
              <FaqItem
                q="How long does approval take?"
                a="Most 'Day-to-Day' permits are approved within hours. Permanent slots may take 1-2 business days for document verification."
              />
            </div>
          </div>
        </section>

        {/* --- CTA BANNER --- */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-3xl p-8 md:p-16 text-center text-primary-foreground relative overflow-hidden">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">
                Ready to Modernize Your Fleet?
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-10 relative z-10">
                Join hundreds of operators who have switched to digital harbor management. Secure
                your slot today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 px-8 text-lg font-semibold"
                  asChild
                >
                  <Link href="/register">Register Now</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-lg bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  asChild
                >
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t py-12 bg-muted/20 text-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-xl text-foreground mb-4">
                <Anchor className="h-6 w-6 text-primary" />
                <span>Nautica Harbor</span>
              </div>
              <p className="text-muted-foreground max-w-sm">
                The trusted digital platform for modern harbor management. Simplifying operations
                for captains and administrators alike.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/login" className="hover:text-primary">
                    Operator Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-primary">
                    Register Vessel
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-primary">
                    Admin Access
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center text-muted-foreground">
            <p>© 2024 Nautica Harbor System. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="hover:text-primary">
                Twitter
              </Link>
              <Link href="#" className="hover:text-primary">
                LinkedIn
              </Link>
              <Link href="#" className="hover:text-primary">
                Facebook
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// --- HELPER COMPONENTS ---

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: any
  title: string
  description: string
}) {
  return (
    <Card className="border-none shadow-sm bg-muted/20 hover:bg-muted/40 transition-colors">
      <CardContent className="pt-6">
        <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2">
      <CheckCircle2 className="h-5 w-5 text-green-500" />
      <span className="font-medium">{text}</span>
    </li>
  )
}

function Step({
  number,
  title,
  desc,
  side,
}: {
  number: string
  title: string
  desc: string
  side: 'left' | 'right'
}) {
  return (
    <div className={`relative flex items-center justify-between md:justify-center w-full`}>
      {/* Content for Left Side */}
      <div
        className={`w-full md:w-[45%] mb-4 md:mb-0 ${side === 'left' ? 'order-2 md:order-1 md:text-right' : 'order-2 md:order-3 md:text-left'}`}
      >
        <div className="bg-background border p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-xl mb-2">{title}</h3>
          <p className="text-muted-foreground">{desc}</p>
        </div>
      </div>

      {/* Center Circle */}
      <div className="absolute left-0 md:left-1/2 -translate-x-1/2 md:-translate-x-1/2 flex-shrink-0 h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg border-4 border-background z-10 order-1 md:order-2">
        {number}
      </div>

      {/* Spacer for the other side */}
      <div className={`hidden md:block w-[45%] ${side === 'left' ? 'order-3' : 'order-1'}`} />

      {/* Mobile Spacer to push content right of the circle */}
      <div className="md:hidden w-16 flex-shrink-0 order-1"></div>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border rounded-lg bg-background [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 font-medium">
        <span className="text-lg">{q}</span>
        <ChevronDown className="h-5 w-5 shrink-0 transition duration-300 group-open:-rotate-180 text-muted-foreground" />
      </summary>
      <div className="px-4 pb-4 leading-relaxed text-muted-foreground">{a}</div>
    </details>
  )
}
