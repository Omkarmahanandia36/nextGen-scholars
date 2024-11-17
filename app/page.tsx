import HeroSection from '@/components/dashboard/HeroSection';
import FeaturesSection from '@/components/dashboard/FeaturesSection';
import ScheduleClassForm from '@/components/forms/ScheduleClassForm';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <ScheduleClassForm />
    </div>
  );
}
