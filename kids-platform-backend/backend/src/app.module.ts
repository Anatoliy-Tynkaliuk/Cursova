import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { AgeGroupsModule } from "./age-groups/age-groups.module";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AttemptsModule } from './attempts/attempts.module';
import { GamesModule } from "./games/games.module";
import { ChildrenModule } from "./children/children.module";
import { AdminModule } from "./admin/admin.module";


@Module({
  imports: [
    PrismaModule,
    AgeGroupsModule,
    AttemptsModule,
    GamesModule,
    AuthModule,
    ChildrenModule,
    AdminModule,
  ],
    controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
