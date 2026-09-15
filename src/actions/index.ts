import { login } from "./login";
import { register } from "./register";
import { logout } from "./logout";
import { offer } from "@feature/offer";

export const server = {
  user: { login, register, logout },
  offer,
};
