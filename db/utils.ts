import { db } from "./connection";
import { pods } from "./schema";
import { eq } from "drizzle-orm";


// CREATE
export async function createPods(data: typeof pods.$inferInsert[]) {
  return await db
    .insert(pods)
    .values(data)
    .returning();
}


// READ ALL
export async function getPods() {
  return await db
    .select()
    .from(pods);
}


// READ ONE
export async function getPod(id: string) {
  return await db
    .select()
    .from(pods)
    .where(eq(pods.id, id));
}


// UPDATE
export async function updatePods(
  data: {
    id: string;
    image?: string;
    desiredState?: string;
    currentState?: string;
    nodeId?: string | null;
  }[]
) {
  const results = [];

  for (const pod of data) {
    const { id, ...updates } = pod;

    const result = await db
      .update(pods)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(pods.id, id))
      .returning();

    results.push(...result);
  }

  return results;
}


// DELETE
export async function deletePods(ids: string[]) {
  const results = [];

  for (const id of ids) {
    const result = await db
      .delete(pods)
      .where(eq(pods.id, id))
      .returning();

    results.push(...result);
  }

  return results;
}