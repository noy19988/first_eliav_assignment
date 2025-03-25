import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = "https://api.spoonacular.com/recipes";

interface Recipe {
    id: number;
    title: string;
    image: string;
}

interface RecipeDetails {
    id: number;
    title: string;
    image: string;
    readyInMinutes: number;
    servings: number;
    summary: string;
    instructions: string;
    extendedIngredients: { name: string; amount: number; unit: string }[];
    nutrition: { nutrients: { name: string; amount: number; unit: string }[] } | null; 
}

interface RecipeApiResponse {
    results: Recipe[];
}

interface RecipeDetailsResponse extends RecipeDetails {}


export const fetchRecipesFromAPI = async (query: string): Promise<Recipe[]> => {
    if (!API_KEY) {
        throw new Error("Spoonacular API Key is missing. Please set SPOONACULAR_API_KEY in your .env file.");
    }

    try {
        const response = await axios.get<RecipeApiResponse>(`${BASE_URL}/complexSearch`, {
            params: {
                query,
                number: 10,
                apiKey: API_KEY,
            },
        });

        return response.data.results.map((recipe) => ({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
        }));
    } catch (error) {
        console.error("Error fetching recipes from Spoonacular API:", error);
        throw new Error("Failed to fetch recipes.");
    }
};


export const fetchRecipeDetailsFromAPI = async (recipeId: number): Promise<RecipeDetails> => {
    if (!API_KEY) {
        throw new Error("Spoonacular API Key is missing. Please set SPOONACULAR_API_KEY in your .env file.");
    }

    try {
        const response = await axios.get<RecipeDetailsResponse>(`${BASE_URL}/${recipeId}/information`, {
            params: { apiKey: API_KEY },
        });

        const data = response.data;

        return {
            id: data.id,
            title: data.title,
            image: data.image,
            readyInMinutes: data.readyInMinutes,
            servings: data.servings,
            summary: data.summary,
            instructions: data.instructions,
            extendedIngredients: data.extendedIngredients.map((ing) => ({
                name: ing.name,
                amount: ing.amount,
                unit: ing.unit,
            })),
            nutrition: data.nutrition || null,
        };
    } catch (error) {
        console.error("Error fetching recipe details from Spoonacular API:", error);
        throw new Error("Failed to fetch recipe details.");
    }
};
