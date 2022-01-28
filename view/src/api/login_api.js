import axios from "axios";
import { loginUser } from "./axios_wrapper";
// returns dictionary with keys status (201,401,404) and data (the token)
export default async function loginUserValidator(credentials) {
  try {
    const loginResult = await loginUser(credentials);
    return { status: loginResult.status, token: loginResult.data };
  } catch (e) {
    return { status: e.response.status };
  }
}
