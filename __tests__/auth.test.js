const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Mock data
const USERS_FILE = path.join(__dirname, '../users.json');
const mockUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

describe('Authentication Endpoints', () => {
  beforeAll(() => {
    // Ensure users file exists
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([]));
    }
  });

  afterEach(() => {
    // Clean up test data
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await request('http://localhost:3002')
        .post('/api/auth/register')
        .send(mockUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Registration successful');
    });

    test('should reject registration with invalid email', async () => {
      const response = await request('http://localhost:3002')
        .post('/api/auth/register')
        .send({
          ...mockUser,
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject registration with short password', async () => {
      const response = await request('http://localhost:3002')
        .post('/api/auth/register')
        .send({
          ...mockUser,
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject duplicate email registration', async () => {
      // First registration
      await request('http://localhost:3002')
        .post('/api/auth/register')
        .send(mockUser);

      // Duplicate registration
      const response = await request('http://localhost:3002')
        .post('/api/auth/register')
        .send(mockUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user before login tests
      await request('http://localhost:3002')
        .post('/api/auth/register')
        .send(mockUser);
    });

    test('should login with valid credentials', async () => {
      const response = await request('http://localhost:3002')
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: mockUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
    });

    test('should reject login with invalid email', async () => {
      const response = await request('http://localhost:3002')
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: mockUser.password
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should reject login with wrong password', async () => {
      const response = await request('http://localhost:3002')
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request('http://localhost:3002')
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('ok');
    });
  });
});
