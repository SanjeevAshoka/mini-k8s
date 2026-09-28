import express from "express";
import { z } from "zod";
import { createTables } from "../db/connection";
import { createPods, getPods, getPod, updatePods, deletePods } from "../db/utils";

const app = express();

app.use(express.json());

const PORT = 3000;


// Create Pod
app.post("/pods", async (req, res) => {
  const schema = z.object({
    name: z.string().min(1),
    image: z.string().min(1),
  });

  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: result.error.flatten(),
    });
  }

  const { name, image } = result.data;

  // Insert Pod into PostgreSQL
  const createdPods = await createPods([
    {
      name,
      image,
      desiredState: "RUNNING",
      currentState: "PENDING",
      nodeId: null,
    },
  ]);

  const createdPod = createdPods[0];

  res.status(201).json({
    message: "Pod created",
    pod: {
      id: createdPod.id,
      name: createdPod.name,
      image: createdPod.image,
      desired_state: createdPod.desiredState,
      current_state: createdPod.currentState,
      node_id: createdPod.nodeId,
    },
  });
});


// Get all Pods
app.get("/pods", async (req, res) => {
  const pods = await getPods();

  res.json(pods.map(pod => ({
    id: pod.id,
    name: pod.name,
    image: pod.image,
    desired_state: pod.desiredState,
    current_state: pod.currentState,
    node_id: pod.nodeId,
    created_at: pod.createdAt,
    updated_at: pod.updatedAt,
  })));
});

// Get one Pod
app.get("/pods/:id", async (req, res) => {
  const { id } = req.params;

  const pod = await getPod(id);

  if (pod.length === 0) {
    return res.status(404).json({ error: "Pod not found" });
  }

  const podData = pod[0];
  res.json({
    id: podData.id,
    name: podData.name,
    image: podData.image,
    desired_state: podData.desiredState,
    current_state: podData.currentState,
    node_id: podData.nodeId,
    created_at: podData.createdAt,
    updated_at: podData.updatedAt,
  });
});


// Update Pod
app.put("/pods/:id", async (req, res) => {
  const schema = z.object({
    image: z.string().min(1).optional(),
    desiredState: z.enum(["RUNNING", "STOPPED"]).optional(),
  });

  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: result.error.flatten(),
    });
  }

  const { id } = req.params;

  // Update Pod in PostgreSQL
  const updateData: any = { id };
  if (result.data.image !== undefined) updateData.image = result.data.image;
  if (result.data.desiredState !== undefined) updateData.desiredState = result.data.desiredState;

  const updatedPods = await updatePods([updateData]);

  if (updatedPods.length === 0) {
    return res.status(404).json({ error: "Pod not found" });
  }

  const updatedPod = updatedPods[0];
  res.json({
    message: "Pod updated",
    pod: {
      id: updatedPod.id,
      name: updatedPod.name,
      image: updatedPod.image,
      desired_state: updatedPod.desiredState,
      current_state: updatedPod.currentState,
      node_id: updatedPod.nodeId,
      updated_at: updatedPod.updatedAt,
    },
  });
});

// Delete Pod
app.delete("/pods/:id", async (req, res) => {
  const { id } = req.params;

  // Instead of deleting, set desired_state to STOPPED so control loop can handle cleanup
  const updatedPods = await updatePods([
    {
      id,
      desiredState: "STOPPED",
    },
  ]);

  if (updatedPods.length === 0) {
    return res.status(404).json({ error: "Pod not found" });
  }

  res.status(204).send();
});

async function startServer() {
  await createTables();

  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}

startServer();