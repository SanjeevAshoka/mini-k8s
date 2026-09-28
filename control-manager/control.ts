import { getPods, updatePods } from "../db/utils";
import { schedulePods } from "../schedular/schedular";
import { createTables } from "../db/connection";

const POLL_INTERVAL_MS = 5000; // Poll every 5 seconds

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

async function controlLoop() {
  console.log("Control Manager: Creating database tables...");
  await createTables();
  console.log("Control Manager: Starting control loop...");

  while (true) {
    try {
      // Fetch all pods from database
      const allPods = await getPods();
      
      // Find pods that need reconciliation (current state != desired state)
      const podsNeedingReconciliation = allPods.filter(
        (pod) => pod.currentState !== pod.desiredState
      );

      if (podsNeedingReconciliation.length > 0) {
        console.log(
          `Control Manager: Found ${podsNeedingReconciliation.length} pods needing reconciliation`
        );

        // Send pods to scheduler for reconciliation
        const reconciliationResults = await schedulePods(podsNeedingReconciliation);

        // Update pod states based on scheduler results
        if (reconciliationResults.length > 0) {
          await updatePods(reconciliationResults);
          console.log(
            `Control Manager: Updated ${reconciliationResults.length} pod states`
          );
        }
      } else {
        console.log("Control Manager: No pods need reconciliation");
      }
    } catch (error) {
      console.error("Control Manager: Error in control loop:", error);
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

// Start the control loop
controlLoop().catch((error) => {
  console.error("Control Manager: Fatal error:", error);
  process.exit(1);
});
