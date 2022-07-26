const axios= require("axios")
const {Type} = require ("../db")
const {YOUR_API_KEY} = process.env



async function getDiets (req, res){
    try{
        const dietsAPI = (await axios.get(`https://api.spoonacular.com/recipes/complexSearch?apiKey=${YOUR_API_KEY}&addRecipeInformation=true&number=100`)).data.results
       const dataType = dietsAPI.map(e => e.diets).join().split(',').filter(e => e.length);
       dataType.forEach(e => {
            Type.findOrCreate({
              where: { name: e }
            })
        })
        const typeDB = await Type.findAll()
        res.send(typeDB)
    } catch (error) {
        res.status(404).json({ 
        error })
    }
}
module.exports = {
getDiets
}