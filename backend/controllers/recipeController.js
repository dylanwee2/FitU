import axios from "axios";

export const getRecipesByIngredients = async (req, res) => {
  try {
    const raw = req.query.ingredients || req.query.q || '';
    const numberParam = parseInt(req.query.number, 10);
    // Allow apiKey to be passed in query for testing or override (not recommended for production)
    const apiKeyFromQuery = req.query.apiKey;
    const apiKey = apiKeyFromQuery || process.env.SPOON_API_KEY;

    // Env var / query key check
    if (!apiKey) {
      return res.status(500).json({ error: 'SPOON_API_KEY not configured on the server and no apiKey provided in query' });
    }

    if (apiKeyFromQuery) {
      console.warn('Using SPOON API key provided via query parameter. Avoid sending secrets in URLs in production.');
    }

    // Validate ingredients
    if (!raw) {
      return res.status(400).json({ error: 'Missing `ingredients` query parameter. Example: ?ingredients=apples,flour,sugar' });
    }

    // Trim and normalise ingredients list
    const ingredients = raw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .join(',');

    if (!ingredients) {
      return res.status(400).json({ error: 'No valid ingredients provided' });
    }

    const number = Number.isInteger(numberParam) && numberParam > 0 ? numberParam : 5;

    const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
      params: {
        ingredients,
        number,
        apiKey,
      },
      // Small timeout so the server doesn't hang indefinitely
      timeout: 8000,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching recipes:', error?.message || error);

    // Forward Spoonacular errors when available
    if (error?.response?.data) {
      return res.status(error.response.status || 502).json({ error: error.response.data });
    }

    return res.status(500).json({ error: 'Failed to fetch recipes' });
  }
};