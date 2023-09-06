import express from "express";
import AppController from "../controllers/AppController";
import UsersController from "../controllers/UsersController";
import AuthController from "../controllers/AuthController";
import FilesController from '../controllers/FilesController';
import { AuthMiddleware } from '../auth';

const router = express.Router();

// Define endpoints
router.get("/status", AppController.getStatus);
router.get("/stats", AppController.getStats);
router.post("/users", UsersController.postNew);

router.get("/connect", AuthController.getConnect);
router.get("/disconnect", AuthController.getDisconnect);
router.get("/users/me", UsersController.getMe);

router.post('/files', AuthMiddleware, FilesController.postUpload);

export default router;
