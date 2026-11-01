import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { connectDB, closeDB } from '../config/db.js';
import { seedDatabase } from '../utils/seed.js';

describe('IMovies API End-to-End Test Suite', () => {
  let userToken = '';
  let adminToken = '';
  let sampleShowId = '';
  let createdBookingId = '';

  before(async () => {
    process.env.USE_MEMORY_DB = 'true';
    await connectDB();
    await seedDatabase();
  });

  after(async () => {
    await closeDB();
  });

  test('1. GET /api/health should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });

  test('2. POST /api/auth/login with valid user credentials should return token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'user@imovies.com',
      password: 'User@12345',
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, 'user@imovies.com');
    userToken = res.body.token;
  });

  test('3. POST /api/auth/login with admin credentials should return admin token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@imovies.com',
      password: 'Admin@12345',
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'admin');
    adminToken = res.body.token;
  });

  test('4. GET /api/movies should return list of movies with pagination', async () => {
    const res = await request(app).get('/api/movies?limit=5');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.movies));
    assert.ok(res.body.movies.length > 0);
  });

  test('5. GET /api/theatres should return active theatres and cities', async () => {
    const res = await request(app).get('/api/theatres');
    assert.equal(res.status, 200);
    assert.ok(res.body.theatres.length >= 5);
  });

  test('6. GET /api/shows should return scheduled shows and capture a showId', async () => {
    const res = await request(app).get('/api/shows');
    assert.equal(res.status, 200);
    assert.ok(res.body.shows.length > 0);
    sampleShowId = res.body.shows[0]._id;
  });

  test('7. GET /api/shows/:id/seats should return layout and seat status', async () => {
    const res = await request(app).get(`/api/shows/${sampleShowId}/seats`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.seatCategories));
    assert.ok(Array.isArray(res.body.bookedSeats));
  });

  test('8. POST /api/bookings/lock-seats should temporarily reserve seats', async () => {
    const res = await request(app)
      .post('/api/bookings/lock-seats')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        showId: sampleShowId,
        seats: ['A1', 'A2'],
      });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.lockedSeats, ['A1', 'A2']);
    assert.ok(res.body.expiresAt);
  });

  test('9. POST /api/bookings/confirm should complete booking and generate QR ticket', async () => {
    const res = await request(app)
      .post('/api/bookings/confirm')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        showId: sampleShowId,
        selectedSeats: [
          { seatNumber: 'A1', category: 'VIP Recliner', price: 450 },
          { seatNumber: 'A2', category: 'VIP Recliner', price: 450 },
        ],
        paymentMethod: 'card',
        gatewayOrderId: 'order_test_123',
        gatewayPaymentId: 'pay_test_456',
      });

    assert.equal(res.status, 201);
    assert.ok(res.body.booking.bookingId);
    assert.ok(res.body.booking.qrCode);
    assert.equal(res.body.booking.bookingStatus, 'confirmed');
    createdBookingId = res.body.booking._id;
  });

  test('10. GET /api/bookings/my-bookings should list the confirmed booking', async () => {
    const res = await request(app)
      .get('/api/bookings/my-bookings')
      .set('Authorization', `Bearer ${userToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.bookings.length > 0);
  });

  test('11. PATCH /api/bookings/:id/cancel should cancel the booking with refund calculation', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${createdBookingId}/cancel`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reason: 'Schedule conflict' });
    assert.equal(res.status, 200);
    assert.equal(res.body.booking.bookingStatus, 'cancelled');
    assert.ok(res.body.booking.cancellationDetails.refundAmount > 0);
  });

  test('12. GET /api/admin/dashboard should return metrics to authorized admin', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.stats.totalMovies >= 10);
    assert.ok(res.body.stats.totalTheatres >= 5);
  });

  test('13. GET /api/admin/analytics should return charts data', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.dailyRevenue));
  });
});

