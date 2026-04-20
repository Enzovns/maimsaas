import { JobListing, User } from "@prisma/client";

export function matchJobsToUser(
  jobs: JobListing[],
  user: Pick<User, "preferredRoles" | "preferredStates">,
  alreadyAppliedJobIds: Set<string>
): JobListing[] {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return jobs.filter((job) => {
    // Only new jobs
    if (job.scrapedAt < cutoff) return false;

    // Skip already generated
    if (alreadyAppliedJobIds.has(job.id)) return false;

    // State filter (if user specified preferences)
    if (user.preferredStates.length > 0 && job.state) {
      if (!user.preferredStates.includes(job.state)) return false;
    }

    // Role filter (if user specified preferences)
    if (user.preferredRoles.length > 0) {
      const titleLower = job.title.toLowerCase();
      const hasMatch = user.preferredRoles.some((role) =>
        titleLower.includes(role.toLowerCase())
      );
      if (!hasMatch) return false;
    }

    return true;
  });
}
