import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiImage, FiMapPin, FiCalendar, FiDollarSign, FiUsers } from 'react-icons/fi';
import { createEvent, updateEvent, getEventById } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Movies', 'Concerts', 'Sports', 'Comedy', 'Festivals', 'Theatre', 'Other'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa'];

const defaultForm = {
  title: '', description: '', category: 'Concerts', city: 'Mumbai',
  'venue.name': '', 'venue.address': '', 'venue.mapLink': '',
  date: '', time: '7:00 PM', image: '',
  language: 'English', duration: '', ageRating: 'U/A',
  'price.standard': '', 'price.premium': '', 'price.vip': '',
  totalSeats: 100, isFeatured: false, isTrending: false,
  artists: '', tags: '',
};

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getEventById(id).then(({ data }) => {
      const e = data.event;
      setForm({
        title: e.title || '', description: e.description || '',
        category: e.category || 'Concerts', city: e.city || '',
        'venue.name': e.venue?.name || '', 'venue.address': e.venue?.address || '',
        'venue.mapLink': e.venue?.mapLink || '',
        date: e.date ? new Date(e.date).toISOString().split('T')[0] : '',
        time: e.time || '', image: e.image || '',
        language: e.language || 'English', duration: e.duration || '',
        ageRating: e.ageRating || 'U/A',
        'price.standard': e.price?.standard || '',
        'price.premium': e.price?.premium || '',
        'price.vip': e.price?.vip || '',
        totalSeats: e.totalSeats || 100,
        isFeatured: e.isFeatured || false, isTrending: e.isTrending || false,
        artists: (e.artists || []).join(', '), tags: (e.tags || []).join(', '),
      });
    }).catch(() => toast.error('Failed to load event')).finally(() => setFetching(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form['price.standard'] || !form.date || !form['venue.name']) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title, description: form.description,
        category: form.category, city: form.city,
        venue: { name: form['venue.name'], address: form['venue.address'], mapLink: form['venue.mapLink'] },
        date: form.date, time: form.time, image: form.image,
        language: form.language, duration: form.duration, ageRating: form.ageRating,
        price: {
          standard: Number(form['price.standard']),
          premium: Number(form['price.premium']) || 0,
          vip: Number(form['price.vip']) || 0,
        },
        totalSeats: Number(form.totalSeats),
        isFeatured: form.isFeatured, isTrending: form.isTrending,
        artists: form.artists ? form.artists.split(',').map(a => a.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (isEdit) {
        await updateEvent(id, payload);
        toast.success('Event updated!');
      } else {
        await createEvent(payload);
        toast.success('Event created!');
      }
      navigate('/admin/events');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const Field = ({ label, name, type = 'text', required, placeholder, children, icon: Icon }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}{required && <span className="text-primary ml-1">*</span>}
      </label>
      {children || (
        <div className="relative">
          {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />}
          <input type={type} name={name} value={form[name]} onChange={handleChange}
            placeholder={placeholder} required={required}
            className={`input ${Icon ? 'pl-10' : ''}`} />
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/events')} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">{isEdit ? 'Edit Event' : 'Add New Event'}</h1>
          <p className="text-gray-400 text-sm">{isEdit ? 'Update event details' : 'Create a new event for users to book'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-white border-b border-dark-border pb-3">Basic Information</h2>
          <Field label="Event Title" name="title" required placeholder="e.g. Arijit Singh Live Concert 2025" />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description <span className="text-primary">*</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4}
              placeholder="Describe the event in detail..." className="input resize-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category <span className="text-primary">*</span></label>
              <select name="category" value={form.category} onChange={handleChange} className="input">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">City <span className="text-primary">*</span></label>
              <select name="city" value={form.city} onChange={handleChange} className="input">
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Language" name="language" placeholder="English" />
            <Field label="Duration" name="duration" placeholder="2 hours" />
            <Field label="Age Rating" name="ageRating" placeholder="U/A" />
          </div>
          <Field label="Artists / Performers" name="artists" placeholder="Comma-separated: Arijit Singh, Shreya Ghoshal" />
          <Field label="Tags" name="tags" placeholder="Comma-separated: bollywood, live, music" />
        </div>

        {/* Date, Time & Image */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-white border-b border-dark-border pb-3">Date, Time & Media</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date" name="date" type="date" required icon={FiCalendar} />
            <Field label="Time" name="time" placeholder="7:00 PM" required />
          </div>
          <Field label="Event Image URL" name="image" type="url" placeholder="https://images.unsplash.com/..." icon={FiImage} />
          {form.image && (
            <div className="rounded-xl overflow-hidden h-36">
              <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
            </div>
          )}
        </div>

        {/* Venue */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-white border-b border-dark-border pb-3">Venue Details</h2>
          <Field label="Venue Name" name="venue.name" required placeholder="MMRDA Grounds BKC" icon={FiMapPin} />
          <Field label="Full Address" name="venue.address" required placeholder="Bandra Kurla Complex, Mumbai - 400051" />
          <Field label="Google Maps Link" name="venue.mapLink" type="url" placeholder="https://maps.google.com/..." />
        </div>

        {/* Pricing */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-white border-b border-dark-border pb-3">Pricing & Seats</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Standard Price (₹) <span className="text-primary">*</span></label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="number" name="price.standard" value={form['price.standard']} onChange={handleChange}
                  placeholder="999" required min="0" className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Premium Price (₹)</label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="number" name="price.premium" value={form['price.premium']} onChange={handleChange}
                  placeholder="1999" min="0" className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">VIP Price (₹)</label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="number" name="price.vip" value={form['price.vip']} onChange={handleChange}
                  placeholder="3999" min="0" className="input pl-10" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Total Seats <span className="text-primary">*</span></label>
            <div className="relative">
              <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="number" name="totalSeats" value={form.totalSeats} onChange={handleChange}
                min="1" max="500" required className="input pl-10" />
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="card p-6 space-y-3">
          <h2 className="font-bold text-white border-b border-dark-border pb-3">Visibility Settings</h2>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4 accent-primary" />
            <span className="text-gray-300 group-hover:text-white transition-colors">Feature this event on homepage</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" name="isTrending" checked={form.isTrending} onChange={handleChange} className="w-4 h-4 accent-primary" />
            <span className="text-gray-300 group-hover:text-white transition-colors">Mark as Trending</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/admin/events')}
            className="flex-1 btn-secondary py-3.5">Cancel</button>
          <button type="submit" disabled={loading}
            className="flex-1 btn-primary py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
            {loading
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><FiSave className="w-4 h-4" /> {isEdit ? 'Update Event' : 'Create Event'}</>
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
