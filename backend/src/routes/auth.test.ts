import request from 'supertest';
import app from '../app';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe('Auth Endpoints', () => {
  const testEmail = 'auth-test@example.com';
  const testPassword = 'securePassword123';

  beforeEach(async () => {
    const userRepo = AppDataSource.getRepository(User);
    await userRepo.delete({ email: testEmail });
  });

  afterAll(async () => {
    const userRepo = AppDataSource.getRepository(User);
    await userRepo.delete({ email: testEmail });
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully (201)', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: testEmail, password: testPassword });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email', testEmail);
      expect(res.body).not.toHaveProperty('password');
    });

    it('should fail registration with invalid email format (400)', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'invalid-email', password: testPassword });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'ValidationError');
    });

    it('should fail registration with short password (400)', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: testEmail, password: 'short' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'ValidationError');
    });

    it('should fail registration if email is already taken (409)', async () => {
      await request(app)
        .post('/auth/register')
        .send({ email: testEmail, password: testPassword });

      const res = await request(app)
        .post('/auth/register')
        .send({ email: testEmail, password: testPassword });

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error', 'ConflictError');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/auth/register')
        .send({ email: testEmail, password: testPassword });
    });

    it('should log in successfully and set httpOnly cookie (200)', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: testEmail, password: testPassword });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', testEmail);

      const cookies = res.headers['set-cookie'] as string[] | undefined;
      expect(cookies).toBeDefined();
      const hasTokenCookie = cookies!.some((c) => c.startsWith('token='));
      expect(hasTokenCookie).toBe(true);
    });

    it('should fail to log in with incorrect password (401)', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: testEmail, password: 'wrong-password' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'UnauthorizedError');
    });
  });

  describe('GET /auth/me', () => {
    it('should fail to get user info if not authenticated (401)', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'UnauthorizedError');
    });

    it('should successfully return user info if authenticated (200)', async () => {
      await request(app)
        .post('/auth/register')
        .send({ email: testEmail, password: testPassword });

      const loginRes = await request(app)
        .post('/auth/login')
        .send({ email: testEmail, password: testPassword });

      const cookie = (loginRes.headers['set-cookie'] as string[] | undefined)?.[0];
      expect(cookie).toBeDefined();

      const meRes = await request(app)
        .get('/auth/me')
        .set('Cookie', [cookie!]);

      expect(meRes.status).toBe(200);
      expect(meRes.body).toHaveProperty('email', testEmail);
      expect(meRes.body).toHaveProperty('id');
    });
  });

  describe('POST /auth/logout', () => {
    it('should successfully clear auth cookie (200)', async () => {
      const res = await request(app).post('/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Successfully logged out');

      const cookies = res.headers['set-cookie'] as string[] | undefined;
      expect(cookies).toBeDefined();
      const isCleared = cookies!.some((c) => c.startsWith('token=;'));
      expect(isCleared).toBe(true);
    });
  });
});
