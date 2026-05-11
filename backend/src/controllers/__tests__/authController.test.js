const buildReq = (body = {}, ip = '127.0.0.1') => ({
  body,
  ip
});

const buildRes = () => {
  const res = {
    statusCode: 200,
    body: null
  };

  res.status = jest.fn((code) => {
    res.statusCode = code;
    return res;
  });

  res.json = jest.fn((payload) => {
    res.body = payload;
    return res;
  });

  res.send = jest.fn(() => res);

  return res;
};

const loadAuthController = ({ maxAttempts } = {}) => {
  jest.resetModules();

  if (typeof maxAttempts === 'number') {
    process.env.MAX_LOGIN_ATTEMPTS = String(maxAttempts);
  } else {
    delete process.env.MAX_LOGIN_ATTEMPTS;
  }

  process.env.LOCK_TIME_MINUTES = '15';

  const mockUser = {
    findOne: jest.fn(),
    findById: jest.fn()
  };

  const mockBcrypt = {
    compare: jest.fn()
  };

  let signCounter = 0;
  const mockJwt = {
    sign: jest.fn(() => `signed-token-${++signCounter}`),
    verify: jest.fn()
  };

  jest.doMock('../../models/User', () => mockUser);
  jest.doMock('bcryptjs', () => mockBcrypt);
  jest.doMock('jsonwebtoken', () => mockJwt);

  // eslint-disable-next-line global-require
  const authController = require('../authController');

  return {
    authController,
    mockUser,
    mockBcrypt,
    mockJwt
  };
};

describe('authController', () => {
  afterEach(() => {
    delete process.env.MAX_LOGIN_ATTEMPTS;
    delete process.env.LOCK_TIME_MINUTES;
  });

  test('login exitoso devuelve token, refresh token y rol', async () => {
    const { authController, mockUser, mockBcrypt } = loadAuthController();
    const userDoc = {
      _id: { toString: () => 'user-1' },
      username: 'admin',
      role: 'admin',
      passwordHash: 'hash'
    };

    const persistedUser = {
      refreshTokens: [],
      save: jest.fn().mockResolvedValue(undefined)
    };

    mockUser.findOne.mockResolvedValue(userDoc);
    mockBcrypt.compare.mockResolvedValue(true);
    mockUser.findById.mockResolvedValue(persistedUser);

    const req = buildReq({ role: 'admin', username: 'admin', password: 'admin123' });
    const res = buildRes();

    await authController.login(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
    expect(res.body.role).toBe('admin');
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(persistedUser.refreshTokens).toContain(res.body.refreshToken);
  });

  test('bloquea temporalmente tras exceder intentos fallidos', async () => {
    const { authController, mockUser } = loadAuthController({ maxAttempts: 2 });

    mockUser.findOne.mockResolvedValue(null);

    const req = buildReq({ role: 'admin', username: 'admin', password: 'incorrecta' });

    const res1 = buildRes();
    await authController.login(req, res1);
    expect(res1.statusCode).toBe(401);

    const res2 = buildRes();
    await authController.login(req, res2);
    expect(res2.statusCode).toBe(401);

    const res3 = buildRes();
    await authController.login(req, res3);
    expect(res3.statusCode).toBe(429);
    expect(res3.body.message).toContain('Cuenta bloqueada temporalmente');
  });

  test('refresh rota refresh token y devuelve nuevo access token', async () => {
    const { authController, mockUser, mockJwt } = loadAuthController();

    mockJwt.verify.mockReturnValue({ tokenType: 'refresh', sub: 'user-1' });

    const userDoc = {
      _id: { toString: () => 'user-1' },
      role: 'admin',
      username: 'admin',
      refreshTokens: ['refresh-antiguo', 'otro-token'],
      save: jest.fn().mockResolvedValue(undefined)
    };

    mockUser.findById.mockResolvedValue(userDoc);

    const req = buildReq({ refreshToken: 'refresh-antiguo' });
    const res = buildRes();

    await authController.refresh(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.refreshToken).not.toBe('refresh-antiguo');
    expect(userDoc.refreshTokens).not.toContain('refresh-antiguo');
    expect(userDoc.refreshTokens).toContain(res.body.refreshToken);
    expect(userDoc.save).toHaveBeenCalled();
  });

  test('refresh falla con token no reconocido', async () => {
    const { authController, mockUser, mockJwt } = loadAuthController();

    mockJwt.verify.mockReturnValue({ tokenType: 'refresh', sub: 'user-1' });
    mockUser.findById.mockResolvedValue({
      role: 'externo',
      username: 'externo',
      refreshTokens: ['otro-token'],
      save: jest.fn()
    });

    const req = buildReq({ refreshToken: 'refresh-inexistente' });
    const res = buildRes();

    await authController.refresh(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Refresh token no reconocido.');
  });

  test('logout elimina refresh token almacenado', async () => {
    const { authController, mockUser, mockJwt } = loadAuthController();

    mockJwt.verify.mockReturnValue({ sub: 'user-1' });

    const userDoc = {
      refreshTokens: ['refresh-a-eliminar', 'refresh-vigente'],
      save: jest.fn().mockResolvedValue(undefined)
    };

    mockUser.findById.mockResolvedValue(userDoc);

    const req = buildReq({ refreshToken: 'refresh-a-eliminar' });
    const res = buildRes();

    await authController.logout(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(userDoc.refreshTokens).toEqual(['refresh-vigente']);
    expect(userDoc.save).toHaveBeenCalled();
  });
});
