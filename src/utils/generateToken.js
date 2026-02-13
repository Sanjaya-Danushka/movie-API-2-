import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const payload = { id: userId };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  const cookieDays = Number(process.env.JWT_COOKIE_EXPIRES_IN) || 7;

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: cookieDays * 24 * 60 * 60 * 1000,
  });

  return token;
};
