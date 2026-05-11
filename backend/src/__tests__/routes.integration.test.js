const request = require('supertest');

// Mock de mongoose ANTES de cargar app
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(undefined),
  connection: {
    db: {
      collection: jest.fn()
    }
  },
  Schema: function Schema() {
    return {};
  },
  model: jest.fn(() => ({}))
}));

describe('HTTP Routes - Integration', () => {
  let app;

  beforeAll(() => {
    // eslint-disable-next-line global-require
    app = require('../app');
  });

  describe('Auth Routes', () => {
    test('POST /api/auth/login sin rol devuelve 400', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    test('POST /api/auth/login con rol inválido devuelve 400', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ role: 'superuser', username: 'admin', password: 'admin123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Rol invalido');
    });

    test('POST /api/auth/refresh sin token devuelve 400', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Refresh token requerido');
    });

    test('POST /api/auth/logout devuelve 204', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({});

      expect(response.status).toBe(204);
    });
  });

  describe('Recipe Routes - Auth Protection', () => {
    test('GET /api/recipes sin token devuelve 401', async () => {
      const response = await request(app).get('/api/recipes');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Token JWT requerido');
    });

    test('GET /api/recipes con token inválido devuelve 401', async () => {
      const response = await request(app)
        .get('/api/recipes')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('invalido');
    });

    test('POST /api/recipes sin token devuelve 401', async () => {
      const response = await request(app)
        .post('/api/recipes')
        .send({ title: 'Test', ingredients: [], steps: [] });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Token JWT requerido');
    });
  });
});

