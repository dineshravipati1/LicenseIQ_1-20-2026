import { Link } from "wouter";
import { PublicNavigation } from "@/components/public-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logoSymbol from "@assets/Original Logo Symbol_1762113838183.png";
import { SiX, SiFacebook, SiInstagram, SiLinkedin } from "react-icons/si";

export default function Privacy() {
  const subProcessors = [
    { name: "Amazon Web Services", description: "Cloud service provider located in the United States." },
    { name: "Atlassian", description: "Status page and service availability system." },
    { name: "Backblaze", description: "Cloud storage and data backup provider located in the United States." },
    { name: "CookieYes", description: "Cookie consent management." },
    { name: "GitHub", description: "Source code hosting provider located in the United States." },
    { name: "Google", description: "Cloud service provider, search marketer, and analytics provider located in the United States." },
    { name: "Hubspot", description: "Marketing automation and CRM provider in the United States." },
    { name: "nGrok", description: "Ingress platform for local development." },
    { name: "Open Exchange Rates", description: "API for real-time currency conversion." },
    { name: "ReadMe", description: "API documentation platform located in the United States." },
    { name: "Sentry.io (Functional Software, Inc.)", description: "Error detection provider in the United States." },
    { name: "Slack", description: "Messaging platform based in the United States." },
    { name: "Stripe", description: "Payment processor located in the United States." },
    { name: "Vanta", description: "Continuous security and compliance monitoring." },
    { name: "Zendesk", description: "Cloud customer service provider located in the United States." },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <PublicNavigation currentPage="privacy" />

      {/* Content */}
      <section className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              This privacy policy applies across all websites that we own and operate and all services we provide. We define "personal data" as identifiable information about you, like your name, email, address, telephone number, payment information, etc.
            </p>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              We update this policy from time to time. When there is a significant change to this policy, we will notify you via the email address you have provided to us.
            </p>

            <div className="prose prose-slate dark:prose-invert max-w-none space-y-10">
              {/* Who is Cimpleit */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Who is Cimpleit?</h2>
                <p className="text-slate-600 dark:text-slate-300">
                  When we refer to "we" (or "our" or "us"), that means Cimpleit, Inc. (doing business as LicenseIQ). We provide a financial intelligence platform that helps businesses with commercial contract calculations and accounting.
                </p>
              </section>

              {/* Data Protection Principles */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Data Protection Principles</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">Our approach to data protection is built around the following principles.</p>
                <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2">
                  <li>We are honest and transparent in how we collect and use your information.</li>
                  <li>We enable efficient use of personal data to empower productivity and growth.</li>
                  <li>We use industry leading approaches to securing the personal data entrusted to us.</li>
                  <li>We accept the responsibility that comes with processing personal data.</li>
                </ul>
              </section>

              {/* How We Collect Your Data */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How We Collect Your Data</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">When you visit our websites or use our services, we collect personal data. The ways we collect it can be broadly categorized into the following:</p>
                
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-2">Information you provide to us directly:</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  When you visit or use some parts of our websites and/or services we might ask you to provide personal data to us. For example, we ask for your contact information when you sign up for a free trial, take part in training and events, contact us with questions or request support. If you don't want to provide us with personal data, you don't have to, but it might mean you can't use some parts of our websites or services.
                </p>

                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-2">Information we collect automatically:</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  We collect some information about you automatically when you visit our websites or use our services, like your IP address and device type. We also collect information when you navigate through our websites and services, including what pages you looked at and what links you clicked on. This information is useful for us as it helps us get a better understanding of how you're using our websites and services so that we can continue to provide the best experience.
                </p>

                <p className="text-slate-600 dark:text-slate-300 mb-4">Where we collect personal data, we'll only process it:</p>
                <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2">
                  <li>to provide our service to you, or</li>
                  <li>where we have legitimate interests to process the personal data and they're not overridden by your rights, or</li>
                  <li>in accordance with a legal obligation, or</li>
                  <li>where we have your consent.</li>
                </ul>
                <p className="text-slate-600 dark:text-slate-300 mt-4">
                  If we don't collect your personal data, we may be unable to provide you with all our services, and some functions and features on our websites may not be available to you.
                </p>
              </section>

              {/* How We Use Your Data */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How We Use Your Data</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  First and foremost, we use your personal data to operate our websites and provide you with any services you've requested, and to manage our relationship with you. We also use your personal data for other purposes, which may include the following:
                </p>
                <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2">
                  <li>providing you with information you've requested from us (like training or education materials) or information we are required to send to you</li>
                  <li>sending you operational communications, like changes to our websites and services, security updates, or assistance with using our websites and services</li>
                  <li>marketing communications in accordance with your preferences</li>
                  <li>asking you for feedback or to take part in any research we are conducting (which we may engage a third party to assist with)</li>
                  <li>assisting with the resolution of technical support issues or other issues relating to the websites or services, whether by email, in-app support or otherwise</li>
                  <li>tracking and monitoring your use of websites and services so we can keep improving</li>
                  <li>detecting and preventing any fraudulent or malicious activity</li>
                  <li>sending you marketing communications and displaying targeted advertising to you online through our own websites and services or through third party websites and their platforms.</li>
                </ul>
              </section>

              {/* How We Can Share Your Data */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How We Can Share Your Data</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  There will be times when we need to share your personal data with third parties. We will only disclose your personal data to:
                </p>
                <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2">
                  <li>third party service providers and partners who enable us to provide functionality via our websites or to market our goods and services to you</li>
                  <li>regulators, law enforcement bodies, government agencies, courts or other third parties where we think it's necessary to comply with applicable laws or regulations, or to exercise, establish or defend our legal rights. Where possible and appropriate, we will notify you of this type of disclosure</li>
                  <li>an actual or potential buyer (and its agents and advisors) in connection with an actual or proposed purchase, merger or acquisition of any part of our business</li>
                  <li>other people where we have your consent.</li>
                </ul>
              </section>

              {/* Security */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Security</h2>
                <p className="text-slate-600 dark:text-slate-300">
                  Security is a priority for us when it comes to your personal data. We're committed to protecting your personal data and have appropriate technical and organizational measures in place to make sure that happens.
                </p>
              </section>

              {/* Retention */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Retention</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  The length of time we keep your personal data depends on what it is and whether we have an ongoing business need to retain it (for example, to provide you with a service you've requested or to comply with applicable legal, tax or accounting requirements).
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  We'll retain your personal data for as long as we have a relationship with you and for a period of time afterwards where we have an ongoing business need to retain it, in accordance with our data retention policies and practices.
                </p>
              </section>

              {/* GDPR */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Processing Personal Data under General Data Protection Regulation (GDPR)</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  If you are from the European Economic Area (EEA), our legal basis for collecting and using the personal information described in this Privacy Policy depends on the personal data we collect and the specific context in which we collect it.
                </p>
                <p className="text-slate-600 dark:text-slate-300 mb-4">We may process your personal data because:</p>
                <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2">
                  <li>We need to perform a contract with you</li>
                  <li>You have given us permission to do so</li>
                  <li>The processing is in our legitimate interests and it's not overridden by your rights</li>
                  <li>For payment processing purposes</li>
                  <li>To comply with the law</li>
                </ul>
              </section>

              {/* Data Privacy Framework */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Data Privacy Framework Commitment and Compliance</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Cimpleit, Inc. complies with the EU-U.S. Data Privacy Framework (EU-U.S. DPF) and the UK Extension to the EU-U.S. DPF, and the Swiss-U.S. Data Privacy Framework (Swiss-U.S. DPF) as set forth by the U.S. Department of Commerce. Cimpleit, Inc. has certified to the U.S. Department of Commerce that it adheres to the EU-U.S. Data Privacy Framework Principles (EU-U.S. DPF Principles) with regard to the processing of personal data received from the European Union and the United Kingdom in reliance on the EU-U.S. DPF and the UK Extension to the EU-U.S. DPF, and from Switzerland in reliance on the Swiss-U.S. DPF.
                </p>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  In compliance with the EU-U.S. DPF and the UK Extension to the EU-U.S. DPF and the Swiss-U.S. DPF, Cimpleit, Inc. commits to cooperate and comply respectively with the advice of the panel established by the EU data protection authorities (DPAs) and the UK Information Commissioner's Office (ICO) and the Swiss Federal Data Protection and Information Commissioner (FDPIC) with regard to unresolved complaints concerning our handling of human resources data received in reliance on the EU-U.S. DPF and the UK Extension to the EU-U.S. DPF and the Swiss-U.S. DPF in the context of the employment relationship.
                </p>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Cimpleit, Inc. is subject to the investigatory and enforcement powers of the Federal Trade Commission (FTC). Under certain conditions, you may invoke binding arbitration. Cimpleit, Inc. is obligated to arbitrate claims and follow the terms as set forth in Annex I of the DPF Principles, provided that an individual has invoked binding arbitration by delivering notice to us and following the procedures and subject to conditions set forth in Annex I of Principles.
                </p>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Cimpleit, Inc. is required to disclose personal information in response to lawful requests by public authorities, including to meet national security or law enforcement requirements.
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Cimpleit, Inc. remains responsible for any of your personal information that is shared under the Onward Transfer Principle with third parties for external processing on our behalf.
                </p>
              </section>

              {/* International Data Transfer */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">International Data Transfer and Storage of Data</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Your personal information may be transferred to, and processed in, countries other than the country in which you reside. These countries may have data protection laws that are different to the laws of your country, and in some cases, may not be as protective. Specifically, our website servers are primarily located in the U.S. and we may process your personal information in jurisdictions where our affiliates, partners and third-party service providers are located.
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  We will take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy and no transfer of your personal data will take place to an organization or a country unless there are adequate controls in place including the security of your data and other personal information.
                </p>
              </section>

              {/* Do Not Track */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">"Do Not Track" Support</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  We do not support Do Not Track. Do Not Track is a preference you can set in your web browser to inform websites that you do not want to be tracked.
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  You can enable or disable Do Not Track by visiting the Preferences or Settings page of your web browser.
                </p>
              </section>

              {/* GDPR Rights */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Data Protection Rights You Have Under the General Data Protection Regulation (GDPR)</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  If you are a resident of the European Economic Area, you have certain data protection rights. We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your personal data.
                </p>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  If you wish to be informed what personal data we hold about you and if you want it to be removed from our systems, please contact us.
                </p>
                <p className="text-slate-600 dark:text-slate-300 mb-4">In certain circumstances, you have the following data protection rights:</p>
                <ul className="list-disc pl-6 text-slate-600 dark:text-slate-300 space-y-2">
                  <li><strong>The right to access, update or to delete the information we have on you.</strong> Whenever made possible, you can access, update or request deletion of your personal data directly within your account settings or profile. If you are unable to perform these actions yourself, please contact us to assist you.</li>
                  <li><strong>The right of rectification.</strong> You have the right to have your information rectified if that information is inaccurate or incomplete.</li>
                  <li><strong>The right to object.</strong> You have the right to object to our processing of your personal data.</li>
                  <li><strong>The right of restriction.</strong> You have the right to request that we restrict the processing of your personal information.</li>
                  <li><strong>The right to data portability.</strong> You have the right to be provided with a copy of the information we have on you in a structured, machine-readable and commonly used format.</li>
                  <li><strong>The right to withdraw consent.</strong> You also have the right to withdraw your consent at any time where we relied on your consent to process your personal information.</li>
                </ul>
                <p className="text-slate-600 dark:text-slate-300 mt-4">
                  Please note that we may ask you to verify your identity before responding to such requests.
                </p>
                <p className="text-slate-600 dark:text-slate-300 mt-4">
                  You have the right to complain to a Data Protection Authority about our collection and use of your personal data. For more information, please contact your local data protection authority in the European Economic Area.
                </p>
              </section>

              {/* Sub-processors */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Sub-processors</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  We use certain sub-processors to assist in providing our services. A sub-processor is a third party data processor engaged by us who agrees to receive personal data intended for processing activities to be carried out (i) on behalf of our customers; (ii) in accordance with customer instructions as communicated by us; and (iii) in accordance with the terms of a written contract between us and the sub-processor.
                </p>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  We maintain an up-to-date list of the names and locations of all sub-processors. This list is below.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {subProcessors.map((sp, idx) => (
                    <Card key={idx} className="border border-slate-200 dark:border-slate-700">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{sp.name}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{sp.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Payment Processing */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Payment Processing</h2>
                <p className="text-slate-600 dark:text-slate-300">
                  We may provide paid products and/or services within the service. In that case, we use third-party services for payment processing (e.g. payment processors). We will not store or collect your payment card details. That information is provided directly to our third-party payment processors whose use of your personal information is governed by their Privacy Policy. These payment processors adhere to the standards set by PCI-DSS as managed by the PCI Security Standards Council.
                </p>
              </section>

              {/* Contact Us */}
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Contact Us</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Email: privacy@licenseiq.ai<br />
                  Cimpleit, Inc. (d/b/a LicenseIQ)
                </p>
              </section>
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
                <li><Link href="/early-adopter"><span className="hover:text-white cursor-pointer">Early Adopter</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/privacy"><span className="hover:text-white cursor-pointer">Privacy Policy</span></Link></li>
                <li><Link href="/faq"><span className="hover:text-white cursor-pointer">FAQ</span></Link></li>
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
