import { Link } from "wouter";
import { PublicNavigation } from "@/components/public-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import logoSymbol from "@assets/Original Logo Symbol_1762113838183.png";
import {
  CheckCircle, ArrowRight, Shield, Users, Building2,
  FileCheck, TrendingUp, Lock, BarChart3, Zap,
  Target, Award, Handshake, Clock, DollarSign,
  FileText, Globe, Layers, HelpCircle
} from "lucide-react";
import { SiX, SiFacebook, SiInstagram, SiLinkedin } from "react-icons/si";

export default function EarlyAdopter() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
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
        source: "early-adopter-program",
        message: `Role: ${formData.role}\n\n${formData.message}`
      });
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and be in touch soon.",
      });
      setFormData({ name: "", email: "", company: "", role: "", message: "" });
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

  const whoIsItFor = [
    "Operate on a NetSuite-era or mid-market ERP",
    "Manage distributor, reseller, licensing, royalty, or incentive contracts",
    "Rely on signed agreements and spreadsheets to calculate accruals or settlements",
    "Face recurring challenges during close, audits, or partner disputes",
    "Want Finance to own contract execution and financial truth"
  ];

  const channelFlows = [
    "Distributor and reseller rebates",
    "Sell-in and sell-through incentives",
    "POS and transaction validation",
    "Accruals and settlement calculations",
    "Price protection and chargebacks"
  ];

  const licensingFlows = [
    "Sales-based and usage-based royalties",
    "Tiered rates, minimum guarantees, and caps",
    "Licensee reporting validation",
    "Multi-currency calculations",
    "Royalty accruals, settlements, and statements"
  ];

  const whatYouGet = [
    { icon: Zap, text: "Production access to LicenseIQ for scoped contract flows" },
    { icon: Users, text: "Guided onboarding with direct access to the founding team" },
    { icon: FileCheck, text: "Contract-to-journal traceability configured using real contracts and data" },
    { icon: Target, text: "Priority influence on product roadmap and execution patterns" },
    { icon: Shield, text: "Early access to audit, variance, and dispute-resolution capabilities" }
  ];

  const commercialTerms = [
    { icon: DollarSign, text: "Founding-customer pricing (below future list pricing)" },
    { icon: Award, text: "Discounted or credited implementation fees" },
    { icon: Lock, text: "Multi-year price protection" },
    { icon: Layers, text: "Flexible scope during the initial deployment" }
  ];

  const whatWeAsk = [
    "Commit to an initial production deployment",
    "Provide structured feedback during onboarding",
    "Participate in a reference or case study once value is proven (timing agreed mutually)"
  ];

  const whyWereDoingThis = [
    { title: "Deterministic, contract-driven execution", icon: FileCheck },
    { title: "Finance-owned control and accountability", icon: Shield },
    { title: "Audit-ready proof", icon: FileText },
    { title: "Built-in conflict resolution", icon: Handshake }
  ];

  const faqs = [
    {
      question: "Is this a beta or pilot product?",
      answer: "No. LicenseIQ is deployed in production environments as a financial execution and control layer. The Early Adopter Program is about partnership and scope, not product maturity. Early adopters receive priority onboarding and influence over roadmap sequencing, but deployments are production-grade from day one."
    },
    {
      question: "What problem does LicenseIQ actually solve for Finance?",
      answer: "LicenseIQ gives Finance end-to-end traceability from a signed contract to ERP journal entries. Specifically, it converts contract clauses into executable financial logic, validates real transaction data against those contracts, calculates accruals and settlements deterministically, and produces audit-ready journal outputs with full lineage. This replaces spreadsheet-driven interpretation with finance-owned execution and proof."
    },
    {
      question: "How is this different from our ERP, pricing tools, or incentive systems?",
      answer: "Most systems handle parts of the process: ERPs book results, pricing tools optimize prices, incentive tools manage payouts. LicenseIQ sits between contracts and the books. It ensures the numbers Finance posts are correct, explainable, and defensible — regardless of which upstream systems you use."
    },
    {
      question: "Do we need to replace any existing systems?",
      answer: "No. LicenseIQ does not replace your ERP, does not set prices or approve deals, and does not require ripping out existing tools. It integrates with your current environment and produces ERP-ready outputs while your ERP remains the system of record."
    },
    {
      question: "What contract flows can we start with?",
      answer: "Early adopters typically start with one or two high-impact flows, such as distributor or reseller rebates, price protection or chargebacks, or licensing and royalties. Additional flows can be added over time using the same execution engine."
    },
    {
      question: "How long does implementation take?",
      answer: "Typical timelines are 4–6 weeks for a focused initial deployment. This depends on contract complexity, data readiness, and number of flows. Implementation ensures Finance signs off on contract logic, data validation, and accrual and settlement outputs before go-live."
    },
    {
      question: "Why is there an implementation fee?",
      answer: "Implementation de-risks the deployment for Finance. It covers contract normalization and rule validation, data mapping and reconciliation, ERP output verification, and a close-cycle dry run. Early adopters may receive discounted or credited implementation fees, but the work itself is essential to ensure trust in the numbers."
    },
    {
      question: "How is pricing determined?",
      answer: "Pricing is based on revenue under management, contract and data complexity, and number of flows in scope. It is not based on number of users, number of documents, or usage/compute. Most early adopters see 5–10× ROI through leakage reduction, close efficiency, and audit risk reduction."
    },
    {
      question: "Is LicenseIQ SOC / audit ready?",
      answer: "LicenseIQ is designed for audit defensibility, including clause-to-journal traceability, reproducible calculations, and clear evidence packages for auditors. Formal certifications can be discussed as part of enterprise rollout planning."
    },
    {
      question: "What does 'early adopter' mean in practice?",
      answer: "Early adopters get priority access to the founding team, influence roadmap sequencing, receive favorable commercial terms, and shape how the category evolves. It is a design partnership, not a trial program."
    },
    {
      question: "What happens after the early adopter phase?",
      answer: "Early adopters retain their pricing protections, expand scope at agreed commercial terms, and transition seamlessly into standard support and governance models. There is no forced re-platforming or re-implementation."
    },
    {
      question: "How do we know if we're a good fit?",
      answer: "You're likely a strong fit if Finance relies on spreadsheets to execute contract-driven revenue, accruals or settlements require explanation every close, audits or disputes create recurring friction, and you want Finance — not Sales Ops — to own financial truth."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicNavigation currentPage="early-adopter" />

      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-white/20 text-white border-0 px-4 py-2 mb-6">
              Limited Partnership Program
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Early Adopter Program</h1>
            <p className="text-xl md:text-2xl text-white/90 mb-6">
              Build the financial control layer for contract-driven revenue
            </p>
            <p className="text-lg text-white/80 max-w-3xl mx-auto mb-8">
              LicenseIQ is inviting a limited number of early adopter customers to partner with us as we define a new standard for contract-to-cash financial control.
            </p>
            <p className="text-white/70">
              This program is designed for finance teams managing channel programs, licensing, royalties, and incentive agreements who want end-to-end traceability from signed contracts to ERP journal entries.
            </p>
          </div>
        </div>
      </section>

      {/* Who This Program Is For */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 text-center">
              Who This Program Is For
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-300 mb-12">
              The Early Adopter Program is a strong fit if you:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {whoIsItFor.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-slate-500 dark:text-slate-400 mt-8 italic">
              This program is intentionally finance-led, not sales- or pricing-driven.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Contract Flows */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">
              Supported Contract-to-Cash Flows
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <Building2 className="h-6 w-6" />
                    Channel & Partner Programs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {channelFlows.map((flow, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        {flow}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardHeader className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardTitle className="flex items-center gap-3">
                    <FileText className="h-6 w-6" />
                    Licensing & Royalties
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-3">
                    {licensingFlows.map((flow, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <CheckCircle className="h-4 w-4 text-purple-500" />
                        {flow}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <p className="text-center text-slate-500 dark:text-slate-400 mt-8">
              All flows use the same execution engine and provide full traceability from contract clause to journal entry.
            </p>
          </div>
        </div>
      </section>

      {/* What Early Adopters Get */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">
              What Early Adopters Get
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {whatYouGet.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Commercial Terms */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 text-center">
              Commercial Terms
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-300 mb-12">
              Transparent, not promotional
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {commercialTerms.map((term, idx) => {
                const IconComponent = term.icon;
                return (
                  <div key={idx} className="flex items-center gap-4 p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{term.text}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-slate-500 dark:text-slate-400 mt-8">
              Pricing is based on revenue under management and contract complexity, not per user or per document.
            </p>
          </div>
        </div>
      </section>

      {/* What We Ask */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 text-center">
              What We Ask in Return
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-300 mb-12">
              Because this is a partnership program, we ask early adopters to:
            </p>
            <div className="max-w-2xl mx-auto space-y-4">
              {whatWeAsk.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                    {idx + 1}
                  </div>
                  <span className="text-slate-700 dark:text-slate-300">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-slate-500 dark:text-slate-400 mt-8 italic">
              This ensures the program remains focused, collaborative, and high-signal.
            </p>
          </div>
        </div>
      </section>

      {/* Why We're Doing This */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Why We're Doing This</h2>
            <p className="text-slate-300 mb-12 max-w-2xl mx-auto">
              Most mid-market companies still execute channel and licensing contracts using spreadsheets layered on top of signed documents and ERPs. LicenseIQ exists to replace that with:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {whyWereDoingThis.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-4 p-5 bg-white/10 rounded-xl">
                    <IconComponent className="h-6 w-6 text-blue-400" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xl text-blue-300 mt-12 font-medium">
              Early adopters help shape this category — and benefit first.
            </p>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <h2 className="text-4xl font-bold mb-6">Apply for the Early Adopter Program</h2>
                <p className="text-xl text-blue-100 mb-6">
                  We are accepting a limited number of early adopter customers.
                </p>
                <p className="text-blue-200">
                  If LicenseIQ could materially improve how your finance team executes contract-driven revenue, we'd like to talk.
                </p>
                <p className="text-blue-300 text-sm mt-8 italic">
                  The Early Adopter Program is limited and subject to qualification. Not all applicants will be accepted.
                </p>
              </div>

              <Card className="bg-white dark:bg-slate-900 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 dark:text-white">Request a Conversation</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Your name *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-11"
                      required
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
                      placeholder="Company *"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="h-11"
                      required
                      data-testid="input-company"
                    />
                    <Input
                      type="text"
                      placeholder="Your role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="h-11"
                      data-testid="input-role"
                    />
                    <Textarea
                      placeholder="Tell us about your contract flows and challenges"
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
                      data-testid="button-apply"
                    >
                      {isSubmitting ? "Submitting..." : "Apply Now"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-4">
                For Finance & Accounting Leaders
              </Badge>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-left font-medium text-slate-900 dark:text-white hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 dark:text-slate-300">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="text-center text-slate-500 dark:text-slate-400 mt-12 italic">
              LicenseIQ is built for finance leaders who want certainty, not just automation.
            </p>
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
                <li><Link href="/early-adopter"><span className="hover:text-white cursor-pointer">Early Adopter</span></Link></li>
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
