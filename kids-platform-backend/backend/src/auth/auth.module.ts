import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

@Module({
  imports: [
    JwtModule.register({
      secret: "SUPER_SECRET_KEY_CHANGE_ME",
      signOptions: { expiresIn: "7d" },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [JwtModule], // 👈 ОБОВʼЯЗКОВО
})
export class AuthModule {}
