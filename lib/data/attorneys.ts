import { attorneys } from "@/lib/content/attorneys";
import { attorneyUsers } from "./seed/users";

/** Practice areas for a staff attorney, from their public profile. */
function areasFor(userId: string) {
  const slug = attorneyUsers.find((u) => u.id === userId)?.attorneySlug;
  return attorneys.find((a) => a.slug === slug)?.practiceAreas ?? [];
}

/** Attorneys split into those who practice `area` and everyone else. */
export function attorneysByArea(area: string) {
  const inArea = attorneyUsers.filter((u) =>
    (areasFor(u.id) as string[]).includes(area),
  );
  const others = attorneyUsers.filter((u) => !inArea.includes(u));
  return { inArea, others };
}

/** The attorney a lead in `area` would usually go to. */
export function suggestedAttorney(area: string) {
  return attorneysByArea(area).inArea[0] ?? attorneyUsers[0];
}
