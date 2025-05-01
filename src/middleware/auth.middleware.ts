import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const user = await AuthService.getUserByToken(token);
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid Token" });
    }
}; 