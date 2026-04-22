// components/luxury/HomePage.tsx
import Navbar from '@/components/luxury/Navbar';
import HeroSection from '@/components/luxury/HeroSection';
import StatsBar from '@/components/luxury/StatsBar';
import FleetSection from '@/components/luxury/FleetSection';
import OperatorsSection from '@/components/luxury/OperatorsSection';
import RoutesSection from '@/components/luxury/RoutesSection';
import EmptyLegsSection from '@/components/luxury/EmptyLegsSection';
import MembershipSection from '@/components/luxury/MembershipSection';
import ContactSection from '@/components/luxury/ContactSection';
import Footer from '@/components/luxury/Footer';
import ConciergeChat from '@/components/luxury/ConciergeChat';
import WhatsAppButton from '@/components/luxury/WhatsAppButton';
import MobileBottomNav from '@/components/luxury/MobileBottomNav';
import CookieBanner from '@/components/CookieBanner';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <FleetSection />
        <OperatorsSection />
        <RoutesSection />
        <EmptyLegsSection />
        <MembershipSection />
        <ContactSection />
      </main>
      <Footer />
      <ConciergeChat />
      <WhatsAppButton />
      <MobileBottomNav />
      <CookieBanner />
    </>
  );
}
