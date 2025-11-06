import axios from "axios";

export const getRecipesByIngredients = async (req, res) => {
  try {
    const raw = req.query.ingredients || req.query.q || '';
    const numberParam = parseInt(req.query.number, 10);
    const apiKeyFromQuery = req.query.apiKey;
    const apiKey = apiKeyFromQuery || process.env.SPOON_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'SPOON_API_KEY not configured on the server and no apiKey provided in query' });
    }

    if (apiKeyFromQuery) {
      console.warn('Using SPOON API key provided via query parameter. Avoid sending secrets in URLs in production.');
    }

    if (!raw) {
      return res.status(400).json({ error: 'Missing `ingredients` query parameter. Example: ?ingredients=apples,flour,sugar' });
    }

    const ingredients = raw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .join(',');

    if (!ingredients) {
      return res.status(400).json({ error: 'No valid ingredients provided' });
    }

    const number = Number.isInteger(numberParam) && numberParam > 0 ? numberParam : 5;

    console.log('Making request to Spoonacular API with ingredients:', ingredients, 'number:', number);

    const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
      params: {
        ingredients,
        number,
        apiKey, 
      },
      headers: {
        'x-api-key': apiKey, 
      },
      timeout: 8000,
    });

    console.log('Spoonacular API response status:', response.status);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching recipes:', error?.message || error);

    if (error?.response?.data) {
      return res.status(error.response.status || 502).json({ error: error.response.data });
    }

    return res.status(500).json({ error: 'Failed to fetch recipes' });
  }
};