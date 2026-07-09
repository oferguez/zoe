export type UserProfile = {
  preferredName: string;
  ageRange: string;
  sexOrGender: string;
  mobileNumber: number;
  email?: string;
  address: string;
  country: string;
  nshNumber?: string;
  existingDiagnosed: string;
};

export function formatUserProfile(profile: UserProfile) {
  return [
    profile.preferredName ? `Name or initials: ${profile.preferredName}` : "Name or initials: Not provided",
    `Age range: ${profile.ageRange || "Not specified"}`,
    `Sex/gender: ${profile.sexOrGender || "Not specified"}`,
    `Mobile number: ${profile.mobileNumber || "Not specified"}`,
    `Email: ${profile.email || "Not specified"}`,
    `Address: ${profile.address || "Not specified"}`,
    `Country: ${profile.country || "Not specified"}`,
    `NSH number: ${profile.nshNumber || "Not specified"}`,
    `Existing diagnosed: ${profile.existingDiagnosed || "Not specified"}`
  ];
}

export function formatUserProfileLine(profile: UserProfile) {
  return formatUserProfile(profile).join("; ");
}
