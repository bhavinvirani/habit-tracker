import request from 'supertest';
import { createTestApp, uniqueEmail } from '../helpers';
import prisma from '../../config/database';

const app = createTestApp();

describe('Admin API', () => {
  let adminToken: string;
  let adminUserId: string;
  let userToken: string;
  let regularUserId: string;

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
    regularUserId = userRes.body.data?.user?.id;
  });

  afterAll(async () => {
    await prisma.featureFlagAudit.deleteMany({}).catch(() => {});
    await prisma.featureFlag.deleteMany({}).catch(() => {});
    await prisma.user.deleteMany({ where: { email: { startsWith: 'test-' } } }).catch(() => {});
  });

  // ─── Feature Flag Read ────────────────────────────────────────

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

  // ─── Feature Flag Toggle ──────────────────────────────────────

  describe('PATCH /api/admin/features/:key', () => {
    beforeAll(async () => {
      try {
        await prisma.featureFlag.upsert({
          where: { key: 'test_flag' },
          create: { key: 'test_flag', name: 'Test Flag', enabled: false },
          update: {},
        });
      } catch {
        // DB may not be reachable outside Docker — tests will skip via token guards
      }
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

  // ─── Feature Flag Create ──────────────────────────────────────

  describe('POST /api/admin/features', () => {
    afterAll(async () => {
      await prisma.featureFlagAudit
        .deleteMany({ where: { flagKey: 'new_test_flag' } })
        .catch(() => {});
      await prisma.featureFlag.deleteMany({ where: { key: 'new_test_flag' } }).catch(() => {});
    });

    it('should create a new feature flag (201)', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .post('/api/admin/features')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: 'new_test_flag',
          name: 'New Test Flag',
          description: 'A test flag',
          category: 'testing',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.flag.key).toBe('new_test_flag');
      expect(res.body.data.flag.enabled).toBe(false);
    });

    it('should return 409 for duplicate key', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .post('/api/admin/features')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: 'new_test_flag',
          name: 'Duplicate Flag',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid key format', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .post('/api/admin/features')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          key: 'Invalid-Key!',
          name: 'Bad Key',
        });

      expect(res.status).toBe(400);
    });

    it('should reject non-admin', async () => {
      if (!userToken) return;
      const res = await request(app)
        .post('/api/admin/features')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          key: 'hacker_flag',
          name: 'Hacker Flag',
        });

      expect(res.status).toBe(403);
    });
  });

  // ─── Feature Flag Delete ──────────────────────────────────────

  describe('DELETE /api/admin/features/:key', () => {
    beforeAll(async () => {
      try {
        await prisma.featureFlag.upsert({
          where: { key: 'delete_me_flag' },
          create: { key: 'delete_me_flag', name: 'Delete Me', enabled: false },
          update: {},
        });
      } catch {
        // skip
      }
    });

    afterAll(async () => {
      await prisma.featureFlagAudit
        .deleteMany({ where: { flagKey: 'delete_me_flag' } })
        .catch(() => {});
    });

    it('should delete a feature flag (204)', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .delete('/api/admin/features/delete_me_flag')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });

    it('should return 404 for unknown key', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .delete('/api/admin/features/nonexistent_flag')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should reject non-admin', async () => {
      if (!userToken) return;
      const res = await request(app)
        .delete('/api/admin/features/test_flag')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── Audit Log ────────────────────────────────────────────────

  describe('GET /api/admin/features/audit', () => {
    it('should return audit entries with pagination', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get('/api/admin/features/audit')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('pagination');
    });

    it('should filter by flagKey', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get('/api/admin/features/audit?flagKey=test_flag')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      if (res.body.data.length > 0) {
        expect(res.body.data.every((e: { flagKey: string }) => e.flagKey === 'test_flag')).toBe(
          true
        );
      }
    });

    it('should reject non-admin', async () => {
      if (!userToken) return;
      const res = await request(app)
        .get('/api/admin/features/audit')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── User Management ──────────────────────────────────────────

  describe('GET /api/admin/users', () => {
    it('should return paginated user list (200)', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta?.pagination).toBeDefined();
      if (res.body.data.length > 0) {
        expect(res.body.data[0]).toHaveProperty('name');
        expect(res.body.data[0]).toHaveProperty('email');
        expect(res.body.data[0]).toHaveProperty('_count');
      }
    });

    it('should filter with search parameter', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get('/api/admin/users?search=Admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should reject non-admin', async () => {
      if (!userToken) return;
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/admin/users/:id/role', () => {
    it('should promote a user to admin (200)', async () => {
      if (!adminToken || !regularUserId) return;
      const res = await request(app)
        .patch(`/api/admin/users/${regularUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isAdmin: true });

      expect(res.status).toBe(200);
      expect(res.body.data.user.isAdmin).toBe(true);

      // Revert for other tests
      await prisma.user.update({
        where: { id: regularUserId },
        data: { isAdmin: false },
      });
    });

    it('should block self-demotion (400)', async () => {
      if (!adminToken || !adminUserId) return;
      const res = await request(app)
        .patch(`/api/admin/users/${adminUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isAdmin: false });

      expect(res.status).toBe(400);
    });

    it('should return 404 for unknown user', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .patch('/api/admin/users/00000000-0000-0000-0000-000000000000/role')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isAdmin: true });

      expect(res.status).toBe(404);
    });

    it('should reject non-admin', async () => {
      if (!userToken || !adminUserId) return;
      const res = await request(app)
        .patch(`/api/admin/users/${adminUserId}/role`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ isAdmin: false });

      expect(res.status).toBe(403);
    });
  });

  // ─── Application Stats ────────────────────────────────────────

  describe('GET /api/admin/stats', () => {
    it('should return application stats (200)', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats).toHaveProperty('totalUsers');
      expect(res.body.data.stats).toHaveProperty('totalHabits');
      expect(res.body.data.stats).toHaveProperty('totalHabitLogs');
      expect(res.body.data.stats).toHaveProperty('adminCount');
      expect(res.body.data.stats).toHaveProperty('activeUsersLast7Days');
      expect(res.body.data.stats).toHaveProperty('avgCompletionRate');
    });

    it('should reject non-admin', async () => {
      if (!userToken) return;
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── System Stats ─────────────────────────────────────────────

  describe('GET /api/admin/stats/system', () => {
    it('should return system stats for admin (200)', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get('/api/admin/stats/system')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats).toHaveProperty('application');
      expect(res.body.data.stats).toHaveProperty('system');
      expect(res.body.data.stats).toHaveProperty('cache');
      expect(res.body.data.stats).toHaveProperty('requests');
      expect(res.body.data.stats).toHaveProperty('errors');
      expect(res.body.data.stats).toHaveProperty('dependencies');
      expect(res.body.data.stats.application).toHaveProperty('uptime');
      expect(res.body.data.stats.system).toHaveProperty('memory');
    });

    it('should reject non-admin', async () => {
      if (!userToken) return;
      const res = await request(app)
        .get('/api/admin/stats/system')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── Trends ───────────────────────────────────────────────────

  describe('GET /api/admin/stats/trends', () => {
    it('should return trend data (200)', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get('/api/admin/stats/trends')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.trends)).toBe(true);
      if (res.body.data.trends.length > 0) {
        expect(res.body.data.trends[0]).toHaveProperty('date');
        expect(res.body.data.trends[0]).toHaveProperty('newUsers');
        expect(res.body.data.trends[0]).toHaveProperty('activeUsers');
        expect(res.body.data.trends[0]).toHaveProperty('completionRate');
      }
    });

    it('should accept days query param', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get('/api/admin/stats/trends?days=7')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.trends.length).toBeLessThanOrEqual(8); // 7 days + today
    });

    it('should reject non-admin', async () => {
      if (!userToken) return;
      const res = await request(app)
        .get('/api/admin/stats/trends')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── Content Breakdown ────────────────────────────────────────

  describe('GET /api/admin/stats/content', () => {
    it('should return content breakdown (200)', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get('/api/admin/stats/content')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.breakdown).toHaveProperty('habits');
      expect(res.body.data.breakdown).toHaveProperty('books');
      expect(res.body.data.breakdown).toHaveProperty('challenges');
      expect(res.body.data.breakdown).toHaveProperty('engagement');
      expect(res.body.data.breakdown.habits).toHaveProperty('byFrequency');
      expect(res.body.data.breakdown.habits).toHaveProperty('byType');
      expect(res.body.data.breakdown.habits).toHaveProperty('byCategory');
      expect(res.body.data.breakdown.engagement).toHaveProperty('avgHabitsPerUser');
    });

    it('should reject non-admin', async () => {
      if (!userToken) return;
      const res = await request(app)
        .get('/api/admin/stats/content')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── User Detail ──────────────────────────────────────────────

  describe('GET /api/admin/users/:id', () => {
    it('should return user detail (200)', async () => {
      if (!adminToken || !regularUserId) return;
      const res = await request(app)
        .get(`/api/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user).toHaveProperty('name');
      expect(res.body.data.user).toHaveProperty('email');
      expect(res.body.data.user).toHaveProperty('timezone');
      expect(res.body.data.user).toHaveProperty('_count');
      expect(res.body.data.user).toHaveProperty('habits');
      expect(res.body.data.user).toHaveProperty('books');
      expect(res.body.data.user).toHaveProperty('challenges');
      expect(Array.isArray(res.body.data.user.habits)).toBe(true);
    });

    it('should return 404 for invalid user ID', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get('/api/admin/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should reject non-admin', async () => {
      if (!userToken || !regularUserId) return;
      const res = await request(app)
        .get(`/api/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── Data Export ──────────────────────────────────────────────

  describe('GET /api/admin/export/:type', () => {
    it('should export users as CSV', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get('/api/admin/export/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.text).toContain('ID,Name,Email');
    });

    it('should export habits as CSV', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get('/api/admin/export/habits')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
    });

    it('should export logs as CSV', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get('/api/admin/export/logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
    });

    it('should return 400 for invalid export type', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get('/api/admin/export/invalid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('should reject non-admin', async () => {
      if (!userToken) return;
      const res = await request(app)
        .get('/api/admin/export/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── Session Management ───────────────────────────────────────

  describe('GET /api/admin/sessions', () => {
    it('should return active sessions (200)', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .get('/api/admin/sessions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.sessions)).toBe(true);
      if (res.body.data.sessions.length > 0) {
        expect(res.body.data.sessions[0]).toHaveProperty('id');
        expect(res.body.data.sessions[0]).toHaveProperty('createdAt');
        expect(res.body.data.sessions[0]).toHaveProperty('expiresAt');
        expect(res.body.data.sessions[0]).toHaveProperty('user');
      }
    });

    it('should reject non-admin', async () => {
      if (!userToken) return;
      const res = await request(app)
        .get('/api/admin/sessions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/admin/sessions/:id', () => {
    it('should revoke a session', async () => {
      if (!adminToken) return;
      // First get sessions to find a valid ID
      const listRes = await request(app)
        .get('/api/admin/sessions')
        .set('Authorization', `Bearer ${adminToken}`);

      if (listRes.body.data.sessions.length === 0) return;

      const sessionId = listRes.body.data.sessions[0].id;
      const res = await request(app)
        .delete(`/api/admin/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for unknown session', async () => {
      if (!adminToken) return;
      const res = await request(app)
        .delete('/api/admin/sessions/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should reject non-admin', async () => {
      if (!userToken) return;
      const res = await request(app)
        .delete('/api/admin/sessions/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── Public Features Endpoint ─────────────────────────────────

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
