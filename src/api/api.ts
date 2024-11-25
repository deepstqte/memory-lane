import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Memory } from "./types";

import { WorkOS, AuthenticateWithSessionCookieSuccessResponse, AuthenticateWithSessionCookieFailedResponse } from "@workos-inc/node";

// TODO: Organize DB and Drizzle code in a separate db file
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { eq } from 'drizzle-orm';

dotenv.config();

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

app.use(cors({
  origin: "https://memorylane.hmz.ngrok.io",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

const WORKOS_API_KEY = process.env.WORKOS_API_KEY;
const WORKOS_CLIENT_ID = process.env.WORKOS_CLIENT_ID;
const WORKOS_COOKIE_PASSWORD = process.env.WORKOS_COOKIE_PASSWORD;

if (!WORKOS_API_KEY || !WORKOS_CLIENT_ID) {
  throw new Error(
    "Missing required environment variables: WORKOS_API_KEY and WORKOS_CLIENT_ID"
  );
}

const workos = new WorkOS(WORKOS_API_KEY, {
  clientId: WORKOS_CLIENT_ID,
});

app.get("/login", (req: Request, res: Response) => {
  try {
    const authorizationUrl = workos.userManagement.getAuthorizationUrl({
      // Specify that we'd like AuthKit to handle the authentication flow
      provider: "authkit",

      // The callback endpoint that WorkOS will redirect to after a user authenticates
      redirectUri: "https://hmz.ngrok.io/auth/callback",
      clientId: WORKOS_CLIENT_ID,
    });

    // Redirect the user to the AuthKit sign-in page
    res.redirect(authorizationUrl);
  } catch (error) {
    console.error("Error generating authorization URL:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/auth/callback", async (req: Request, res: Response): Promise<void> => {
  // Retrieve the authorization code from query parameters
  const code = req.query.code as string;

  if (!code) {
    res.status(400).send("No code provided");
    return;
  }

  try {
    const authenticateResponse =
      await workos.userManagement.authenticateWithCode({
        clientId: process.env.WORKOS_CLIENT_ID || "",
        code,
        session: {
          sealSession: true,
          cookiePassword: process.env.WORKOS_COOKIE_PASSWORD,
        },
      });

    const { user, sealedSession } = authenticateResponse;

    // Store the session in a cookie
    res.cookie('wos-session', sealedSession, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });

    // Use the information in `user` for further business logic.
    console.log(user);

    // Redirect the user to the homepage
    return res.redirect('/');
  } catch (error) {
    return res.redirect('/login');
  }
});

// Auth middleware function
async function withAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = workos.userManagement.loadSealedSession({
      sessionData: req.cookies["wos-session"],
      cookiePassword: WORKOS_COOKIE_PASSWORD || "",
    });

    const result = await session.authenticate();

    // Check if authentication was successful
    if ("authenticated" in result && result.authenticated) {
      return next();
    }

    // If authentication failed, check the reason
    if ("reason" in result && result.reason === "no_session_cookie_provided") {
      return res.redirect("/login");
    }

    // If the session is invalid, attempt to refresh
    try {
      const refreshedResult = await session.refresh();

      // Check for `authenticated` in the refreshed result
      if ("authenticated" in refreshedResult && !refreshedResult.authenticated) {
        return res.redirect("/login");
      }

      // Update the cookie if `sealedSession` exists
      if ("sealedSession" in refreshedResult && refreshedResult.sealedSession) {
        res.cookie("wos-session", refreshedResult.sealedSession, {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "lax",
        });
        // Redirect to the same route to ensure the updated cookie is used
        return res.redirect(req.originalUrl);
      } else {
        console.error("No sealed session found in refreshed result.");
        return res.redirect("/login");
      }
    } catch (refreshError) {
      // Failed to refresh access token, redirect user to login page
      // after deleting the cookie
      console.error("Error during session refresh:", refreshError);
      res.clearCookie("wos-session");
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.redirect("/login");
    // res.status(500).send("Internal Server Error");

  }
}

// Logout endpoint
app.get("/logout", async (req: Request, res: Response): Promise<void> => {
  try {
    // Load the user's session
    const session = workos.userManagement.loadSealedSession({
      sessionData: req.cookies["wos-session"],
      cookiePassword: WORKOS_COOKIE_PASSWORD || "",
    });

    // Get the logout URL
    const url = await session.getLogoutUrl();

    // Clear the session cookie
    res.clearCookie("wos-session");

    // Redirect the user to the logout URL
    res.redirect(url);
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).send("Internal Server Error");
  }
});

async function getUserFromSession(req: Request) {
  try {
    const session = workos.userManagement.loadSealedSession({
      sessionData: req.cookies["wos-session"],
      cookiePassword: process.env.WORKOS_COOKIE_PASSWORD || "",
    });

    const authResponse: AuthenticateWithSessionCookieSuccessResponse | AuthenticateWithSessionCookieFailedResponse = await session.authenticate();

    if ("user" in authResponse) {
      return (authResponse.user);
    } else {
      return;
    }

  } catch (error) {
    console.error("Error getting the user from session: ", error);
  }
}

// API Endpoints

// Get all memories
app.get('/memories', withAuth, async (req: Request, res: Response) => {
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
