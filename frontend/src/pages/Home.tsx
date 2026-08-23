import Hero from '../components/Hero/Hero';
import About from '../components/About/About';
import Services from '../components/Services/Services';
import Resources from '../components/Resources/Resources';
import Statistics from '../components/Statistics/Statistics';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <Hero />
      <About />
      <Services />
      <Resources />
      <Statistics />
    </div>
  );
};

export default Home;
