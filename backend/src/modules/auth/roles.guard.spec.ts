import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function makeContext(user: any) {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as any;
}

describe('RolesGuard', () => {
  it('allows access when no roles are required', () => {
    const reflector = { getAllAndOverride: () => undefined } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext({ role: 'INTERCESSEUR' }))).toBe(true);
  });

  it('allows access when the user role is in the required list', () => {
    const reflector = { getAllAndOverride: () => ['RESPONSABLE', 'INTERCESSEUR'] } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext({ role: 'INTERCESSEUR' }))).toBe(true);
  });

  it('throws ForbiddenException when the user role is not allowed', () => {
    const reflector = { getAllAndOverride: () => ['RESPONSABLE'] } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(makeContext({ role: 'INTERCESSEUR' }))).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when there is no user on the request', () => {
    const reflector = { getAllAndOverride: () => ['RESPONSABLE'] } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(ForbiddenException);
  });
});
