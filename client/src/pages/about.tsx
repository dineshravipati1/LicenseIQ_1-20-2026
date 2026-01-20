import { Link } from "wouter";
import { PublicNavigation } from "@/components/public-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logoSymbol from "@assets/Original Logo Symbol_1762113838183.png";
import {
  ArrowLeft, Target, Users, Shield, Zap,
  Award, Globe, CheckCircle
} from "lucide-react";
import { SiX, SiFacebook, SiInstagram, SiLinkedin } from "react-icons/si";

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicNavigation currentPage="about" />

      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">About LicenseIQ</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              We're on a mission to transform how finance teams execute contract-driven revenue.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Our Mission</h2>
                <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
                  LicenseIQ was founded with a clear vision: to eliminate the gap between signed contracts and accurate financial execution.
                </p>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                  We believe that finance teams shouldn't spend their time manually translating contract terms into spreadsheets. Our AI-native platform automates this process, ensuring accuracy, consistency, and audit-readiness.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="text-center p-6">
                  <Target className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-900 dark:text-white">Precision</h4>
                  <p className="text-sm text-slate-500 mt-2">Clause-level accuracy</p>
                </Card>
                <Card className="text-center p-6">
                  <Zap className="h-10 w-10 text-green-600 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-900 dark:text-white">Speed</h4>
                  <p className="text-sm text-slate-500 mt-2">Instant processing</p>
                </Card>
                <Card className="text-center p-6">
                  <Shield className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-900 dark:text-white">Compliance</h4>
                  <p className="text-sm text-slate-500 mt-2">Audit-ready outputs</p>
                </Card>
                <Card className="text-center p-6">
                  <Globe className="h-10 w-10 text-indigo-600 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-900 dark:text-white">Scale</h4>
                  <p className="text-sm text-slate-500 mt-2">Enterprise-grade</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Accuracy First</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Every calculation must be traceable to its source contract clause.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Customer Success</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  We succeed when our customers achieve audit-ready confidence.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Innovation</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  We leverage AI to solve problems that were previously unsolvable.
                </p>
              </div>
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
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                  <SiX className="h-5 w-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                  <SiFacebook className="h-5 w-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                  <SiInstagram className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
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
