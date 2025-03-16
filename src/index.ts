import { app } from "@getcronit/pylon";
import { serve } from "@hono/node-server";
import { productGraphql } from "@/controller/products";

export const graphql = {
  Query: {
    // ...graphqlController.Query,
    // ...userController.Query,
    ...productGraphql.Query,
  },
  Mutation: {
    // ...graphqlController.Mutation,
    // ...userController.Mutation,
    ...productGraphql.Mutation,
  },
};

serve(app, (info) => {
  console.log(`Server running at ${info.port}`);
});

export type AppType = typeof app;

export default app;
