import axios from "./axios";
import { jwtDecode } from "jwt-decode";

/**
 * Logs in a user with given email and password.
 * @param email - User's email address.
 * @param password - User's password.
 * @returns A promise resolving to the authentication token string.
 */
export async function login(email: string, password: string): Promise<string> {
  const res = await axios.post("/login", { email, password });
  return res.data.token;
}

/**
 * Represents the decoded user information payload from a JWT token.
 */
export type UserPayload = {
  user_id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  exp?: number;
};

/**
 * Registers a new user with provided details.
 * @param firstName - User's first name.
 * @param lastName - User's last name.
 * @param email - User's email address.
 * @param password - User's password.
 * @returns A promise resolving to the authentication token string.
 */
export async function signup(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<string> {
  const res = await axios.post("/register", {
    first_name: firstName,
    last_name: lastName,
    email,
    password,
  });
  return res.data.token;
}

/**
 * Decodes a JWT token to extract the user payload.
 * Returns null if the token is invalid, null, or expired.
 * @param token - JWT token string or null.
 * @returns The decoded user payload or null.
 */
export function decodeToken(token: string | null): UserPayload | null {
  if (!token) return null;
  try {
    // Decode token payload
    const decoded = jwtDecode<UserPayload>(token);

    // Check if token expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      // Token expired, treat as invalid
      return null;
    }

    return decoded;
  } catch {
    // Return null on any error during decoding/parsing
    return null;
  }
}
