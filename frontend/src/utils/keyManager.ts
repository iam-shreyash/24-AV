/**
 * Centralized API Key Manager for Frontend
 * 
 * This utility provides a secure way to access API keys from the backend.
 * Keys are never stored in the frontend - they are fetched from the backend
 * when needed (for client-side operations like payment gateways).
 * 
 * For server-side operations, keys should be accessed via backend KeyManager.
 */

import axios from "axios";
import { getStoredAuth } from "../components/auth/Login";

// Cache for API keys (only for client-side operations)
const keyCache: Record<string, string> = {};

/**
 * Get an API key by name.
 * 
 * Note: This is primarily for client-side operations (e.g., Stripe publishable key).
 * For server-side operations, use the backend KeyManager.
 * 
 * @param keyName - Name of the API key
 * @param useCache - Whether to use cached value (default: true)
 * @returns Promise resolving to the API key value or null
 */
export async function getApiKey(
  keyName: string,
  useCache: boolean = true
): Promise<string | null> {
  // Check cache first
  if (useCache && keyCache[keyName]) {
    return keyCache[keyName];
  }

  try {
    const auth = getStoredAuth();
    if (!auth?.token) {
      console.warn("No auth token available for API key fetch");
      return null;
    }

    // Fetch from backend
    const response = await axios.get(`/api/api-keys/${keyName}/value`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });

    if (response.data?.value) {
      keyCache[keyName] = response.data.value;
      return response.data.value;
    }

    return null;
  } catch (error: any) {
    console.error(`Error fetching API key ${keyName}:`, error);
    return null;
  }
}

/**
 * Clear the API key cache.
 */
export function clearKeyCache(): void {
  Object.keys(keyCache).forEach((key) => delete keyCache[key]);
}

/**
 * Standard API key names (for type safety and consistency)
 */
export const API_KEY_NAMES = {
  RAZORPAY_KEY_ID: "RAZORPAY_KEY_ID",
  RAZORPAY_KEY_SECRET: "RAZORPAY_KEY_SECRET",
  STRIPE_SECRET_KEY: "STRIPE_SECRET_KEY",
  STRIPE_PUBLISHABLE_KEY: "STRIPE_PUBLISHABLE_KEY",
  PAYPAL_CLIENT_ID: "PAYPAL_CLIENT_ID",
  PAYPAL_CLIENT_SECRET: "PAYPAL_CLIENT_SECRET",
  OTP_SERVICE_KEY: "OTP_SERVICE_KEY",
  AVIATIONSTACK_API_KEY: "AVIATIONSTACK_API_KEY",
} as const;

/**
 * Type-safe API key name
 */
export type ApiKeyName = typeof API_KEY_NAMES[keyof typeof API_KEY_NAMES];

