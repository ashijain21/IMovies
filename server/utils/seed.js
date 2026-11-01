import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Theatre from '../models/Theatre.js';
import Screen from '../models/Screen.js';
import Show from '../models/Show.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { connectDB, closeDB } from '../config/db.js';

export const seedDatabase = async () => {
  console.log('[Seed] Starting database seeding...');

  // 1. Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Movie.deleteMany({}),
    Theatre.deleteMany({}),
    Screen.deleteMany({}),
    Show.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('[Seed] Existing collections cleared.');

  // 2. Create Development Demo Users (Strictly for local testing / development evaluation)
  const adminUser = await User.create({
    name: 'IMovies Admin (Dev Demo)',
    email: 'admin@imovies.com',
    password: 'Admin@12345',
    phone: '+91 98765 43210',
    role: 'admin',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  });

  const demoUser = await User.create({
    name: 'Alex Mercer (Dev Demo)',
    email: 'user@imovies.com',
    password: 'User@12345',
    phone: '+91 91234 56789',
    role: 'user',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
  });

  console.log('[Seed] Users created: admin@imovies.com and user@imovies.com');

  // 3. Create 10+ Blockbuster Movies
  const sampleMovies = [
    {
      title: 'Dune: Part Two',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
      poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600',
      backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600',
      trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
      genre: ['Sci-Fi', 'Adventure', 'Action'],
      language: 'English',
      duration: 166,
      releaseDate: new Date('2024-03-01'),
      cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
      director: 'Denis Villeneuve',
      rating: 8.8,
      votesCount: 42000,
      certification: 'UA',
      status: 'now_showing',
      featured: true,
    },
    {
      title: 'Oppenheimer',
      description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral complexity and historical fallout of scientific discovery.',
      poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600',
      backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600',
      trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
      genre: ['Biography', 'Drama', 'History'],
      language: 'English',
      duration: 180,
      releaseDate: new Date('2023-07-21'),
      cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
      director: 'Christopher Nolan',
      rating: 8.9,
      votesCount: 56000,
      certification: 'A',
      status: 'now_showing',
      featured: true,
    },
    {
      title: 'Interstellar',
      description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.',
      poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600',
      backdrop: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600',
      trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
      genre: ['Sci-Fi', 'Drama', 'Adventure'],
      language: 'English',
      duration: 169,
      releaseDate: new Date('2014-11-07'),
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
      director: 'Christopher Nolan',
      rating: 8.7,
      votesCount: 89000,
      certification: 'UA',
      status: 'now_showing',
      featured: false,
    },
    {
      title: 'Spider-Man: Across the Spider-Verse',
      description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
      poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600',
      backdrop: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1600',
      trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
      genre: ['Animation', 'Action', 'Adventure'],
      language: 'English',
      duration: 140,
      releaseDate: new Date('2023-06-02'),
      cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
      director: 'Joaquim Dos Santos, Kemp Powers',
      rating: 8.7,
      votesCount: 38000,
      certification: 'U',
      status: 'now_showing',
      featured: true,
    },
    {
      title: 'Inception',
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
      poster: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=600',
      backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600',
      trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
      genre: ['Action', 'Sci-Fi', 'Thriller'],
      language: 'English',
      duration: 148,
      releaseDate: new Date('2010-07-16'),
      cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
      director: 'Christopher Nolan',
      rating: 8.8,
      votesCount: 95000,
      certification: 'UA',
      status: 'now_showing',
      featured: false,
    },
    {
      title: 'The Dark Knight',
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600',
      trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
      genre: ['Action', 'Crime', 'Drama'],
      language: 'English',
      duration: 152,
      releaseDate: new Date('2008-07-18'),
      cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
      director: 'Christopher Nolan',
      rating: 9.0,
      votesCount: 110000,
      certification: 'UA',
      status: 'now_showing',
      featured: false,
    },
    {
      title: 'Gladiator II',
      description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
      poster: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600',
      backdrop: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1600',
      trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
      genre: ['Action', 'Drama', 'Adventure'],
      language: 'English',
      duration: 148,
      releaseDate: new Date('2024-11-22'),
      cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
      director: 'Ridley Scott',
      rating: 8.4,
      votesCount: 19000,
      certification: 'A',
      status: 'now_showing',
      featured: true,
    },
    {
      title: 'Avatar: The Way of Water',
      description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
      backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600',
      trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
      genre: ['Sci-Fi', 'Action', 'Adventure'],
      language: 'English',
      duration: 192,
      releaseDate: new Date('2022-12-16'),
      cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang'],
      director: 'James Cameron',
      rating: 7.6,
      votesCount: 45000,
      certification: 'UA',
      status: 'now_showing',
      featured: false,
    },
    {
      title: 'Avengers: Secret Wars',
      description: 'Earth’s mightiest heroes and allies from across the multiverse collide in an epic battle of survival as reality itself threatens to collapse under an unprecedented cosmic threat.',
      poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600',
      backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600',
      trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
      genre: ['Action', 'Sci-Fi', 'Fantasy'],
      language: 'English',
      duration: 175,
      releaseDate: new Date('2027-05-07'),
      cast: ['Robert Downey Jr.', 'Benedict Cumberbatch', 'Tom Holland', 'Chris Hemsworth'],
      director: 'Anthony Russo, Joe Russo',
      rating: 9.2,
      votesCount: 15000,
      certification: 'UA',
      status: 'upcoming',
      featured: false,
    },
    {
      title: 'The Batman: Part II',
      description: 'Bruce Wayne delves deeper into the corruption of Gotham City while navigating complex alliances and unmasking new adversaries threatening to push the city into ultimate anarchy.',
      poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
      backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600',
      trailerUrl: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
      genre: ['Action', 'Crime', 'Drama'],
      language: 'English',
      duration: 165,
      releaseDate: new Date('2026-10-02'),
      cast: ['Robert Pattinson', 'Andy Serkis', 'Jeffrey Wright', 'Colin Farrell'],
      director: 'Matt Reeves',
      rating: 8.6,
      votesCount: 12000,
      certification: 'A',
      status: 'upcoming',
      featured: false,
    },
    {
      title: 'Kalki 2898 AD',
      description: 'A modern avatar of Vishnu, a Hindu god, is believed to have descended to the earth to protect the world from evil forces in a post-apocalyptic future setting.',
      poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600',
      trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
      genre: ['Action', 'Sci-Fi', 'Mythology'],
      language: 'Hindi',
      duration: 181,
      releaseDate: new Date('2024-06-27'),
      cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone'],
      director: 'Nag Ashwin',
      rating: 8.1,
      votesCount: 31000,
      certification: 'UA',
      status: 'now_showing',
      featured: false,
    },
  ];

  const createdMovies = await Movie.insertMany(sampleMovies);
  console.log(`[Seed] ${createdMovies.length} movies inserted.`);

  // 4. Create 5 Theatres across major cities
  const sampleTheatres = [
    {
      name: 'PVR INOX: Phoenix Palladium',
      location: 'Lower Parel',
      address: '462, Senapati Bapat Marg, Lower Parel',
      city: 'Mumbai',
      facilities: ['IMAX with Laser', 'Dolby Atmos', 'Recliner Seats', 'Gourmet F&B', 'Valet Parking'],
      image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800',
      status: 'active',
    },
    {
      name: 'Cinepolis: Select CITYWALK',
      location: 'Saket',
      address: 'A-3, District Centre, Saket',
      city: 'Delhi',
      facilities: ['4DX', 'Dolby 7.1', 'VIP Lounge', 'Wheelchair Friendly', 'Parking'],
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
      status: 'active',
    },
    {
      name: 'PVR Director\'s Cut: Forum Mall',
      location: 'Koramangala',
      address: 'Hosur Road, Koramangala',
      city: 'Bengaluru',
      facilities: ['Luxury Recliner', 'In-Seat Dining', 'Dolby Atmos', 'Cafe & Bar'],
      image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800',
      status: 'active',
    },
    {
      name: 'INOX: South City Mall',
      location: 'Prince Anwar Shah Road',
      address: '375, Prince Anwar Shah Rd, South City Complex',
      city: 'Kolkata',
      facilities: ['IMAX', 'Dolby Atmos', 'F&B Counters', 'Parking'],
      image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=800',
      status: 'active',
    },
    {
      name: 'Prasads Multiplex: Necklace Road',
      location: 'Khairatabad',
      address: 'NTR Gardens, Necklace Road, Khairatabad',
      city: 'Hyderabad',
      facilities: ['Large Format Screen', 'Dolby Atmos', 'Food Court', 'Gaming Arena'],
      image: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800',
      status: 'active',
    },
  ];

  const createdTheatres = await Theatre.insertMany(sampleTheatres);
  console.log(`[Seed] ${createdTheatres.length} theatres inserted.`);

  // 5. Create Screens for each theatre
  const screens = [];
  for (const theatre of createdTheatres) {
    screens.push(
      {
        theatreId: theatre._id,
        screenName: 'Screen 1 - IMAX Laser',
        screenType: 'IMAX 3D',
        totalSeats: 76,
        seatCategories: [
          { name: 'VIP Recliner', priceMultiplier: 1.6, rows: ['A', 'B'], seatsPerRow: 10 },
          { name: 'Gold', priceMultiplier: 1.25, rows: ['C', 'D', 'E'], seatsPerRow: 12 },
          { name: 'Silver', priceMultiplier: 1.0, rows: ['F', 'G'], seatsPerRow: 10 },
        ],
      },
      {
        theatreId: theatre._id,
        screenName: 'Screen 2 - Dolby Atmos',
        screenType: 'Dolby Cinema',
        totalSeats: 64,
        seatCategories: [
          { name: 'VIP Recliner', priceMultiplier: 1.5, rows: ['A'], seatsPerRow: 8 },
          { name: 'Gold', priceMultiplier: 1.2, rows: ['B', 'C', 'D'], seatsPerRow: 12 },
          { name: 'Silver', priceMultiplier: 1.0, rows: ['E', 'F'], seatsPerRow: 10 },
        ],
      }
    );
  }

  const createdScreens = await Screen.insertMany(screens);
  console.log(`[Seed] ${createdScreens.length} screens inserted.`);

  // 6. Create Show Schedules for Today, Tomorrow, and Next 2 Days
  const showTimes = [
    { start: '10:00 AM', end: '01:00 PM' },
    { start: '01:45 PM', end: '04:45 PM' },
    { start: '05:30 PM', end: '08:30 PM' },
    { start: '09:15 PM', end: '12:15 AM' },
  ];

  const today = new Date();
  const dates = [];
  for (let i = 0; i < 4; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const nowShowingMovies = createdMovies.filter((m) => m.status === 'now_showing');
  const showsToInsert = [];

  for (let dIndex = 0; dIndex < dates.length; dIndex++) {
    const showDate = dates[dIndex];
    for (const theatre of createdTheatres) {
      const theatreScreens = createdScreens.filter((s) => s.theatreId.equals(theatre._id));

      for (let sIndex = 0; sIndex < theatreScreens.length; sIndex++) {
        const screen = theatreScreens[sIndex];
        const movieForScreen = nowShowingMovies[(dIndex + sIndex) % nowShowingMovies.length];

        for (const slot of showTimes) {
          const basePrice = screen.screenType === 'IMAX 3D' ? 350 : 250;
          showsToInsert.push({
            movieId: movieForScreen._id,
            theatreId: theatre._id,
            screenId: screen._id,
            showDate,
            startTime: slot.start,
            endTime: slot.end,
            basePrice,
            pricing: {
              vip: Math.round(basePrice * 1.6),
              gold: Math.round(basePrice * 1.25),
              silver: basePrice,
            },
            bookedSeats: dIndex === 0 ? ['C5', 'C6', 'D7', 'D8'] : [], // Pre-book a few for demo realism
            availableSeats: dIndex === 0 ? screen.totalSeats - 4 : screen.totalSeats,
            status: 'scheduled',
          });
        }
      }
    }
  }

  const createdShows = await Show.insertMany(showsToInsert);
  console.log(`[Seed] ${createdShows.length} show schedules inserted.`);

  // 7. Create Sample Bookings for demo user
  const sampleShow = createdShows[0];
  const sampleBooking = await Booking.create({
    bookingId: 'IMV-20261101-DEMO1',
    userId: demoUser._id,
    showId: sampleShow._id,
    movieId: sampleShow.movieId,
    theatreId: sampleShow.theatreId,
    selectedSeats: [
      { seatNumber: 'C5', category: 'Gold', price: 320 },
      { seatNumber: 'C6', category: 'Gold', price: 320 },
    ],
    subtotal: 640,
    convenienceFee: 50,
    taxes: 124,
    discount: 50,
    totalAmount: 764,
    bookingStatus: 'confirmed',
    paymentStatus: 'paid',
    qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  });

  const samplePayment = await Payment.create({
    bookingId: sampleBooking._id,
    userId: demoUser._id,
    transactionId: 'TXN-IMV-DEMO-9999',
    amount: 764,
    paymentMethod: 'card',
    paymentStatus: 'captured',
    paymentGateway: 'mock',
  });

  sampleBooking.paymentId = samplePayment._id;
  await sampleBooking.save();

  // Create welcome notification
  await Notification.create({
    userId: demoUser._id,
    title: 'Welcome to IMovies! 🎬',
    message: 'Explore trending blockbusters, select your favorite luxury seats, and enjoy a seamless cinema experience.',
    type: 'system',
  });

  console.log('[Seed] Sample booking & notifications created.');
  console.log('[Seed] Database seeding completed successfully! 🎉');
};

// Allow direct CLI execution: node utils/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await closeDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed Error]:', err);
      process.exit(1);
    }
  })();
}
