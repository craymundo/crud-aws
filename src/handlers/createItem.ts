import { connectDB } from "../services/dbService";
import { Item } from "../models/item.entity";
import { validatePayload } from "../services/validationService";
import { authorize } from "../middleware/authMiddleware";
import { setCache } from "../services/cacheService";

/**
 * Creates a new item.
 * @param event - The Lambda event object containing the request data.
 * @returns A response object with the status of the creation operation.
 */
export const createItem = async (event: any) => {
  try {

    await authorize(event);

    const { name, price } = JSON.parse(event.body);

    const validationErrors = validatePayload({ name, price }, [
      { field: "name", type: "string" },
      { field: "price", type: "number" },
    ]);

    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ errors: validationErrors }),
      };
    }

    const db = await connectDB();

    const item = new Item();
    item.name = name;
    item.price = price;

    const savedItem = await db.getRepository(Item).save(item);

    const createdItem = {
      id: savedItem.id,
      name: savedItem.name,
      price: savedItem.price,
    };

    await setCache("items_list_active", "", 0);

    return {
      statusCode: 201,
      body: createdItem,
    };
  } catch (error) {
    console.error("Error creating item:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error creating item" }),
    };
  }
};
