import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTrendingUp, FiStar, FiZap } from 'react-icons/fi';
import { getEvents } from '../services/api';
import HeroBanner from '../components/common/HeroBanner';
import EventCard from '../components/events/EventCard';
import PageTransition from '../components/common/PageTransition';
const categories = [
  { name: 'Movies', icon: '🎬', color: 'from-blue-600/30 to-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  { name: 'Concerts', icon: '🎵', color: 'from-purple-600/30 to-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  { name: 'Sports', icon: '⚽', color: 'from-green-600/30 to-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  { name: 'Comedy', icon: '😂', color: 'from-yellow-600/30 to-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  { name: 'Festivals', icon: '🎪', color: 'from-orange-600/30 to-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
  { name: 'Theatre', icon: '🎭', color: 'from-pink-600/30 to-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400' },
];

const SkeletonCard = () => (
  <div className="card">
    <div className="shimmer aspect-[3/2]" />
    <div className="p-4 space-y-2">
      <div className="shimmer h-4 rounded w-3/4" />
      <div className="shimmer h-3 rounded w-1/2" />
      <div className="shimmer h-3 rounded w-2/3" />
    </div>
  </div>
);

const Section = ({ title, icon, viewAllLink, children, loading }) => (
  <section className="mb-14">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
      </div>
      <Link to={viewAllLink} className="flex items-center gap-1 text-primary hover:text-primary-light text-sm font-medium transition-colors">
        View all <FiArrowRight className="w-4 h-4" />
      </Link>
    </div>
    {loading ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {children}
      </div>
    )}
  </section>
);

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, trendingRes, allRes] = await Promise.all([
          getEvents({ featured: 'true', limit: 5 }),
          getEvents({ trending: 'true', limit: 8 }),
          getEvents({ limit: 8 }),
        ]);
        setFeatured(featuredRes.data.events);
        setTrending(trendingRes.data.events);
        setAll(allRes.data.events);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <PageTransition>
      {/* Hero */}
      <HeroBanner events={featured} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
        {/* Categories */}
        <section className="mb-14">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Browse by Category</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {categories.map(cat => (
              <Link
                key={cat.name}
                to={`/events?category=${cat.name}`}
                className={`group bg-gradient-to-br ${cat.color} border ${cat.border} rounded-xl p-4 text-center hover:scale-105 transition-all duration-200 hover:shadow-lg`}
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">{cat.icon}</div>
                <p className={`text-xs sm:text-sm font-semibold ${cat.text}`}>{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Events */}
        <Section
          title="Featured Events"
          icon={<FiStar className="w-6 h-6 text-yellow-400" />}
          viewAllLink="/events?featured=true"
          loading={loading}
        >
          {featured.slice(0, 4).map(event => <EventCard key={event._id} event={event} />)}
        </Section>

        {/* Trending */}
        <Section
          title="Trending Now"
          icon={<FiTrendingUp className="w-6 h-6 text-primary" />}
          viewAllLink="/events?trending=true"
          loading={loading}
        >
          {trending.slice(0, 4).map(event => <EventCard key={event._id} event={event} />)}
        </Section>

        {/* All Events */}
        <Section
          title="All Events"
          icon={<FiZap className="w-6 h-6 text-orange-400" />}
          viewAllLink="/events"
          loading={loading}
        >
          {all.slice(0, 8).map(event => <EventCard key={event._id} event={event} />)}
        </Section>

        {/* CTA Banner */}
        <div className="mb-14 rounded-2xl overflow-hidden relative bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/30 p-8 sm:p-12">
          <div className="relative z-10">
            <p className="text-primary font-semibold mb-2">Never Miss an Event</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Your Next Great Experience<br />is One Click Away</h2>
            <p className="text-gray-400 max-w-md mb-8">Join millions of users who discover and book amazing live events on EncoreHub every day.</p>
            <Link to="/events" className="btn-primary inline-block text-base py-3 px-8 shadow-lg shadow-primary/30">
              Explore All Events
            </Link>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden opacity-10">
            <div className="text-[20rem] font-black text-primary/30 select-none -mt-10 leading-none">E</div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Home;
