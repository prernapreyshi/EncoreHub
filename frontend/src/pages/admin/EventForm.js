import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiImage, FiMapPin, FiCalendar, FiDollarSign, FiUsers, FiUpload, FiX } from 'react-icons/fi';
import { createEvent, updateEvent, getEventById, uploadImage } from '../../services/api';
import toast from 'react-hot-toast';
import PageTransition from '../../components/common/PageTransition';

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
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' | 'file'
  const fileInputRef = useRef(null);

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

    <PageTransition>

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

          {/* Image — tabbed URL / file upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Event Image</label>
              <div className="flex rounded-lg overflow-hidden border border-dark-border text-xs">
                {['url', 'file'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setUploadMode(mode)}
                    className={`px-3 py-1.5 font-medium transition-all capitalize ${uploadMode === mode ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    {mode === 'url' ? '🔗 URL' : '📁 Upload'}
                  </button>
                ))}
              </div>
            </div>

            {uploadMode === 'url' ? (
              <div className="relative">
                <FiImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="url"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="input pl-10"
                />
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error('Image must be under 5 MB');
                      return;
                    }
                    setUploading(true);
                    try {
                      const fd = new FormData();
                      fd.append('image', file);
                      const { data } = await uploadImage(fd);
                      setForm(prev => ({ ...prev, image: data.url }));
                      if (data.demo) toast('Demo mode: using placeholder image. Configure Cloudinary for real uploads.', { icon: 'ℹ️' });
                      else toast.success('Image uploaded successfully');
                    } catch (err) {
                      toast.error(err?.response?.data?.message || 'Upload failed');
                    } finally {
                      setUploading(false);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full border-2 border-dashed border-dark-border hover:border-primary/50 rounded-xl p-6 text-center transition-all group disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-gray-400">Uploading…</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <FiUpload className="w-6 h-6 text-gray-500 group-hover:text-primary transition-colors" />
                      <p className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-600">PNG, JPG, WEBP up to 5 MB</p>
                    </div>
                  )}
                </button>
              </div>
            )}

            {/* Live preview shown regardless of mode */}
            {form.image && (
              <div className="relative mt-3 rounded-xl overflow-hidden h-44 group">
                <img
                  src={form.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500/80 transition-all opacity-0 group-hover:opacity-100"
                >
                  <FiX className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/60 text-xs text-gray-300">
                  Preview
                </div>
              </div>
            )}
          </div>
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
  
    </PageTransition>
  );
};

export default EventForm;
