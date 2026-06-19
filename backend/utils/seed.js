const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Event = require('./models/Event');
const User = require('./models/User');

const events = [
  {
    title: 'Arijit Singh Live Concert 2025',
    description: 'Experience the magical voice of Arijit Singh live in concert. An unforgettable evening of Bollywood\'s most beloved songs performed live with a full orchestra. From "Tum Hi Ho" to "Kesariya", this concert promises to be a night filled with emotion and music.',
    category: 'Concerts',
    city: 'Mumbai',
    venue: { name: 'MMRDA Grounds BKC', address: 'Bandra Kurla Complex, Mumbai - 400051', mapLink: '' },
    date: new Date('2025-03-15'),
    time: '7:00 PM',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    language: 'Hindi',
    duration: '3 hours',
    ageRating: 'U/A',
    price: { standard: 999, premium: 1999, vip: 3999 },
    totalSeats: 100,
    isFeatured: true,
    isTrending: true,
    tags: ['bollywood', 'live', 'concert'],
    artists: ['Arijit Singh'],
    rating: 4.8,
  },
  {
    title: 'KKR vs MI - IPL 2025',
    description: 'Watch the thrilling IPL clash between Kolkata Knight Riders and Mumbai Indians. Two champion teams battle it out at Eden Gardens in what promises to be an epic T20 encounter. Feel the electric atmosphere of live cricket!',
    category: 'Sports',
    city: 'Kolkata',
    venue: { name: 'Eden Gardens', address: 'B.B.D. Bag, Kolkata - 700001', mapLink: '' },
    date: new Date('2025-04-05'),
    time: '7:30 PM',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
    language: 'Hindi/English',
    duration: '4 hours',
    ageRating: 'U',
    price: { standard: 500, premium: 1500, vip: 5000 },
    totalSeats: 100,
    isFeatured: true,
    isTrending: true,
    tags: ['ipl', 'cricket', 'sports'],
    artists: [],
    rating: 4.9,
  },
  {
    title: 'Zakir Khan - Haq Se Single',
    description: 'India\'s most beloved comedian Zakir Khan returns with his hilarious new stand-up special "Haq Se Single". Expect relatable stories about relationships, life, and more in this unmissable comedy night.',
    category: 'Comedy',
    city: 'Delhi',
    venue: { name: 'Siri Fort Auditorium', address: 'August Kranti Marg, New Delhi - 110049', mapLink: '' },
    date: new Date('2025-02-20'),
    time: '8:00 PM',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800',
    language: 'Hindi',
    duration: '2 hours',
    ageRating: 'A',
    price: { standard: 799, premium: 1299, vip: 2499 },
    totalSeats: 80,
    isFeatured: true,
    isTrending: false,
    tags: ['comedy', 'standup', 'hindi'],
    artists: ['Zakir Khan'],
    rating: 4.7,
  },
  {
    title: 'Sunburn Festival 2025',
    description: 'Asia\'s biggest electronic dance music festival returns! Experience 3 days of non-stop music featuring international and Indian DJs. With spectacular stage setups, light shows, and an incredible atmosphere, Sunburn 2025 is the must-attend festival of the year.',
    category: 'Festivals',
    city: 'Pune',
    venue: { name: 'Vagad Ground, Pimpri', address: 'Pimpri-Chinchwad, Pune - 411017', mapLink: '' },
    date: new Date('2025-12-27'),
    time: '4:00 PM',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
    language: 'English',
    duration: '3 days',
    ageRating: 'A',
    price: { standard: 2999, premium: 5999, vip: 12999 },
    totalSeats: 100,
    isFeatured: true,
    isTrending: true,
    tags: ['edm', 'festival', 'music'],
    artists: ['Martin Garrix', 'Hardwell', 'KSHMR'],
    rating: 4.9,
  },
  {
    title: 'The Batman Returns - Special Screening',
    description: 'A special IMAX screening of the critically acclaimed Batman sequel. Experience Gotham City like never before on the massive IMAX screen with Dolby Atmos sound. The Dark Knight returns in this epic cinematic experience.',
    category: 'Movies',
    city: 'Bangalore',
    venue: { name: 'PVR IMAX Forum Mall', address: 'Koramangala, Bangalore - 560095', mapLink: '' },
    date: new Date('2025-03-22'),
    time: '9:00 PM',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
    language: 'English',
    duration: '3 hours 5 min',
    ageRating: 'UA',
    price: { standard: 350, premium: 550, vip: 850 },
    totalSeats: 80,
    isFeatured: false,
    isTrending: true,
    tags: ['movie', 'imax', 'batman'],
    artists: [],
    rating: 4.6,
  },
  {
    title: 'Hamlet - Royal Theatre Production',
    description: 'A stunning reimagining of Shakespeare\'s masterpiece. This critically acclaimed production brings the Prince of Denmark to life with modern staging, powerful performances, and breathtaking visuals that will leave you speechless.',
    category: 'Theatre',
    city: 'Mumbai',
    venue: { name: 'National Centre for Performing Arts', address: 'Nariman Point, Mumbai - 400021', mapLink: '' },
    date: new Date('2025-04-10'),
    time: '7:00 PM',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
    language: 'English',
    duration: '2 hours 45 min',
    ageRating: 'U/A',
    price: { standard: 600, premium: 1200, vip: 2500 },
    totalSeats: 60,
    isFeatured: false,
    isTrending: false,
    tags: ['theatre', 'shakespeare', 'drama'],
    artists: [],
    rating: 4.5,
  },
  {
    title: 'Diljit Dosanjh - Dil-Luminati Tour',
    description: 'Global superstar Diljit Dosanjh brings his record-breaking Dil-Luminati tour to India! Experience the energy and passion of one of the biggest Punjabi artists in the world as he performs his greatest hits live.',
    category: 'Concerts',
    city: 'Hyderabad',
    venue: { name: 'Gachibowli Indoor Stadium', address: 'Gachibowli, Hyderabad - 500032', mapLink: '' },
    date: new Date('2025-05-18'),
    time: '6:30 PM',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    language: 'Punjabi',
    duration: '2.5 hours',
    ageRating: 'U/A',
    price: { standard: 1499, premium: 2999, vip: 5999 },
    totalSeats: 100,
    isFeatured: true,
    isTrending: true,
    tags: ['punjabi', 'concert', 'diljit'],
    artists: ['Diljit Dosanjh'],
    rating: 4.9,
  },
  {
    title: 'Badminton World Championship 2025',
    description: 'Watch the world\'s best badminton players compete at the highest level. Featuring India\'s own PV Sindhu and Lakshya Sen, this championship promises edge-of-your-seat action and nail-biting rallies.',
    category: 'Sports',
    city: 'Chennai',
    venue: { name: 'Jawaharlal Nehru Indoor Stadium', address: 'Periamet, Chennai - 600003', mapLink: '' },
    date: new Date('2025-06-12'),
    time: '10:00 AM',
    image: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=800',
    language: 'English',
    duration: '6 hours',
    ageRating: 'U',
    price: { standard: 300, premium: 700, vip: 1500 },
    totalSeats: 80,
    isFeatured: false,
    isTrending: false,
    tags: ['badminton', 'sports', 'championship'],
    artists: [],
    rating: 4.4,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    await Event.deleteMany();
    await User.deleteMany();
    console.log('Cleared existing data');

    // Create admin
    await User.create({
      name: 'Admin User',
      email: 'admin@encorehub.com',
      password: 'admin123',
      role: 'admin',
    });
    // Create demo user
    await User.create({
      name: 'John Doe',
      email: 'user@encorehub.com',
      password: 'user123',
      role: 'user',
    });

    await Event.insertMany(events);
    console.log('✅ Seeded events and users');
    console.log('Admin: admin@encorehub.com / admin123');
    console.log('User: user@encorehub.com / user123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
