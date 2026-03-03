import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto";
import { JwtGuard } from "./jwt.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }

  @Post("login")
  login(@Body() body: LoginDto) {
    return this.auth.login(body);
  }

  @UseGuards(JwtGuard)
  @Get("me")
  me(@Req() req: any) {
    return this.auth.me(req.user);
  }
}
