import { connectDB } from "../services/dbService";
import { authorize } from "../middleware/authMiddleware";
import { Item } from "../models/item.entity";
import { setCache } from "../services/cacheService";

/**
 * Soft deletes an existing item by ID (marks it as inactive).
 * @param event - The Lambda event object containing the request data.
 * @returns A response object with the status of the deletion operation.
 */
export const deleteItem = async (event: any) => {
  try {

    await authorize(event);

    const { id } = event.pathParameters;
    if (!id || isNaN(Number(id))) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          errors: [{ field: "id", message: 'Field "id" is required and must be a valid number' }],
        }),
      };
    }

    const itemId = Number(id);
    const cacheKeyItem = `item_${itemId}`;

    const db = await connectDB();
    const itemRepository = db.getRepository(Item);

    const item = await itemRepository.findOne({ where: { id: itemId, isActive: true } });
    if (!item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Item not found" }),
      };
    }

    item.isActive = false;
    item.updatedAt = new Date();
    await itemRepository.save(item);

    await setCache("items_list", "", 0);
    await setCache(cacheKeyItem, "", 0);

    return {
      statusCode: 204,
      body: null,
    };
  } catch (error) {
    console.error("Error deleting item:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error deleting item", error: error }),
    };
  }
};
