import { createPod, deletePod } from "../cri-podman/cri";

interface Pod {
  id: string;
  name: string;
  image: string;
  desiredState: string;
  currentState: string;
  nodeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ReconciliationResult {
  id: string;
  currentState: string;
  nodeId: string | null;
}

export async function schedulePods(
  podsNeedingReconciliation: Pod[]
): Promise<ReconciliationResult[]> {
  const results: ReconciliationResult[] = [];

  for (const pod of podsNeedingReconciliation) {
    try {
      console.log(
        `Scheduler: Processing pod ${pod.name} (desired: ${pod.desiredState}, current: ${pod.currentState})`
      );

      if (pod.desiredState === "RUNNING" && pod.currentState !== "RUNNING") {
        // Pod needs to be created/started
        const nodeId = `node-${Math.floor(Math.random() * 3) + 1}`; // Simple mock node assignment
        
        const success = await createPod(pod.name, pod.image, nodeId);
        
        if (success) {
          results.push({
            id: pod.id,
            currentState: "RUNNING",
            nodeId: nodeId,
          });
          console.log(`Scheduler: Successfully scheduled pod ${pod.name}`);
        } else {
          results.push({
            id: pod.id,
            currentState: "FAILED",
            nodeId: pod.nodeId,
          });
          console.log(`Scheduler: Failed to schedule pod ${pod.name}`);
        }
      } else if (pod.desiredState === "STOPPED" && pod.currentState !== "STOPPED") {
        // Pod needs to be deleted/stopped
        const success = await deletePod(pod.name);
        
        if (success) {
          results.push({
            id: pod.id,
            currentState: "STOPPED",
            nodeId: null,
          });
          console.log(`Scheduler: Successfully stopped pod ${pod.name}`);
        } else {
          results.push({
            id: pod.id,
            currentState: "FAILED",
            nodeId: pod.nodeId,
          });
          console.log(`Scheduler: Failed to stop pod ${pod.name}`);
        }
      }
    } catch (error) {
      console.error(`Scheduler: Error processing pod ${pod.name}:`, error);
      results.push({
        id: pod.id,
        currentState: "FAILED",
        nodeId: pod.nodeId,
      });
    }
  }

  return results;
}
