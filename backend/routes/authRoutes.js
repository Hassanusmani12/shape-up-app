import express from "express";
import passport from "../config/passportConfig.js";
import generateToken from "../utils/generateToken.js";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://localhost:3000/login?error=auth_failed",
    session: false,
  }),
  (req, res) => {
    try {
      console.log("--- Google Callback: User authenticated ---", req.user?._id?.toString());
      generateToken(res, req.user._id, false);
      console.log("--- Google Callback: Token set, redirecting to frontend ---");
      return res.redirect("https://localhost:3000/");
    } catch (error) {
      console.error("--- Google Callback CRASH ---", error);
      return res.redirect("https://localhost:3000/login?error=server_error");
    }
  }
);

export default router;
