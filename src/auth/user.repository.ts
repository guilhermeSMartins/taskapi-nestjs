import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async signUp(authCDto: AuthCredentialsDto): Promise<void> {
    const { password, username } = authCDto;

    const user = new User();
    const salt = await bcrypt.genSalt();
    user.salt = salt;
    user.password = await this.hashPassword(password, user.salt);
    user.username = username;

    try {
      await user.save();
    } catch (e) {
      if (e.code === '23505')
        throw new ConflictException('Username already exists'); //duplicate username
      throw new InternalServerErrorException();
    }
  }

  async validateUserPassword(authCDto: AuthCredentialsDto): Promise<string> {
    const { username, password } = authCDto;
    const user = await this.findOne({ username });

    if (user && (await user.validatePassword(password))) return user.username;
    return null;
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
