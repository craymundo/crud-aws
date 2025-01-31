import { connectDB } from "../services/dbService";
import { authorize } from "../middleware/authMiddleware";
import { getCache, setCache } from "../services/cacheService";
import { Item } from "../models/item.entity";

/**
 * Retrieves an item by ID.
 * @param event - The Lambda event object containing the request data.
 * @returns A response object with the requested item's details or an error message.
 */
export const getItem = async (event: any) => {
  try {
    await authorize(event);

    const { id } = event.pathParameters;

    if (!id || isNaN(Number(id))) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          errors: [
            {
              field: "id",
              message: 'Field "id" is required and must be a valid number',
            },
          ],
        }),
      };
    }

    const itemId = Number(id);
    const cacheKey = `item_${itemId}`;

    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      const dataCache = JSON.parse(cachedData);
      return {
        statusCode: 200,
        body: dataCache,
      };
    }

    const db = await connectDB();
    const itemRepository = db.getRepository(Item);
    const item = await itemRepository.findOne({
      where: { id: itemId, isActive: true },
      select: ["id", "name", "price"],
    });

    if (!item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Item not found" }),
      };
    }
    const itemData = JSON.stringify(item);

    await setCache(cacheKey, JSON.stringify(item), 60);

    return {
      statusCode: 200,
      body: itemData,
    };
  } catch (error: any) {
    console.error("Error fetching item:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error fetching item",
        error: error.message,
      }),
    };
  }
};
