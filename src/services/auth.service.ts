import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma";
import { verify } from "crypto";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export const AuthService = {
  async register(email: string, password: string, name: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    return this.generateToken(user.id);
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found");
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid password");
    const response = {
      user: {
        name: user.name
      },
      token: this.generateToken(user.id)
    };
    return response;
  },
  generateToken(userId: string) {
    return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "1h" });
  },
  verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as { sub: string };
  },
  async getUserByToken(token: string) {
    try {
      const decoded = this.verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      throw new Error("Invalid token");
    }
  },
  async logout() {
    // Since we're using JWT, there's no server-side token invalidation needed
    // The client should remove the token from local storage/cookies
    return { success: true, message: "Logged out successfully" };
  }
};

