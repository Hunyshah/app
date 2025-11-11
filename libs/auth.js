import jwt from "jsonwebtoken";

import User from "@/models/user";

const JWT_SECRET = process.env.JWT_SECRET || "1wqsadcfvghuji9o0p;l,kjmnhg34rtghnjm,.";

const extractToken = (request) => {
  const headerAuth = request.headers.get("authorization") || request.headers.get("Authorization");
  const headerX = request.headers.get("x-auth-token") || request.headers.get("X-Auth-Token");
  let token = null;

  if (headerAuth && headerAuth.startsWith("Bearer ")) {
    token = headerAuth.slice(7);
  } else if (headerX) {
    token = headerX;
  }

  return token;
};

export const authenticateRequest = async (request) => {
  try {
    const token = extractToken(request);

    if (!token) {
      return { ok: false, status: 401, message: "Unauthorized: token missing" };
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded?.id).lean();

    if (!user) {
      return { ok: false, status: 401, message: "Unauthorized: invalid user" };
    }

    return { ok: true, user: { id: user._id, name: user.name, email: user.email } };
  } catch (error) {
    return { ok: false, status: 401, message: "Unauthorized: invalid token", error: error.message };
  }
};