import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMail, FiPhone } from 'react-icons/fi';

const Footer = () => {
  const categories = ['Movies', 'Concerts', 'Sports', 'Comedy', 'Festivals', 'Theatre'];
  const links = [
    { title: 'Company', items: [{ label: 'About Us', to: '#' }, { label: 'Careers', to: '#' }, { label: 'Press', to: '#' }, { label: 'Blog', to: '#' }] },
    { title: 'Help', items: [{ label: 'FAQ', to: '#' }, { label: 'Support', to: '#' }, { label: 'Cancellation Policy', to: '#' }, { label: 'Terms of Service', to: '#' }] },
  ];

  return (
    <footer className="bg-dark-card border-t border-dark-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-white text-sm">E</div>
              <span className="text-xl font-black text-white tracking-tight">Encore<span className="text-primary">Hub</span></span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Your ultimate destination for discovering and booking live events — concerts, sports, theatre, and more.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: FiInstagram, label: 'Instagram' },
                { Icon: FiTwitter,   label: 'Twitter / X' },
                { Icon: FiFacebook,  label: 'Facebook' },
                { Icon: FiYoutube,   label: 'YouTube' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href={`https://www.${label.split(' ')[0].toLowerCase()}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`EncoreHub on ${label}`}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary flex items-center justify-center text-gray-400 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4">Categories</h4>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat}>
                  <Link to={`/events?category=${cat}`} className="text-gray-400 hover:text-primary text-sm transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          {links.map(section => (
            <div key={section.title}>
              <h4 className="font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.items.map(item => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-gray-400 hover:text-primary text-sm transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="border-t border-dark-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1.5"><FiMail className="w-4 h-4 text-primary" /> support@encorehub.com</span>
            <span className="flex items-center gap-1.5"><FiPhone className="w-4 h-4 text-primary" /> 1800-123-4567</span>
          </div>
        <p className="text-gray-500 text-sm">
  Your gateway to live entertainment.
</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
