import Hapi from "@hapi/hapi";
import { getItems } from "./handlers/getItems";
import * as dotenv from "dotenv";
import { createItem } from "./handlers/createItem";
import { getItem } from "./handlers/getItem";
import { updateItem } from "./handlers/updateItem";
import { deleteItem } from "./handlers/deleteItem";
import { ping } from "./handlers/ping";
dotenv.config();

const getServer = () => {
  const server = Hapi.server({
    host: "localhost",
    port: 3000,
  });

  server.route([
    {
      method: "GET",
      path: "/ping",
      handler: async (request, h) => {
        const response = await ping({ headers: request.headers });
        return h.response(JSON.parse(response.body)).code(response.statusCode);
      },
    },
    {
      method: "GET",
      path: "/items",
      handler: async (request, h) => {
        const response = await getItems({ headers: request.headers });
        const responseBody =
          typeof response.body === "string"
            ? JSON.parse(response.body)
            : response.body;

        return h.response(responseBody).code(response.statusCode);
      },
    },
    {
      method: "POST",
      path: "/items",
      handler: async (request, h) => {
        const response = await createItem({
          body: JSON.stringify(request.payload),
          headers: request.headers,
        });
        const responseBody =
          typeof response.body === "string"
            ? JSON.parse(response.body)
            : response.body;
        return h.response(responseBody).code(response.statusCode);
      },
    },
    {
      method: "GET",
      path: "/items/{id}",
      handler: async (request, h) => {
        const response = await getItem({
          pathParameters: request.params,
          headers: request.headers,
        });
        return h.response(JSON.parse(response.body)).code(response.statusCode);
      },
    },
    {
      method: "PUT",
      path: "/items/{id}",
      handler: async (request, h) => {
        const response = await updateItem({
          pathParameters: { id: request.params.id },
          body: JSON.stringify(request.payload),
          headers: request.headers,
        });

        const responseBody =
          typeof response.body === "string"
            ? JSON.parse(response.body)
            : response.body;

        return h.response(responseBody).code(response.statusCode);
      },
    },
    {
      method: "DELETE",
      path: "/items/{id}",
      handler: async (request, h) => {
        const response = await deleteItem({
          pathParameters: { id: request.params.id },
          headers: request.headers,
        });
    
        return h.response().code(response.statusCode);
      },
    },
  ]);

  return server;
};

export const initializeServer = async () => {
  const server = getServer();
  await server.initialize();
  return server;
};

export const startServer = async () => {
  const server = getServer();
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
  return server;
};

if (require.main === module) {
  startServer();
}
