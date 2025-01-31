import { validateToken } from "../services/authService";

export const authorize = async (event: any) => {
  if (process.env.NODE_ENV === "test") {
    console.log("Skipping authorization in test environment");
    return;
  }

  const authHeader = event.headers["authorization"] || event.headers["Authorization"];
  const token = authHeader.split(" ")[1];

  if (!token) {
    throw {
      statusCode: 401,
      message: "Unauthorized: No token provided",
    };
  }

  try {
    await validateToken(token);
  } catch (error) {
    throw {
      statusCode: 401,
      message: "Unauthorized: Invalid token",
    };
  }
};
