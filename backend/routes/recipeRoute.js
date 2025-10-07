import express from "express";
import { getRecipesByIngredients } from "../controllers/recipeController.js";

const router = express.Router();

router.get("/", getRecipesByIngredients);

export default router;