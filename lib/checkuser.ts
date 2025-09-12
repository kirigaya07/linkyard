import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Ensures the currently authenticated Clerk user has a record in our database.
 * If missing, creates a new row with their profile data.
 */
export async function checkUser() {
  const user = await currentUser();
  if (!user) return null;

  // Check if the user already exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (existing.length > 0) {
    return existing[0]; // Already in DB
  }

  // Build name safely
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || null;

  // Insert new record
  const [newUser] = await db
    .insert(users)
    .values({
      id: user.id,
      name,
      email: user.emailAddresses[0]?.emailAddress,
      imageUrl: user.imageUrl,
    })
    .returning();

  return newUser;
}
