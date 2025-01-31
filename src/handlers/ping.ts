import { connectDB } from "../services/dbService";
import { getCache, setCache } from "../services/cacheService";

/**
 * Health Check API - Validates DB and Redis connections.
 * @param event - The Lambda event object.
 * @returns A response object with the health status.
 */
export const ping = async (event: any) => {
  try {

    const db = await connectDB();
    await db.query("SELECT 1");

    if (process.env.NODE_ENV !== "test") {
      const cacheKey = "ping_test";
      await setCache(cacheKey, "OK", 10);
      const cacheTest = await getCache(cacheKey);
  
      if (cacheTest !== "OK") {
        throw new Error("Redis test failed: No response from cache");
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true
      }),
    };
  } catch (error: any) {
    console.error("Health check failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Service is unhealthy",
        error: error.message || "Unknown error",
      }),
    };
  }
};
