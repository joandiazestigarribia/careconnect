import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import ForWhomSection from '../components/landing/ForWhomSection';
import SafetySection from '../components/landing/SafetySection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CTASection from '../components/landing/CTASection';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-bg-main">
      <LandingNavbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <ForWhomSection />
        <SafetySection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
