const { Router } = require('express');
//const recipeRoutes= require("./recipeRoutes")
const {getId, getName, postRecipe, deleteRecipe, } = require ("../controllers/recipeControllers")
const {getDiets} = require ("../controllers/typesControllers")
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');


 const router = Router();


router.get('/recipes', getName)
router.get("/recipes/:id", getId)
router.get("/types", getDiets)
router.post("/recipes", postRecipe)



module.exports= router;
