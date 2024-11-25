import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { Memory } from "./types";

// TODO: Organize DB and Drizzle code in a separate db file
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { eq } from 'drizzle-orm';

const memories = pgTable("memories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("imageUrl").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

// Initialize Drizzle with PostgreSQL adapter
const db = drizzle("postgresql://memory-lane_owner:" + process.env.NEON_SECRET + "@ep-dry-thunder-a5c84sxk.us-east-2.aws.neon.tech/memory-lane?sslmode=require");

const app: Express = express();
const port = 4001;

app.use(cors());
app.use(express.json());

// Get all memories
app.get('/memories', async (req: Request, res: Response) => {
  try {
    const rawMemories = await db.select().from(memories);
    const allMemories = rawMemories.map((memory) => ({
      ...memory,
      timestamp: Math.floor(new Date(memory.timestamp).getTime() / 1000),
    }));
    res.json({ memories: allMemories });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Create a new memory
app.post('/memories', async (req: Request, res: Response) => {
  const { name, description, imageUrl, timestamp } = req.body as Memory;

  if (!name || !description || !imageUrl || !timestamp) {
    res.status(400).json({
      error: 'Please provide all fields: name, description, imageUrl, timestamp',
    });
    return;
  }

  try {
    await db.insert(memories).values({
      name,
      description,
      imageUrl,
      timestamp: new Date(timestamp * 1000), // Convert to JS Date
    });
    res.status(201).json({ message: "Memory created successfully" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Get a memory by ID
app.get('/memories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const memory = await db.select().from(memories).where(eq(memories.id, Number(id)));
    if (!memory) {
      res.status(404).json({ error: "Memory not found" });
      return;
    }
    res.json({ memory });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Update a memory by ID
app.put('/memories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, imageUrl, timestamp } = req.body as Memory;

  if (!name || !description || !imageUrl || !timestamp) {
    res.status(400).json({
      error: 'Please provide all fields: name, description, imageUrl, timestamp',
    });
    return;
  }

  try {
    await db
      .update(memories)
      .set({
        name,
        description,
        imageUrl,
        timestamp: new Date(timestamp * 1000),
      })
      .where(eq(memories.id, Number(id)));
    res.json({ message: "Memory updated successfully" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Delete a memory by ID
app.delete('/memories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.delete(memories).where(eq(memories.id, Number(id)));
    res.json({ message: "Memory deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
