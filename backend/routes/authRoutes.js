import express from "express";
import passport from "../config/passportConfig.js";
import generateToken from "../utils/generateToken.js";

const router = express.Router();

const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://shape-up-app-henna.vercel.app"
    : "http://localhost:3000";

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/login?error=auth_failed`,
    session: false,
  }),
  (req, res) => {
    try {
      console.log("--- Google Callback: User authenticated ---", req.user?._id?.toString());
      generateToken(res, req.user._id, false);
      console.log("--- Google Callback: Token set, redirecting to frontend ---");
      return res.redirect(`${FRONTEND_URL}/`);
    } catch (error) {
      console.error("--- Google Callback CRASH ---", error);
      return res.redirect(`${FRONTEND_URL}/login?error=server_error`);
    }
  }
);

export default router;
