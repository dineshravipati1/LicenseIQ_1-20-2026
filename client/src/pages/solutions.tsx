import { Link } from "wouter";
import { PublicNavigation } from "@/components/public-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import logoSymbol from "@assets/Original Logo Symbol_1762113838183.png";
import {
  Building2, Shield, FileText, BarChart3,
  CheckCircle, ArrowRight, Factory, Cpu,
  Package, ShoppingCart, Layers, Globe,
  DollarSign, Receipt, FileCheck, Users,
  ArrowLeft, Mail, Briefcase, TrendingUp
} from "lucide-react";
import { SiX, SiFacebook, SiInstagram, SiLinkedin } from "react-icons/si";

export default function Solutions() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
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
        email,
        name,
        company,
        source: "solutions-page",
      });
      toast({
        title: "Success!",
        description: "Thank you for your interest! We'll be in touch soon.",
      });
      setEmail("");
      setName("");
      setCompany("");
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

  const industries = [
    {
      id: "hightech",
      title: "High-Tech & Industrial Manufacturing",
      subtitle: "Distributor-led revenue, complex incentives, audit pressure",
      icon: Factory,
      gradient: "from-blue-500 to-blue-600",
      challenges: [
        "Distributor rebates and chargebacks managed in spreadsheets",
        "Limited visibility into POS and sell-through data",
        "Accruals questioned during close and audit",
      ],
      solutions: [
        "Contract-driven rebate and incentive execution",
        "POS validation against pricing and eligibility rules",
        "Automated accruals and settlement outputs",
        "Clause-to-journal audit traceability",
      ],
      erp: "NetSuite, Oracle, SAP (mid-market)",
      flows: ["Distributor Rebates", "Chargebacks", "Price Protection"],
    },
    {
      id: "licensing",
      title: "IP & Licensing-Driven Businesses",
      subtitle: "Royalty-heavy revenue with audit and compliance risk",
      icon: Shield,
      gradient: "from-purple-500 to-purple-600",
      challenges: [
        "Royalty calculations outside the ERP",
        "Licensee reports trusted without validation",
        "High audit effort and under-reporting risk",
      ],
      solutions: [
        "Clause-level royalty execution",
        "Tiered rates, minimums, and caps",
        "Licensee data validation",
        "Royalty accruals, statements, and settlements",
        "Full audit-ready evidence packages",
      ],
      erp: "Various ERPs",
      flows: ["Licensing & Royalties", "Revenue Share"],
    },
    {
      id: "cpg",
      title: "Branded Manufacturing & CPG (Mid-Market)",
      subtitle: "Rebates, MDF, and incentive complexity",
      icon: Package,
      gradient: "from-green-500 to-green-600",
      challenges: [
        "Rebate programs disconnected from contracts",
        "Claims approved without full validation",
        "Accruals and settlements don't reconcile",
      ],
      solutions: [
        "Contract-driven rebate logic",
        "Claim validation and eligibility enforcement",
        "Accurate accruals and settlements",
        "Dispute and adjustment traceability",
      ],
      erp: "Various ERPs",
      flows: ["Rebates", "MDF", "Trade Incentives"],
    },
    {
      id: "saas",
      title: "SaaS & Platform Businesses",
      subtitle: "Revenue sharing, OEM, and marketplace complexity",
      icon: Cpu,
      gradient: "from-indigo-500 to-indigo-600",
      challenges: [
        "Revenue-share logic outside billing systems",
        "Manual adjustments every close",
        "Difficulty explaining revenue splits to auditors",
      ],
      solutions: [
        "Contract-to-usage execution",
        "Revenue share and split calculations",
        "ERP-ready journal outputs",
        "Clear audit narratives for revenue allocation",
      ],
      erp: "Various ERPs",
      flows: ["Revenue Share", "OEM Agreements", "Marketplace Splits"],
    },
    {
      id: "pe",
      title: "PE-Backed & Multi-Entity Organizations",
      subtitle: "Standardization after acquisitions",
      icon: Building2,
      gradient: "from-orange-500 to-orange-600",
      challenges: [
        "Inconsistent contract execution across entities",
        "Spreadsheet-heavy close processes",
        "Elevated audit risk post-acquisition",
      ],
      solutions: [
        "Standardized contract execution across entities",
        "Centralized finance-owned control",
        "Consistent accrual and settlement logic",
        "Scalable governance model",
      ],
      erp: "Various ERPs",
      flows: ["All contract-driven revenue flows"],
    },
  ];

  const revenueFlows = [
    {
      title: "Distributor & Reseller Programs",
      icon: Users,
      items: [
        "Rebates and incentives",
        "POS and sell-through validation",
        "Price protection and chargebacks",
        "Accruals and settlements",
      ],
    },
    {
      title: "Licensing & Royalties",
      icon: FileText,
      items: [
        "Sales-based and usage-based royalties",
        "Tiered rates, minimum guarantees, caps",
        "Licensee reporting validation",
        "Royalty statements and settlements",
      ],
    },
    {
      title: "Rebates & Incentives",
      icon: DollarSign,
      items: [
        "Contract-driven eligibility logic",
        "Claim validation",
        "Accurate accruals",
        "Settlement traceability",
      ],
    },
    {
      title: "Price Protection & Chargebacks",
      icon: Shield,
      items: [
        "Contracted price validation",
        "Claim verification",
        "Credit and settlement calculations",
        "Audit defense",
      ],
    },
    {
      title: "Revenue Share & Marketplace Splits",
      icon: TrendingUp,
      items: [
        "Multi-party revenue allocation",
        "Usage and transaction-based splits",
        "ERP-ready journal outputs",
        "Audit-ready explanations",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicNavigation currentPage="solutions" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20 pt-28 pb-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-blue-600 text-white px-4 py-2">
              Contract-to-Cash Execution
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
              Solutions
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Contract-to-cash execution by industry and revenue flow
            </p>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
              LicenseIQ helps finance teams execute contract-driven revenue accurately, consistently, and audit-ready — across industries and revenue models.
            </p>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto border border-blue-200 dark:border-blue-800">
              <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                We focus on the hardest part most systems ignore:
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                Turning signed contracts into correct journal entries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions by Industry */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Solutions by{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Industry
              </span>
            </h2>
          </div>

          <div className="space-y-8 max-w-6xl mx-auto">
            {industries.map((industry) => {
              const IconComponent = industry.icon;
              return (
                <Card
                  key={industry.id}
                  className="overflow-hidden border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300"
                  data-testid={`card-industry-${industry.id}`}
                >
                  <CardContent className="p-0">
                    <div className="grid lg:grid-cols-3 gap-0">
                      {/* Header */}
                      <div className={`bg-gradient-to-br ${industry.gradient} p-6 lg:p-8 text-white`}>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                            <IconComponent className="h-7 w-7 text-white" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{industry.title}</h3>
                        <p className="text-white/80">{industry.subtitle}</p>
                        <div className="mt-6">
                          <p className="text-sm text-white/60 mb-2">Typical ERP</p>
                          <p className="text-sm font-medium">{industry.erp}</p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {industry.flows.map((flow, idx) => (
                            <Badge key={idx} className="bg-white/20 text-white border-0 text-xs">
                              {flow}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Challenges */}
                      <div className="p-6 lg:p-8 bg-red-50/50 dark:bg-red-950/20">
                        <h4 className="font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Common Challenges
                        </h4>
                        <ul className="space-y-3">
                          {industry.challenges.map((challenge, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0"></span>
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Solutions */}
                      <div className="p-6 lg:p-8 bg-green-50/50 dark:bg-green-950/20">
                        <h4 className="font-semibold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          LicenseIQ Solves
                        </h4>
                        <ul className="space-y-3">
                          {industry.solutions.map((solution, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {solution}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Solutions by Revenue Flow */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Solutions by{" "}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Revenue Flow
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {revenueFlows.map((flow, idx) => {
              const IconComponent = flow.icon;
              return (
                <Card
                  key={idx}
                  className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200 dark:hover:border-green-800"
                  data-testid={`card-flow-${idx}`}
                >
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <IconComponent className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                      {flow.title}
                    </h3>
                    <ul className="space-y-2">
                      {flow.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Contract Execution?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Request a conversation to see how LicenseIQ can help your finance team execute contract-driven revenue accurately.
            </p>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder:text-white/60 h-12"
                data-testid="input-name"
              />
              <Input
                type="email"
                placeholder="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder:text-white/60 h-12"
                data-testid="input-email"
              />
              <Input
                type="text"
                placeholder="Company (optional)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder:text-white/60 h-12"
                data-testid="input-company"
              />
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full h-14 text-lg bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                data-testid="button-submit-request"
              >
                {isSubmitting ? "Submitting..." : "Request a Conversation"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
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
