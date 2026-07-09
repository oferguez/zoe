import { mockUserProfile } from "@/lib/mocks/userProfileMock";
import type { UserProfile } from "@/lib/models/userProfile";

export type RedactedField = {
  field: string;
  originalValue: string;
};

// Mocks what the local Privacy Guard (see Doc/doc.md) would strip from a UserProfile
// before anything reaches the community or an export. No backend/PII-detection exists yet -
// this stands in for that so the preview UI has something real to show.
export function buildMockRedactedFields(profile: UserProfile): RedactedField[] {
  return [
    { field: "Name", originalValue: profile.preferredName },
    { field: "Email", originalValue: profile.email },
    { field: "Phone number", originalValue: String(profile.mobileNumber || "") },
    { field: "Address", originalValue: profile.address },
    { field: "NHS number", originalValue: profile.nshNumber }
  ].filter((item): item is RedactedField => Boolean(item.originalValue));
}

export const mockPrivacyGuardRedactions = buildMockRedactedFields(mockUserProfile);

// Same Privacy Guard mock, but for cases that need a real UserProfile back (e.g. building a
// compiled prompt for an external agent) rather than a display list of what was removed.
// Clinical-adjacent fields (age range, sex/gender, existing diagnosis) are kept; identifying
// fields are blanked so formatUserProfile()'s own "Not provided"/"Not specified" fallbacks apply.
export function buildRedactedProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    preferredName: "",
    mobileNumber: 0,
    email: undefined,
    address: "",
    nshNumber: undefined
  };
}
