import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const makeService = (userOverride: any = undefined) => {
    const usersService = {
      findByEmail: jest.fn().mockResolvedValue(userOverride),
    } as any;
    const jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed.jwt.token'),
    } as any;
    return { service: new AuthService(usersService, jwtService), usersService, jwtService };
  };

  it('rejects when no user is found', async () => {
    const { service } = makeService(undefined);
    await expect(service.login('nobody@tag.org', 'whatever')).rejects.toThrow(UnauthorizedException);
  });

  it('rejects when the user has no password set (e.g. WhatsApp-only member)', async () => {
    const { service } = makeService({ id: '1', email: 'a@tag.org' });
    await expect(service.login('a@tag.org', 'whatever')).rejects.toThrow(UnauthorizedException);
  });

  it('rejects on wrong password', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 4);
    const { service } = makeService({ id: '1', email: 'a@tag.org', passwordHash, fullName: 'A' });
    await expect(service.login('a@tag.org', 'wrong-password')).rejects.toThrow(UnauthorizedException);
  });

  it('returns an access token and user summary on success', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 4);
    const { service, jwtService } = makeService({
      id: '1',
      email: 'a@tag.org',
      passwordHash,
      fullName: 'Jonathan M.',
      role: { name: 'RESPONSABLE' },
    });

    const result = await service.login('a@tag.org', 'correct-password');

    expect(result.accessToken).toBe('signed.jwt.token');
    expect(result.user).toEqual({ id: '1', fullName: 'Jonathan M.', email: 'a@tag.org', role: 'RESPONSABLE' });
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: '1', email: 'a@tag.org', role: 'RESPONSABLE' });
  });
});
