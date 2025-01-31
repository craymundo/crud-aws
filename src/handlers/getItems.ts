import { connectDB } from "../services/dbService";
import { getCache, setCache } from "../services/cacheService";
import { Item } from "../models/item.entity";
import { authorize } from "../middleware/authMiddleware";

/**
 * Retrieves an items.
 * @param event - The Lambda event object containing the request data.
 * @returns A response object with the requested item's or an error message.
 */
export const getItems = async (event: any) => {
  const cacheKey = "items_list_active";

  try {
    await authorize(event);

    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      const dataCache = JSON.parse(cachedData);
      return {
        statusCode: 200,
        body: dataCache,
      };
    }

    const db = await connectDB();
    const items = await db.getRepository(Item).find({
      where: { isActive: true },
      select: ["id", "name", "price"],
    });
    if (items.length > 0) {
      await setCache(cacheKey, JSON.stringify(items), 60);
    }

    return {
      statusCode: 200,
      body: items,
    };
  } catch (error: any) {
    console.error("Error fetching items:", error);
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        message: error.message || "Error fetching items",
        error,
      }),
    };
  }
};
