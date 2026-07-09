"use client";

import { useEffect, useState } from "react";
import { AiGuidanceCard } from "@/components/medicalIntake/AiGuidanceCard";
import { CommunityPostCard } from "@/components/medicalIntake/CommunityPostCard";
import type { CommunityPost } from "@/lib/clientFlow";
import { readSavedCommunityPosts } from "@/lib/services/communityStorageService";

export function CommunityFeed({ posts }: { posts: CommunityPost[] }) {
  const [localPosts, setLocalPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    setLocalPosts(readSavedCommunityPosts());
  }, []);

  const visiblePosts = [...localPosts, ...posts];
  const featuredGuidance = visiblePosts[0]?.aiGuidance;

  return (
    <section className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:items-start" aria-label="Community posts">
      {featuredGuidance ? <AiGuidanceCard guidance={featuredGuidance} /> : null}

      <div className="grid gap-10">
        {visiblePosts.map((post) => (
          <CommunityPostCard post={post} key={post.id} />
        ))}
      </div>
    </section>
  );
}
