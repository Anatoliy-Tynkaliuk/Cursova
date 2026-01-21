import { Module } from "@nestjs/common";
import { ChildrenController } from "./children.controller";
import { ChildPublicController } from "./child-public.controller";
import { ChildrenService } from "./children.service";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ChildrenController, ChildPublicController],
  providers: [ChildrenService],
})
export class ChildrenModule {}
