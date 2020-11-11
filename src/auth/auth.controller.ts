import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body(ValidationPipe) authCDto: AuthCredentialsDto): Promise<void> {
    return this.authService.signUp(authCDto);
  }

  @Post('/signin')
  signIn(
    @Body(ValidationPipe) authCDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCDto);
  }
}
