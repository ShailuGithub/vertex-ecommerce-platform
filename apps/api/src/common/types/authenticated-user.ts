import { UserRole } from "@vertex/shared-types";

export interface AuthenticatedUser {
  userId: number;
  email: string;
  role: UserRole;
  storeId: number | null;
}
