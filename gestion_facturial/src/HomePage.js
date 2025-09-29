import React from 'react';
import './HomePage.css';
// import ParticlesBackground from './ParticlesBackground';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import PricingSection from './PricingSection';
import FooterSection from './FooterSection';
import TestimonialsSection from './TestimonialsSection';
import { ThemeProvider } from './ThemeContext';
import Header from './Header';
const HomePages = () => {


  return (
    <ThemeProvider>
    <div className="homepage">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
    </div>
  </ThemeProvider>
  );
};
function HomePage() {
  return (
    <div className="home-page">
      <HomePages />
      <FooterSection />
    </div>
  );
}
export default HomePage;
