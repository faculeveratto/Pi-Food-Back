require('dotenv').config();
const axios= require("axios");
const {YOUR_API_KEY} = process.env
const {Type, Recipe} = require('../db');




//me traigo todas las recetas de la api
async function getAllRecipes(){
     try {
         let recetas= (await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${YOUR_API_KEY}&addRecipeInformation=true&number=100`)).data.results
         const dataRecetas = await recetas.map (e => {
             return {
                id: e.id,
                name: e.title,
                image: e.image,
                types: e.diets.map(e=>e).join(", "), // tipo de dieta
                healthScore: e.healthScore, 
                dishTypes: e.dishTypes.join(", ") //tipo de plato
             }
         })
         return dataRecetas
     } catch (error) {
         console.log(error)

     }
}

const bdFood = async () => {
    return await Recipe.findAll({
        include:{
            model:Type,
            attributes: ['name'],
            through: {
                attributes: []
            }
        }
    })
}

const AllFood = async () => {
    const api = await getAllRecipes ();
    const bd = await bdFood ();
    
    return api.concat(bd)
}

async function getName (req, res){
        const name = req.query.name
        let foods = await AllFood();
        if (name){
            let recipeName = await foods.filter(e => e.name.toLowerCase().includes(name.toLowerCase()))
            recipeName.length ?
            res.status(200).send(recipeName):
            res.status(404).send('Not Found')
        }else{
            res.status(200).send(foods)
        }
}

async function getId (req, res){
    let {id} = req.params;
    try{
        if(id.includes('-')){
            const recipeDb = await Recipe.findByPk(id, {
                include : {
                    model: Type,
                    attributes: ['name'],
                    through: {
                        attributes: []
                    }
        }
    });
    return recipeDb? res.status(200).json(recipeDb) : res.status(400).send('Not Found');
        }else{
            let recipeApi;
            
            try{
            const {data} = await axios.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${YOUR_API_KEY}`)
                recipeApi = {
                    name: data.title, // nombre
                    id: data.id,
                    summary:data.summary, //resumen del plato
                    image : data.image, // imagen
                    healthScore:data.healthScore, //nivel de comida saludable
                    steps: data.analyzedInstructions.length? data.analyzedInstructions[0].steps.map(e=> e.step) : "Sin Pasos", //paso a paso
                    types: data.diets.map(e=>e), //tipo de dieta
                    dishTypes: data.dishTypes //tipo de plato
                };
        }
        catch (err) {
            console.error(err)
        }
        return recipeApi? res.status(200).json(recipeApi) : res.status(400).send('Not Found');
    }
    }
    catch (err){
        console.log(err);
    }
}

//crea una receta
async function postRecipe (req, res){
    let {name, summary, healthScore, steps, types, image, dishTypes} = req.body
    try {
        let newRecipe = await Recipe.create({
            name,
            summary,
            healthScore,
            steps,
            image,
            dishTypes
        });
        await Promise.all(types.map(async e =>{
            await newRecipe.addType([  // es tabla de relaciones belongsToMany
                  (await Type.findOrCreate({
                    where : {
                      name : e
                    }
                   }))[0].dataValues.id
                ])
              }))
              const relacionTablas = await Recipe.findOne({
                  where: {
                    name : name
                  }
                  ,
                  include: {
                    model : Type,
                    attributes : ["name"],
                    through : {
                      attributes : []
                    }
                  }
                })
                console.log(relacionTablas)
                res.json({info:"Successfully created recipe"})
              return relacionTablas
    }
    catch (e) {
                 res.status(404).json({ msg: "Error", error: e.message });
 }
}

const deleteRecipe =async(id)=>{
 
    await Recipe.destroy({
                   where: { id: id }
               });
    }

async function recipe (req, res){
    const lele = getAllRecipes()
    console.log(lele)
    res.send
}
   

module.exports = {
AllFood, getId, getName, postRecipe, getAllRecipes, deleteRecipe,
}