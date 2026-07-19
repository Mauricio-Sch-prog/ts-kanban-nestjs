import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AuthenticatedRequest } from 'src/common/interface/authenticatedRequest.interface';
import { createUserMock } from '../factories/user.factory';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockAuthService = {
    validateToken: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    guard = new AuthGuard(mockAuthService as any, mockReflector as any);
  });

  const createContext = (
    request: Partial<AuthenticatedRequest>,
  ): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  });

  it('should allow if public metadata and no valid cookie', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);

    const context = createContext({ cookies: { access_token: undefined } });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(mockAuthService.validateToken).not.toHaveBeenCalled();
  });

  it('should throw if invalid token and no public', async () => {
    const cookie = 'invalid jwt token';
    mockReflector.getAllAndOverride.mockReturnValue(false);

    const context = createContext({ cookies: { access_token: cookie } });
    mockAuthService.validateToken.mockRejectedValue(
      new UnauthorizedException('Invalid or expired token'),
    );

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(mockAuthService.validateToken).toHaveBeenCalledWith(cookie);
  });

  it('should throw if token belongs to deleted/nonexistent user', async () => {
    const token = 'valid-but-user-does-not-exist';

    mockReflector.getAllAndOverride.mockReturnValue(false);

    const context = createContext({
      cookies: { access_token: token },
    });

    mockAuthService.validateToken.mockRejectedValue(
      new UnauthorizedException('Invalid or expired token'),
    );

    await expect(guard.canActivate(context)).rejects.toThrow(
      'Invalid or expired token',
    );

    expect(mockAuthService.validateToken).toHaveBeenCalledWith(token);
  });

  it('should throw if no access cookies', async () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);

    const context = createContext({ cookies: { access_token: undefined } });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Missing token'),
    );

    expect(mockAuthService.validateToken).not.toHaveBeenCalled();
  });

  it('should allow if token is valid and user exists', async () => {
    const cookie = 'valid cookie';
    const user = createUserMock();
    mockReflector.getAllAndOverride.mockReturnValue(false);

    const request = {
      cookies: { access_token: cookie },
    } as Partial<AuthenticatedRequest>;

    const context = createContext(request);
    mockAuthService.validateToken.mockResolvedValue(user);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(mockAuthService.validateToken).toHaveBeenCalledWith(cookie);
    expect(request.user).toEqual(user);
  });
});
