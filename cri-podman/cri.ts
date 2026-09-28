import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Use docker if available, otherwise fall back to podman
const CONTAINER_RUNTIME = "docker"; // Can be changed to "podman"

export async function createPod(
  name: string,
  image: string,
  nodeId: string
): Promise<boolean> {
  try {
    console.log(`CRI: Creating pod ${name} with image ${image} on ${nodeId}`);

    // Pull the image first
    console.log(`CRI: Pulling image ${image}`);
    await execAsync(`${CONTAINER_RUNTIME} pull ${image}`);

    // Run the container
    const command = `${CONTAINER_RUNTIME} run -d --name ${name} ${image}`;
    console.log(`CRI: Executing: ${command}`);
    
    await execAsync(command);
    
    console.log(`CRI: Successfully created pod ${name}`);
    return true;
  } catch (error) {
    console.error(`CRI: Failed to create pod ${name}:`, error);
    return false;
  }
}

export async function deletePod(name: string): Promise<boolean> {
  try {
    console.log(`CRI: Deleting pod ${name}`);

    // Stop and remove the container
    const command = `${CONTAINER_RUNTIME} rm -f ${name}`;
    console.log(`CRI: Executing: ${command}`);
    
    await execAsync(command);
    
    console.log(`CRI: Successfully deleted pod ${name}`);
    return true;
  } catch (error) {
    console.error(`CRI: Failed to delete pod ${name}:`, error);
    return false;
  }
}

export async function getPodStatus(name: string): Promise<string> {
  try {
    const command = `${CONTAINER_RUNTIME} inspect -f '{{.State.Status}}' ${name}`;
    const { stdout } = await execAsync(command);
    return stdout.trim();
  } catch (error) {
    console.error(`CRI: Failed to get status for pod ${name}:`, error);
    return "UNKNOWN";
  }
}
