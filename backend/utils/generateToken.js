import jwt from "jsonwebtoken";

const generateToken = (res, userId, rememberMe = false) => {
  const maxAge = rememberMe
    ? 30 * 24 * 60 * 60 * 1000
    : 24 * 60 * 60 * 1000;
  const expiresIn = rememberMe ? "30d" : "1d";

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge,
  });
};

export default generateToken;
