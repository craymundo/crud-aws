import { connectDB } from "../services/dbService";
import { authorize } from "../middleware/authMiddleware";
import { setCache } from "../services/cacheService";
import { validatePayload } from "../services/validationService";
import { Item } from "../models/item.entity";

/**
 * Updates an existing item by ID.
 * @param event - The Lambda event object containing the request data.
 * @returns A response object with the status of the update operation.
 */
export const updateItem = async (event: any) => {
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

    const { name, price } = JSON.parse(event.body);

    const validationErrors = validatePayload({ name, price }, [
      { field: "name", type: "string" },
      { field: "price", type: "number", allowNull: true },
    ]);

    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ errors: validationErrors }),
      };
    }

    const db = await connectDB();
    const itemRepository = db.getRepository(Item);

    const item = await itemRepository.findOne({ where: { id: itemId } });
    if (!item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Item not found" }),
      };
    }

    item.name = name;
    if (price !== undefined) {
      item.price = price;
    }

    const updatedItem = await itemRepository.save(item);

    await setCache("items_list", "", 0);
    await setCache(cacheKeyItem, "", 0);

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: updatedItem.id,
        name: updatedItem.name,
        price: updatedItem.price,
      }),
    };
  } catch (error) {
    console.error("Error updating item:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error updating item", error: error }),
    };
  }
};
