import { ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class RolePolicyService {
  requireAny(user: { role?: string }, roles: string[], message = "Forbidden") {
    if (!roles.includes(user?.role ?? "")) {
      throw new ForbiddenException(message);
    }
  }

  isParent(user: { role?: string }) {
    return user?.role === "parent";
  }
}
