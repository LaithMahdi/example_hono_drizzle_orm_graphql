import { db } from "@/db";
import { products } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Price must be a number",
  }),
  isActive: z.boolean().optional().default(true),
});

export const productGraphql = {
  Query: {
    allProducts: async (
      page: number = 1,
      limit: number = 10,
      isActive?: boolean
    ) => {
      const offset = (page - 1) * limit;

      const query = db
        .select()
        .from(products)
        .where(
          isActive !== undefined ? eq(products.isActive, isActive) : undefined
        )
        .limit(limit)
        .offset(offset)
        .orderBy(desc(products.id));

      const allProducts = await query.execute();

      const totalCountQuery = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(
          isActive !== undefined ? eq(products.isActive, isActive) : undefined
        )
        .execute();

      const totalItems = Number(totalCountQuery[0].count);

      return {
        data: allProducts,
        totalItems,
        pageInfo: {
          hasPreviousPage: page > 1,
          hasNextPage: page * limit < totalItems,
        },
      };
    },
    productById: async (id: number) => {
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .execute();

      return product[0];
    },
  },
  Mutation: {
    createProduct: async (args: {
      input: z.infer<typeof createProductSchema>;
    }) => {
      const { input } = args;

      const validatedInput = createProductSchema.parse(input);

      const newProduct = await db
        .insert(products)
        .values({
          name: validatedInput.name,
          description: validatedInput.description,
          price: Number(validatedInput.price),
          isActive: validatedInput.isActive,
        })
        .returning();

      return newProduct[0];
    },
  },
};
