import type { User } from "../entities/User";
import type { GetMeParams } from "./types";

export interface UserRepository {
  getMe(params: GetMeParams): Promise<User>;
}
