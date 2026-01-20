import { Link } from "wouter";
import { PublicNavigation } from "@/components/public-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import logoSymbol from "@assets/Original Logo Symbol_1762113838183.png";
import {
  CheckCircle, ArrowRight, Shield, Zap, Building2,
  FileCheck, TrendingUp, Users, Lock, BarChart3,
  Globe, Award, Layers
} from "lucide-react";
import { SiX, SiFacebook, SiInstagram, SiLinkedin } from "react-icons/si";

export default function Pricing() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/early-access-signup", {
        email: formData.email,
        name: formData.name,
        company: formData.company,
        source: "pricing-page",
        message: formData.message
      });
      toast({
        title: "Request Submitted!",
        description: "We'll be in touch soon to discuss pricing.",
      });
      setFormData({ name: "", email: "", company: "", message: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tiers = [
    {
      name: "Control",
      description: "Designed for finance teams replacing spreadsheets with deterministic, contract-driven execution.",
      features: [
        "Contract ingestion and clause-to-rule execution",
        "Support for one core contract flow (e.g., distributor rebates, royalties, or chargebacks)",
        "Transaction or POS data ingestion",
        "Deterministic calculations and accrual outputs",
        "ERP-ready journal entry outputs",
        "Clause-to-journal traceability",
        "Finance-owned review and approval controls"
      ],
      bestFor: "Mid-market organizations establishing financial control over a high-impact contract flow.",
      gradient: "from-blue-500 to-blue-600",
      icon: Shield
    },
    {
      name: "Assurance",
      description: "Designed for finance teams that need consistency, audit confidence, and repeatability across multiple contract flows.",
      features: [
        "Everything in Control, plus:",
        "Support for multiple contract flows",
        "Advanced validation and eligibility rules",
        "Period-over-period consistency controls",
        "Variance detection and exception tracking",
        "Audit-ready evidence packages",
        "Dispute and adjustment traceability"
      ],
      bestFor: "Finance organizations under audit scrutiny managing multiple channel or licensing programs.",
      gradient: "from-purple-500 to-purple-600",
      icon: FileCheck,
      popular: true
    },
    {
      name: "Governance",
      description: "Designed for finance leaders who require enterprise-grade oversight, scalability, and predictability.",
      features: [
        "Everything in Assurance, plus:",
        "Multi-entity and multi-region support",
        "Advanced audit and compliance reporting",
        "Predictive leakage and variance insights",
        "Role-based controls and governance workflows",
        "Priority roadmap influence and strategic support"
      ],
      bestFor: "Complex or PE-backed organizations where contract-driven revenue is material to financial reporting.",
      gradient: "from-indigo-500 to-indigo-600",
      icon: Building2
    }
  ];

  const pricingFactors = {
    included: [
      { text: "Revenue under management", icon: TrendingUp },
      { text: "Contract and rule complexity", icon: Layers },
      { text: "Number of contract flows", icon: BarChart3 },
      { text: "Data sources and ERP integrations", icon: Globe }
    ],
    excluded: [
      "Number of users",
      "Volume of documents",
      "Transaction counts",
      "AI usage or compute"
    ]
  };

  const implementationItems = [
    "Contract normalization and rule validation",
    "Data mapping and reconciliation",
    "ERP output verification",
    "Close-cycle validation prior to go-live"
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicNavigation currentPage="pricing" />

      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="bg-blue-600 text-white px-4 py-2 mb-6">
              Value-Based Pricing
            </Badge>
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">Pricing</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-4">
              Value-based pricing for contract-driven revenue
            </p>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              LicenseIQ is priced based on the financial complexity and revenue under management, not per user, document, or transaction.
            </p>
            <p className="text-lg text-slate-500 dark:text-slate-400 mt-4">
              Our pricing reflects the value we deliver: <span className="text-slate-700 dark:text-slate-200 font-medium">accuracy, control, audit-ready execution, and reduced revenue leakage.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Pricing Tiers
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier) => {
              const IconComponent = tier.icon;
              return (
                <Card
                  key={tier.name}
                  className={`relative overflow-hidden border-2 ${
                    tier.popular ? "border-purple-400 shadow-xl" : "border-slate-200 dark:border-slate-700"
                  }`}
                  data-testid={`card-tier-${tier.name.toLowerCase()}`}
                >
                  {tier.popular && (
                    <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      POPULAR
                    </div>
                  )}
                  <CardHeader className={`bg-gradient-to-br ${tier.gradient} text-white pb-8`}>
                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                      <IconComponent className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                    <p className="text-white/80 text-sm mt-2">{tier.description}</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">
                      Typically includes:
                    </p>
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Best for:</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{tier.bestFor}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Implementation Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                  Implementation & Onboarding
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  Implementation is scoped separately to ensure accuracy, trust, and audit readiness.
                </p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">
                  Implementation typically includes:
                </p>
                <ul className="space-y-3">
                  {implementationItems.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Early Adopter Program</strong> participants may receive discounted or credited implementation as part of their partnership.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                  How Pricing is Determined
                </h2>
                <div className="mb-8">
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-4">
                    Pricing is influenced by:
                  </p>
                  <ul className="space-y-3">
                    {pricingFactors.included.map((factor, idx) => {
                      const IconComponent = factor.icon;
                      return (
                        <li key={idx} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                          <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <IconComponent className="h-4 w-4 text-green-600" />
                          </div>
                          {factor.text}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">
                    Pricing is NOT based on:
                  </p>
                  <ul className="space-y-2">
                    {pricingFactors.excluded.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <h2 className="text-4xl font-bold mb-6">How to Get Started</h2>
                <p className="text-xl text-blue-100 mb-6">
                  Most customers start with one high-impact contract flow and expand over time.
                </p>
                <p className="text-blue-200 text-sm">
                  Final pricing is determined based on scope, complexity, and deployment requirements.
                </p>
              </div>

              <Card className="bg-white dark:bg-slate-900 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 dark:text-white">Request Pricing</CardTitle>
                  <p className="text-sm text-slate-500">Book a conversation with our team</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-11"
                      data-testid="input-name"
                    />
                    <Input
                      type="email"
                      placeholder="Work email *"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-11"
                      required
                      data-testid="input-email"
                    />
                    <Input
                      type="text"
                      placeholder="Company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="h-11"
                      data-testid="input-company"
                    />
                    <Textarea
                      placeholder="Tell us about your contract flows (optional)"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="resize-none"
                      rows={3}
                      data-testid="input-message"
                    />
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      data-testid="button-submit"
                    >
                      {isSubmitting ? "Submitting..." : "Request Pricing"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src={logoSymbol} alt="LicenseIQ" className="h-10 w-10" />
                <span className="text-xl font-bold">LicenseIQ</span>
              </div>
              <p className="text-slate-400 text-sm">
                AI-powered contract-to-cash execution platform for finance teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/"><span className="hover:text-white cursor-pointer">Home</span></Link></li>
                <li><Link href="/about"><span className="hover:text-white cursor-pointer">About Us</span></Link></li>
                <li><Link href="/solutions"><span className="hover:text-white cursor-pointer">Solutions</span></Link></li>
                <li><Link href="/pricing"><span className="hover:text-white cursor-pointer">Pricing</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/privacy"><span className="hover:text-white cursor-pointer">Privacy Policy</span></Link></li>
                <li><Link href="/privacy"><span className="hover:text-white cursor-pointer">Terms of Service</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>info@licenseiq.ai</li>
                <li>+1 (555) 123-4567</li>
              </ul>
              <div className="flex gap-4 mt-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  <SiX className="h-5 w-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  <SiFacebook className="h-5 w-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  <SiInstagram className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                  <SiLinkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2025 LicenseIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
