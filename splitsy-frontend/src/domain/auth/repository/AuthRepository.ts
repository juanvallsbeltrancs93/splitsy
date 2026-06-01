import type { User } from "../../users/entities/User";
import type { Token } from "../entities/Token";
import type { LoginParams, RegisterParams } from "./types";

export interface AuthRepository {
  login(params: LoginParams): Promise<Token>;
  register(params: RegisterParams): Promise<User>;
}
