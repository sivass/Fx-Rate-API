import { Router } from "express";
import { AuthService } from "../services/auth.service";

const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  try {
    const token = await AuthService.register(
      req.body.email,
      req.body.password,
      req.body.name
    );
    res.cookie("jwt", token, { httpOnly: true, secure: true });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(400).json({ message: errorMessage });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const result = await AuthService.login(req.body.email, req.body.password);
    res.cookie("jwt", result.token, { httpOnly: true, secure: true });
    res.json({
      success: true,
      message: "User logged in successfully",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(400).json({ message: errorMessage });
  }
});
authRouter.get("/me", async (req, res) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("No token provided");

    const result = await AuthService.getUserByToken(token);
    res.json({ success: true, data: result });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(400).json({ message: errorMessage });
  }
});
authRouter.post("/logout", async (req, res) => {
  try {
    const result = await AuthService.logout();
    res.clearCookie("jwt", { httpOnly: true, secure: true });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    res.status(400).json({ message: errorMessage });
  }
});
export default authRouter;
