import type { CommunityPost, SummaryDraft } from "@/lib/clientFlow";
import type { UserProfile } from "@/lib/models/userProfile";
import { buildMockRedactedFields, type RedactedField } from "@/lib/mocks/anonymizedSummaryMock";
import { createCommunityPostFromDraft } from "@/lib/services/communityService";

export type PublicSummaryDto = {
  post: CommunityPost;
  redactedFields: RedactedField[];
};

// TODO(backend): `post` is built with the same createCommunityPostFromDraft used at publish time,
// so this preview matches the real post exactly. redactedFields is a mocked Privacy Guard pass
// over the demo profile (see anonymizedSummaryMock.ts). Once /api/analyze exists, the redaction
// list should come from the real Privacy Guard output instead.
export function buildPublicSummaryDto(draft: SummaryDraft, userProfile: UserProfile): PublicSummaryDto {
  return {
    post: createCommunityPostFromDraft(draft),
    redactedFields: buildMockRedactedFields(userProfile)
  };
}
