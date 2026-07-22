import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { OwnershipGuard } from 'src/common/guard/owrnership.guard';
import { AuthenticatedRequest } from 'src/common/interface/authenticatedRequest.interface';

describe('OwnershipGuard', () => {
  let guard: OwnershipGuard;
  const validUuid = '3f9c2a8e-6d41-4b7f-9e2c-5a1d8f0b7c62';

  const mockReflector = {
    get: jest.fn(),
  };

  const mockRepository = {
    findOne: jest.fn(),
  };

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(mockRepository),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    guard = new OwnershipGuard(mockReflector as any, mockDataSource as any);
  });

  const createContext = (
    request: Partial<AuthenticatedRequest>,
  ): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: jest.fn(),
  });

  it('should allow if no ownership metadata', async () => {
    mockReflector.get.mockReturnValue(undefined);

    const context = createContext({});

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('should throw if user is not authenticated', async () => {
    mockReflector.get.mockReturnValue({
      entity: class {},
      where: jest.fn(),
    });

    const context = createContext({ params: {} });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw if resource id is missing', async () => {
    mockReflector.get.mockReturnValue({
      entity: class {},
      param: 'id',
      where: jest.fn(),
    });

    const context = createContext({
      user: { id: 'user-1' },
      params: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      'Missing resource identifier',
    );
  });

  it('should throw if user does not own resource', async () => {
    const whereMock = jest.fn();

    mockReflector.get.mockReturnValue({
      entity: class {},
      param: 'id',
      where: whereMock,
    });

    mockRepository.findOne.mockResolvedValue(null);

    const context = createContext({
      user: { id: 'user-1' },
      params: { id: validUuid },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      'You do not own this resource',
    );

    expect(whereMock).toHaveBeenCalledWith('user-1', validUuid);
    expect(mockRepository.findOne).toHaveBeenCalled();
  });

  it('should allow when user owns resource', async () => {
    const whereMock = jest.fn().mockReturnValue({});

    mockReflector.get.mockReturnValue({
      entity: class {},
      param: 'boardId',
      where: whereMock,
    });

    mockRepository.findOne.mockResolvedValue({ id: validUuid });

    const context = createContext({
      user: { id: 'user-1' },
      params: { boardId: validUuid },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });
});
