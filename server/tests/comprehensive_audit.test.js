import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { connectDB, closeDB } from '../config/db.js';
import { seedDatabase } from '../utils/seed.js';

describe('IMOVIES COMPREHENSIVE FUNCTIONALITY & CONCURRENCY AUDIT', () => {
  let customerToken = '';
  let customer2Token = '';
  let adminToken = '';
  let customerUser = null;
  let testMovieId = '';
  let testTheatreId = '';
  let testScreenId = '';
  let testShowId = '';
  let createdBookingId = '';
  let testNotificationId = '';

  before(async () => {
    process.env.USE_MEMORY_DB = 'true';
    await connectDB();
    await seedDatabase();
  });

  after(async () => {
    await closeDB();
  });

  // ==========================================
  // 1. ENVIRONMENT & HEALTH AUDIT
  // ==========================================
  test('Audit 1.1: Health check endpoint returns 200 OK and valid status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.ok(res.body.version);
  });

  test('Audit 1.2: Static Frontend SPA serving loads index.html on root and subroutes', async () => {
    const resRoot = await request(app).get('/');
    assert.equal(resRoot.status, 200);
    assert.ok(resRoot.text.includes('IMovies'));

    const resRoute = await request(app).get('/movies');
    assert.equal(resRoute.status, 200);
    assert.ok(resRoute.text.includes('IMovies'));
  });

  // ==========================================
  // 2. AUTHENTICATION & SECURITY AUDIT
  // ==========================================
  test('Audit 2.1: Register new customer account', async () => {
    const testEmail = `newcustomer_${Date.now()}@example.com`;
    const res = await request(app).post('/api/auth/register').send({
      name: 'Sarah Connor',
      email: testEmail,
      password: 'Password@123',
      phone: '+91 99887 76655',
    });
    assert.equal(res.status, 201);
    assert.ok(res.body.token);
    assert.equal(res.body.user.name, 'Sarah Connor');
  });

  test('Audit 2.2: Reject duplicate email registration with validation error', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicate User',
      email: 'user@imovies.com',
      password: 'Password@123',
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  test('Audit 2.3: Reject invalid credentials on login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'user@imovies.com',
      password: 'WrongPassword!',
    });
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('Audit 2.4: Authenticate Customer 1 and Customer 2', async () => {
    const res1 = await request(app).post('/api/auth/login').send({
      email: 'user@imovies.com',
      password: 'User@12345',
    });
    assert.equal(res1.status, 200);
    customerToken = res1.body.token;
    customerUser = res1.body.user;

    // Register second customer for concurrency tests
    const res2 = await request(app).post('/api/auth/register').send({
      name: 'Concurrent Buyer',
      email: 'buyer2@example.com',
      password: 'Buyer2@12345',
    });
    assert.equal(res2.status, 201);
    customer2Token = res2.body.token;
  });

  test('Audit 2.5: Authenticate Administrator and verify admin privileges', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@imovies.com',
      password: 'Admin@12345',
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'admin');
    adminToken = res.body.token;
  });

  test('Audit 2.6: Access GET /api/auth/me with bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, 'user@imovies.com');
  });

  test('Audit 2.7: Update Customer profile', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        name: 'Alex Mercer (Updated)',
        phone: '+91 99999 88888',
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.name, 'Alex Mercer (Updated)');
    assert.equal(res.body.user.phone, '+91 99999 88888');
  });

  test('Audit 2.8: Password recovery token generation & reset', async () => {
    const forgotRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'user@imovies.com' });
    assert.equal(forgotRes.status, 200);
    assert.ok(forgotRes.body.resetToken);

    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: forgotRes.body.resetToken,
        password: 'User@12345', // Reset back to standard password
      });
    assert.equal(resetRes.status, 200);
    assert.ok(resetRes.body.token);
  });

  // ==========================================
  // 3. CATALOG & DISCOVERY AUDIT
  // ==========================================
  test('Audit 3.1: GET /api/movies with genre, language, and search filter', async () => {
    const res = await request(app).get('/api/movies?genre=Sci-Fi&language=English');
    assert.equal(res.status, 200);
    assert.ok(res.body.movies.length > 0);
    testMovieId = res.body.movies[0]._id;
  });

  test('Audit 3.2: GET /api/movies/featured returns hero carousels', async () => {
    const res = await request(app).get('/api/movies/featured');
    assert.equal(res.status, 200);
    assert.ok(res.body.featured.length > 0);
    assert.ok(res.body.nowShowing.length > 0);
    assert.ok(res.body.upcoming.length > 0);
  });

  test('Audit 3.3: GET /api/movies/:id returns detailed movie information', async () => {
    const res = await request(app).get(`/api/movies/${testMovieId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.movie._id, testMovieId);
    assert.ok(res.body.movie.duration);
    assert.ok(res.body.movie.cast);
  });

  test('Audit 3.4: GET /api/theatres and cities filter', async () => {
    const resTheatres = await request(app).get('/api/theatres?city=Mumbai');
    assert.equal(resTheatres.status, 200);
    assert.ok(resTheatres.body.theatres.length > 0);
    testTheatreId = resTheatres.body.theatres[0]._id;

    const resCities = await request(app).get('/api/theatres/cities');
    assert.equal(resCities.status, 200);
    assert.ok(resCities.body.cities.includes('Mumbai'));
  });

  test('Audit 3.5: GET /api/shows returns active schedules', async () => {
    const res = await request(app).get('/api/shows');
    assert.equal(res.status, 200);
    assert.ok(res.body.shows.length > 0);
    const firstShow = res.body.shows[0];
    testShowId = firstShow._id;
    testMovieId = firstShow.movieId._id;
    testTheatreId = firstShow.theatreId._id;
    testScreenId = firstShow.screenId._id;
  });

  test('Audit 3.6: GET /api/shows/:id/seats returns screen layout, booked seats, and pricing', async () => {
    const res = await request(app).get(`/api/shows/${testShowId}/seats`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.seatCategories));
    assert.ok(Array.isArray(res.body.bookedSeats));
    assert.ok(res.body.show.pricing);
  });

  // ==========================================
  // 4. FULL CUSTOMER BOOKING LIFECYCLE (11 STEPS)
  // ==========================================
  test('Audit 4.1 [Lifecycle Step 6]: Customer 1 locks seats [A3, A4]', async () => {
    const res = await request(app)
      .post('/api/bookings/lock-seats')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        showId: testShowId,
        seats: ['A3', 'A4'],
      });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.lockedSeats, ['A3', 'A4']);
    assert.ok(res.body.expiresAt);
  });

  test('Audit 4.2 [Lifecycle Step 7]: Calculate order summary with coupon discount IMOVIES50', async () => {
    const res = await request(app)
      .post('/api/bookings/calculate-order')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        showId: testShowId,
        selectedSeats: [
          { seatNumber: 'A3', category: 'VIP Recliner', price: 450 },
          { seatNumber: 'A4', category: 'VIP Recliner', price: 450 },
        ],
        couponCode: 'IMOVIES50',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.summary.subtotal, 900);
    assert.ok(res.body.summary.discount > 0);
    assert.ok(res.body.summary.totalAmount > 0);
  });

  test('Audit 4.3 [Lifecycle Step 8]: Create payment order and verify payment', async () => {
    const orderRes = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ amount: 950 });
    assert.equal(orderRes.status, 200);
    assert.ok(orderRes.body.order.id);

    const verifyRes = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId: orderRes.body.order.id,
        paymentId: 'pay_test_audit_999',
        isMock: true,
      });
    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.body.verified, true);
  });

  test('Audit 4.4 [Lifecycle Steps 8 & 9]: Confirm booking atomically and generate digital QR ticket', async () => {
    const res = await request(app)
      .post('/api/bookings/confirm')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        showId: testShowId,
        selectedSeats: [
          { seatNumber: 'A3', category: 'VIP Recliner', price: 450 },
          { seatNumber: 'A4', category: 'VIP Recliner', price: 450 },
        ],
        paymentMethod: 'card',
        gatewayOrderId: 'order_audit_111',
        gatewayPaymentId: 'pay_audit_222',
      });

    assert.equal(res.status, 201);
    assert.ok(res.body.booking.bookingId.startsWith('IMV-'));
    assert.ok(res.body.booking.qrCode.startsWith('data:image/png'));
    assert.equal(res.body.booking.bookingStatus, 'confirmed');
    assert.equal(res.body.booking.paymentStatus, 'paid');
    createdBookingId = res.body.booking._id;

    // Verify seats are now in show's bookedSeats in MongoDB
    const seatsRes = await request(app).get(`/api/shows/${testShowId}/seats`);
    assert.ok(seatsRes.body.bookedSeats.includes('A3'));
    assert.ok(seatsRes.body.bookedSeats.includes('A4'));
  });

  test('Audit 4.5 [Lifecycle Step 10]: View customer booking history', async () => {
    const res = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${customerToken}`);
    assert.equal(res.status, 200);
    const found = res.body.bookings.find((b) => b._id === createdBookingId);
    assert.ok(found);
  });

  test('Audit 4.6 [Lifecycle Step 11]: Cancel eligible booking with refund calculation', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${createdBookingId}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Trip rescheduled' });

    assert.equal(res.status, 200);
    assert.equal(res.body.booking.bookingStatus, 'cancelled');
    assert.equal(res.body.booking.paymentStatus, 'refunded');
    assert.ok(res.body.booking.cancellationDetails.refundAmount > 0);

    // Verify seats were released back to show available seats
    const seatsRes = await request(app).get(`/api/shows/${testShowId}/seats`);
    assert.ok(!seatsRes.body.bookedSeats.includes('A3'));
    assert.ok(!seatsRes.body.bookedSeats.includes('A4'));
  });

  // ==========================================
  // 5. CONCURRENCY & RACE CONDITION AUDIT
  // ==========================================
  test('Audit 5.1: Concurrency Conflict: Customer 1 locks seat [B1]', async () => {
    const res1 = await request(app)
      .post('/api/bookings/lock-seats')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        showId: testShowId,
        seats: ['B1'],
      });
    assert.equal(res1.status, 200);
    assert.deepEqual(res1.body.lockedSeats, ['B1']);
  });

  test('Audit 5.2: Concurrency Conflict: Customer 2 attempts to lock [B1] -> Rejected with 409 Conflict', async () => {
    const res2 = await request(app)
      .post('/api/bookings/lock-seats')
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({
        showId: testShowId,
        seats: ['B1'],
      });
    assert.equal(res2.status, 409);
    assert.equal(res2.body.success, false);
    assert.ok(res2.body.message.includes('currently held by another customer'));
  });

  test('Audit 5.3: Concurrency Conflict: Customer 1 confirms [B1], Customer 2 attempts to book [B1] -> Rejected with 400', async () => {
    // Customer 1 completes booking
    const confirmRes = await request(app)
      .post('/api/bookings/confirm')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        showId: testShowId,
        selectedSeats: [{ seatNumber: 'B1', category: 'VIP Recliner', price: 450 }],
        paymentMethod: 'card',
      });
    assert.equal(confirmRes.status, 201);

    // Customer 2 attempts to confirm same seat
    const conflictRes = await request(app)
      .post('/api/bookings/confirm')
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({
        showId: testShowId,
        selectedSeats: [{ seatNumber: 'B1', category: 'VIP Recliner', price: 450 }],
        paymentMethod: 'card',
      });
    assert.equal(conflictRes.status, 400);
    assert.ok(conflictRes.body.message.includes('already purchased'));
  });

  // ==========================================
  // 6. ADMIN AUTHORIZATION & MANAGEMENT AUDIT
  // ==========================================
  test('Audit 6.1: Non-admin customer forbidden from accessing admin endpoints -> 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);
    assert.equal(res.status, 403);
  });

  test('Audit 6.2: Admin accesses dashboard overview metrics', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.stats.totalMovies >= 10);
    assert.ok(res.body.stats.totalRevenue > 0);
  });

  test('Audit 6.3: Admin accesses detailed analytics charts data', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.dailyRevenue.length, 7);
    assert.ok(Array.isArray(res.body.popularMovies));
    assert.ok(Array.isArray(res.body.theatrePopularity));
  });

  test('Audit 6.4: Admin creates a new movie', async () => {
    const res = await request(app)
      .post('/api/movies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Mission: Impossible – The Final Reckoning',
        description: 'Ethan Hunt embarks on his most dangerous mission yet to track down a terrifying new weapon.',
        poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600',
        backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600',
        genre: ['Action', 'Thriller'],
        language: 'English',
        duration: 155,
        releaseDate: '2025-05-23',
        rating: 8.9,
        certification: 'UA',
        status: 'upcoming',
      });
    assert.equal(res.status, 201);
    assert.equal(res.body.movie.title, 'Mission: Impossible – The Final Reckoning');
  });

  test('Audit 6.5: Admin schedules a show with conflict check verification', async () => {
    // 1. Valid schedule
    const res = await request(app)
      .post('/api/shows')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        movieId: testMovieId,
        theatreId: testTheatreId,
        screenId: testScreenId,
        showDate: '2027-01-01',
        startTime: '11:15 AM',
        endTime: '02:15 PM',
        basePrice: 300,
      });
    assert.equal(res.status, 201);
    const scheduledShowId = res.body.show._id;

    // 2. Schedule conflict: attempt to schedule another show on same screen, same date, same startTime
    const conflictRes = await request(app)
      .post('/api/shows')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        movieId: testMovieId,
        theatreId: testTheatreId,
        screenId: testScreenId,
        showDate: '2027-01-01',
        startTime: '11:15 AM',
        endTime: '02:15 PM',
        basePrice: 300,
      });
    assert.equal(conflictRes.status, 400);
    assert.ok(conflictRes.body.message.includes('Conflict'));

    // Clean up
    await request(app)
      .delete(`/api/shows/${scheduledShowId}`)
      .set('Authorization', `Bearer ${adminToken}`);
  });

  test('Audit 6.6: Admin views all customer bookings ledger with status filter', async () => {
    const res = await request(app)
      .get('/api/admin/bookings?status=All')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.bookings.length > 0);
  });

  test('Audit 6.7: Admin views registered users and updates role', async () => {
    const usersRes = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(usersRes.status, 200);
    assert.ok(usersRes.body.users.length > 0);

    const targetUser = usersRes.body.users.find((u) => u.email === 'buyer2@example.com');
    if (targetUser) {
      const roleRes = await request(app)
        .patch(`/api/admin/users/${targetUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });
      assert.equal(roleRes.status, 200);
      assert.equal(roleRes.body.user.role, 'admin');
    }
  });

  // ==========================================
  // 7. NOTIFICATIONS AUDIT
  // ==========================================
  test('Audit 7.1: Customer views notifications and marks as read', async () => {
    const listRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${customerToken}`);
    assert.equal(listRes.status, 200);
    assert.ok(listRes.body.notifications.length > 0);
    testNotificationId = listRes.body.notifications[0]._id;

    const readRes = await request(app)
      .patch(`/api/notifications/${testNotificationId}/read`)
      .set('Authorization', `Bearer ${customerToken}`);
    assert.equal(readRes.status, 200);
    assert.equal(readRes.body.notification.isRead, true);

    const markAllRes = await request(app)
      .patch('/api/notifications/mark-all-read')
      .set('Authorization', `Bearer ${customerToken}`);
    assert.equal(markAllRes.status, 200);
  });
});
