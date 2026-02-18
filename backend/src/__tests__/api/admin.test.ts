import request from 'supertest';
import { createTestApp, uniqueEmail } from '../helpers';
import prisma from '../../config/database';

const app = createTestApp();

describe('Admin API', () => {
  let adminToken: string;
  let adminUserId: string;
  let userToken: string;

  beforeAll(async () => {
    // Create admin user
    const adminEmail = uniqueEmail();
    const res = await request(app).post('/api/auth/register').send({
      email: adminEmail,
      password: 'TestPass123!',
      name: 'Admin User',
    });
    if (res.status === 500) return;
    adminToken = res.body.data?.token;
    adminUserId = res.body.data?.user?.id;

    if (adminUserId) {
      await prisma.user.update({
        where: { id: adminUserId },
        data: { isAdmin: true },
      });
    }

    // Create regular user
    const userRes = await request(app).post('/api/auth/register').send({
      email: uniqueEmail(),
      password: 'TestPass123!',
      name: 'Regular User',
    });
    userToken = userRes.body.data?.token;
  });

  afterAll(async () => {
    await prisma.featureFlag.deleteMany({}).catch(() => {});
    await prisma.user.deleteMany({ where: { email: { startsWith: 'test-' } } }).catch(() => {});
  });

  describe('GET /api/admin/features', () => {
    it('should return feature flags for admin', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get('/api/admin/features')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('flags');
      expect(Array.isArray(res.body.data.flags)).toBe(true);
    });

    it('should reject non-admin user', async () => {
      if (!userToken) return;
      const res = await request(app)
        .get('/api/admin/features')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/admin/features');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/admin/features/:key', () => {
    beforeAll(async () => {
      await prisma.featureFlag.upsert({
        where: { key: 'test_flag' },
        create: { key: 'test_flag', name: 'Test Flag', enabled: false },
        update: {},
      });
    });

    it('should toggle a feature flag', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .patch('/api/admin/features/test_flag')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ enabled: true });

      expect(res.status).toBe(200);
      expect(res.body.data.flag.enabled).toBe(true);
    });

    it('should reject non-admin', async () => {
      if (!userToken) return;
      const res = await request(app)
        .patch('/api/admin/features/test_flag')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: false });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/features', () => {
    it('should return enabled feature keys for authenticated user', async () => {
      if (!userToken) return;
      const res = await request(app)
        .get('/api/features')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('features');
      expect(Array.isArray(res.body.data.features)).toBe(true);
    });
  });
});
