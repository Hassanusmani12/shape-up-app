import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";

const callbackURL =
  process.env.NODE_ENV === "production"
    ? "https://shape-up-app-henna.vercel.app/auth/google/callback"
    : "http://localhost:5000/auth/google/callback";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL,
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("--- Google Auth Step 1: Profile Received ---", profile?.emails?.[0]?.value);

        const email = profile.emails?.[0]?.value;
        if (!email) {
          console.error("--- Google Auth FAIL: No email ---");
          return done(new Error("No email returned from Google"), null);
        }

        console.log("--- Google Auth Step 2: Checking DB ---");
        let user = await User.findOne({ email });

        if (!user) {
          console.log("--- Google Auth: Creating new user for ---", email);
          const randomPassword = crypto.randomBytes(32).toString("hex");
          user = await User.create({
            name: profile.displayName,
            email,
            password: randomPassword,
            image: profile.photos?.[0]?.value || undefined,
          });
          console.log("--- Google Auth: User created with ID ---", user._id.toString());
        } else {
          console.log("--- Google Auth: Existing user found ---", user._id.toString());
        }

        console.log("--- Google Auth Step 3: Success, calling done() ---");
        return done(null, user);
      } catch (error) {
        console.error("--- Google Auth CRASH ---", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
