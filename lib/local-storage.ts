/**
 * local-storage.ts — Client-side persistence for Divify
 *
 * Replaces Supabase for user-facing data (profiles, feedback, referrals).
 * All data is stored in localStorage with structured keys.
 * Analytics data is pulled from Stellar Horizon (see horizon-analytics.ts).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserProfile {
  wallet_address: string;
  name: string;
  email: string;
  joined_at: string;
  last_active: string;
  onboarded: boolean;
  referral_code: string;
  referred_by: string | null;
}

export interface UserFeedback {
  id: string;
  wallet_address: string;
  name: string;
  email: string;
  rating: number;
  ease_of_use: number;
  would_recommend: number;
  favorite_feature: string | null;
  improvement_suggestion: string | null;
  experienced_bugs: string | null;
  created_at: string;
}

export interface ReferralEntry {
  referral_code: string;
  referred_address: string;
  joined_at: string;
}

// ---------------------------------------------------------------------------
// Storage Keys
// ---------------------------------------------------------------------------

const PROFILE_KEY = (wallet: string) => `divify_profile_${wallet}`;
const FEEDBACK_KEY = (wallet: string) => `divify_feedback_${wallet}`;
const REFERRALS_KEY = (wallet: string) => `divify_referrals_${wallet}`;
const ONBOARDING_KEY = "divify_onboarding_complete";

// ---------------------------------------------------------------------------
// User Profile Helpers
// ---------------------------------------------------------------------------

/** Generate a deterministic referral code from the wallet address. */
export function generateReferralCode(walletAddress: string): string {
  // Use last 4 + first 4 chars of the address for a memorable code
  const suffix = walletAddress.slice(-4).toUpperCase();
  const prefix = walletAddress.slice(1, 4).toUpperCase();
  return `${prefix}${suffix}`;
}

/** Read a user profile from localStorage. Returns null if not found. */
export function getUserProfile(walletAddress: string): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY(walletAddress));
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

/** Create or update a user profile in localStorage. */
export function upsertUserProfile(
  data: Pick<UserProfile, "wallet_address" | "name" | "email"> & {
    referred_by?: string | null;
  }
): UserProfile {
  if (typeof window === "undefined") return data as UserProfile;

  const existing = getUserProfile(data.wallet_address);
  const now = new Date().toISOString();

  const profile: UserProfile = {
    wallet_address: data.wallet_address,
    name: data.name || existing?.name || "",
    email: data.email || existing?.email || "",
    joined_at: existing?.joined_at ?? now,
    last_active: now,
    onboarded: existing?.onboarded ?? false,
    referral_code:
      existing?.referral_code ?? generateReferralCode(data.wallet_address),
    referred_by: data.referred_by ?? existing?.referred_by ?? null,
  };

  localStorage.setItem(PROFILE_KEY(data.wallet_address), JSON.stringify(profile));
  return profile;
}

/** Mark a user as having completed onboarding. */
export function markUserOnboarded(walletAddress: string): boolean {
  const profile = getUserProfile(walletAddress);
  if (!profile) return false;
  profile.onboarded = true;
  localStorage.setItem(PROFILE_KEY(walletAddress), JSON.stringify(profile));
  return true;
}

/** Update last_active timestamp for a wallet. */
export function touchUserActivity(walletAddress: string): void {
  if (typeof window === "undefined") return;
  const profile = getUserProfile(walletAddress);
  if (!profile) {
    // Auto-create minimal profile on first activity
    upsertUserProfile({ wallet_address: walletAddress, name: "", email: "" });
    return;
  }
  profile.last_active = new Date().toISOString();
  localStorage.setItem(PROFILE_KEY(walletAddress), JSON.stringify(profile));
}

/** Check if global onboarding tour has been dismissed. */
export function isTourDismissed(): boolean {
  if (typeof window === "undefined") return true;
  return !!localStorage.getItem(ONBOARDING_KEY);
}

/** Dismiss the onboarding tour permanently. */
export function dismissTour(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_KEY, "true");
}

// ---------------------------------------------------------------------------
// Feedback Helpers
// ---------------------------------------------------------------------------

/** Check if a wallet has already submitted feedback. */
export function hasSubmittedFeedback(walletAddress: string): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(FEEDBACK_KEY(walletAddress));
}

/** Save user feedback to localStorage. */
export function saveUserFeedback(
  feedback: Omit<UserFeedback, "id" | "created_at">
): UserFeedback {
  const full: UserFeedback = {
    ...feedback,
    id: `${feedback.wallet_address.slice(0, 6)}_${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(FEEDBACK_KEY(feedback.wallet_address), JSON.stringify(full));
  return full;
}

/** Retrieve previously submitted feedback for a wallet. */
export function getUserFeedback(walletAddress: string): UserFeedback | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY(walletAddress));
    if (!raw) return null;
    return JSON.parse(raw) as UserFeedback;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Referral Helpers
// ---------------------------------------------------------------------------

/** Record that a wallet used a referral code. */
export function recordReferral(
  referralCode: string,
  referredAddress: string
): void {
  if (typeof window === "undefined") return;

  // Store referral under the code so the referrer can see it
  const key = REFERRALS_KEY(referralCode);
  try {
    const existing: ReferralEntry[] = JSON.parse(
      localStorage.getItem(key) ?? "[]"
    );
    // Avoid duplicate entries
    if (existing.some((r) => r.referred_address === referredAddress)) return;
    existing.push({
      referral_code: referralCode,
      referred_address: referredAddress,
      joined_at: new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {
    // silently ignore
  }
}

/** Get all referrals made using a specific referral code. */
export function getReferrals(referralCode: string): ReferralEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(REFERRALS_KEY(referralCode)) ?? "[]");
  } catch {
    return [];
  }
}

/** Get the referral code for a wallet (from their profile). */
export function getWalletReferralCode(walletAddress: string): string {
  const profile = getUserProfile(walletAddress);
  return profile?.referral_code ?? generateReferralCode(walletAddress);
}
