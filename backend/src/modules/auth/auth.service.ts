import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService, private readonly jwt: JwtService) {}

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user?.passwordHash) throw new UnauthorizedException('Identifiants invalides');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    const token = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role?.name });
    return {
      accessToken: token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role?.name },
    };
  }
}
