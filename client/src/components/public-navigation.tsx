import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import logoSymbol from "@assets/Original Logo Symbol_1762113838183.png";

interface PublicNavigationProps {
  currentPage?: "home" | "solutions" | "pricing" | "early-adopter" | "faq" | "about" | "privacy";
}

export function PublicNavigation({ currentPage }: PublicNavigationProps) {
  const [location] = useLocation();
  
  const getActiveClass = (page: string) => {
    const isActive = currentPage === page || 
      (page === "home" && location === "/") ||
      (page === "solutions" && location === "/solutions") ||
      (page === "pricing" && location === "/pricing") ||
      (page === "early-adopter" && location === "/early-adopter") ||
      (page === "faq" && location === "/faq") ||
      (page === "about" && location === "/about") ||
      (page === "privacy" && location === "/privacy");
    
    return isActive 
      ? "text-blue-600 dark:text-blue-400 font-medium cursor-pointer"
      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer";
  };

  return (
    <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <img src={logoSymbol} alt="LicenseIQ" className="h-10 w-10" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">LicenseIQ</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/">
              <span className={getActiveClass("home")}>Home</span>
            </Link>
            <Link href="/solutions">
              <span className={getActiveClass("solutions")}>Solutions</span>
            </Link>
            <Link href="/pricing">
              <span className={getActiveClass("pricing")}>Pricing</span>
            </Link>
            <Link href="/early-adopter">
              <span className={getActiveClass("early-adopter")}>Early Adopter</span>
            </Link>
            <Link href="/faq">
              <span className={getActiveClass("faq")}>FAQ's</span>
            </Link>
            <Link href="/about">
              <span className={getActiveClass("about")}>About Us</span>
            </Link>
          </div>
          <Link href="/auth">
            <Button
              variant="outline"
              className="border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-medium px-6"
              data-testid="button-login"
            >
              Login
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
