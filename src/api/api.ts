import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import csrf from "csurf";
import { Memory, User } from "./types";

import { WorkOS, AuthenticateWithSessionCookieSuccessResponse, AuthenticateWithSessionCookieFailedResponse } from "@workos-inc/node";

// TODO: Organize DB and Drizzle code in a separate db file
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { eq, and, desc } from 'drizzle-orm';

import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const memories = pgTable("memories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  author: text('author').references(() => users.id, {onDelete: 'cascade'}).notNull(),
});

const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  profilePictureUrl: text("profilePictureUrl"),
  bio: text("bio"),
});

// Initialize Drizzle with PostgreSQL adapter
const db = drizzle("postgresql://memory-lane_owner:" + process.env.NEON_SECRET + "@ep-dry-thunder-a5c84sxk.us-east-2.aws.neon.tech/memory-lane?sslmode=require");

const app: Express = express();
const port = 4001;

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  },
});

app.use(cors({
  origin: process.env.APP_BASE_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(csrfProtection);

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
      redirectUri: `${process.env.VITE_API_BASE_URL}/auth/callback`,
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
    console.log(user);

    // Store the session in a cookie
    res.cookie('wos-session', sealedSession, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });

    // Use the information in `user` for further business logic.
    // console.log(user);

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

app.get("/csrf-token", (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken() });
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

async function addUser(user: User) {
  try {
    if (user) {
      await db.insert(users).values({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePictureUrl: user.profilePictureUrl,
      });
    }
  } catch (err) {
    console.error("Error: ", (err as Error).message);
  }
}

async function userIsMemoryCreator(userId: string, memoryId: number): Promise<boolean> {
  try {
    const userMemory = await db.select().from(memories).where(and(eq(memories.author, userId), eq(memories.id, memoryId))).limit(1);
    if (userMemory.length == 0) {
      return false;
    } else {
      return true;
    }
  } catch (err) {
    console.error("Error: ", (err as Error).message);
    return false;
  }
}

async function getMemories(userId?: string) {
  try {
    const rawMemories = await db.select().from(memories).where(userId ? eq(memories.author, userId) : undefined).orderBy(desc(memories.timestamp));
    const allMemories = rawMemories.map((memory) => ({
      ...memory,
      timestamp: Math.floor(new Date(memory.timestamp).getTime() / 1000),
    }));
    const allMemoriesWithUserInfo = await Promise.all(
      allMemories.map(async (memory) => {
        const [user] = await db.select({ firstName: users.firstName , lastName: users.lastName, profilePictureUrl: users.profilePictureUrl }).from(users).where(eq(users.id, memory.author));
        return {
          ...memory,
          user,
        };
      })
    );
    return { memories: allMemoriesWithUserInfo };
  } catch (err) {
    console.error("Error: ", (err as Error).message);
    return false;
  }
}

// API Endpoints

// Get all memories
app.get('/memories', async (req: Request, res: Response) => {
  try {
    const memories = await getMemories();
    res.json(memories);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Create a new memory
app.post('/memories', withAuth, async (req: Request, res: Response) => {
  const { name, description, timestamp } = req.body as Memory;

  if (!name || !description || !timestamp) {
    res.status(400).json({
      error: 'Please provide all fields: name, description, timestamp',
    });
    return;
  }

  try {
    const user = await getUserFromSession(req);

    if (!user) {
      res.status(403).json({ error: "User is not authenticated!" });
    } else {
      const existingUsers = await db.select().from(users).where(eq(users.id, user.id));
      if (existingUsers.length == 0) {
        await addUser(user);
      }
      const newMemory = await db.insert(memories).values({
        name,
        description,
        timestamp: new Date(timestamp * 1000),
        author: user.id,
      }).returning({ insertedId: memories.id });
      const memory: Memory = {
        id: newMemory[0].insertedId,
        name: name,
        description: description,
        timestamp: timestamp,
        author: user.id,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePictureUrl: user.profilePictureUrl
        }
      }
      res.status(201).json(memory);
    }
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Get a user's memories by User ID
app.get('/users/:uid/memories', async (req: Request, res: Response) => {
  const { uid } = req.params;
  try {
    const memories = await getMemories(uid);
    // console.log(memories);
    res.json(memories);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/upload', withAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const name = req.body.memoryId;
    // console.log(file);
    if (!file || !name) {
      res.status(400).json({ error: 'No file uploaded or no memoryId provided' });
      return;
    }

    const user = await getUserFromSession(req);

    // Upload to Cloudinary
    cloudinary.uploader.upload_stream(
      {
        folder: user?.id || "default",
        public_id: name,
      },
      (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        res.json({ url: "https://res.cloudinary.com/memory-lane/image/upload/" + result?.public_id });
      }
    ).end(file.buffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Get a user's info
app.get('/users/:uid', async (req: Request, res: Response) => {
  const { uid } = req.params;
  try {
    const user = await db.select().from(users).where(eq(users.id, uid));
    if (user.length == 0) {
      res.status(404).json({ error: "User not found" });
    }
    res.json({ user: user[0] });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Get a memory by ID
app.get('/memories/:id', withAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const memory = await db.select().from(memories).where(eq(memories.id, Number(id)));
    if (!memory) {
      res.status(404).json({ error: "Memory not found" });
    }
    res.json({ memory });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Update a memory by ID
app.put('/memories/:id', withAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, timestamp } = req.body as Memory;

    if (!name || !description || !timestamp) {
      res.status(400).json({
        error: 'Please provide all fields: name, description, timestamp',
      });
      return;
    }

    const user = await getUserFromSession(req);

    if (user) {
      if (await userIsMemoryCreator(user.id, Number(id))) {
        await db
          .update(memories)
          .set({
            name,
            description,
            timestamp: new Date(timestamp * 1000),
          })
          .where(eq(memories.id, Number(id)));
        res.json({ message: "Memory updated successfully" });
      } else {
        res.status(401).json({ error: "Unauthorized!" });
      }
    }

  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Delete a memory by ID
app.delete('/memories/:id', withAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await getUserFromSession(req);

    if (user) {
      if (await userIsMemoryCreator(user.id, Number(id))) {
        await db.delete(memories).where(eq(memories.id, Number(id)));
        res.json({ message: "Memory deleted successfully" });
      } else {
        res.status(401).json({ error: "Unauthorized!" });
      }
    }
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Update a user's bio
app.put('/users', withAuth, async (req: Request, res: Response) => {
  try {
    const { bio } = req.body;

    if (!bio) {
      res.status(400).json({
        error: 'Please provide the bio',
      });
      return;
    }

    const user = await getUserFromSession(req);

    if (user) {
      await db
        .update(users)
        .set({
          bio: bio,
        })
        .where(eq(users.id, user.id));
      res.json({ message: "Bio updated successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Check if the user is authenticated
app.get('/whoami', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromSession(req);
    if (user) {
      res.json({ userId: user?.id });
    } else {
      res.json({});
    }
    // res.json({ userId: user?.id });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app. get('/', function (req, res) {
	res.redirect(process.env.APP_BASE_URL || "");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
