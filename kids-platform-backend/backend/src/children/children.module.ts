import { Module } from "@nestjs/common";
import { ChildrenController } from "./children.controller";
import { ChildPublicController } from "./child-public.controller";
import { ChildrenService } from "./children.service";
import { ChildrenAccessPolicy } from "./children-access.policy";
import { ChildrenInviteService } from "./children-invite.service";
import { ChildrenStatsService } from "./children-stats.service";
import { ChildrenAvatarService } from "./children-avatar.service";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ChildrenController, ChildPublicController],
  providers: [ChildrenService, ChildrenAccessPolicy, ChildrenInviteService, ChildrenStatsService, ChildrenAvatarService],
})
export class ChildrenModule {}
