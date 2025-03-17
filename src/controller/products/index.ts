import { db } from "@/db";
import { products } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { ID, Float } from "@getcronit/pylon";

type Product = {
  id: ID;
  name: string;
  description: string;
  price: Float;
  isActive: boolean;
};

type CreateProductInput = Omit<Product, "id">;
type UpdateProductInput = Partial<Omit<Product, "id">> & { id: ID };

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
    createProduct: async (input: CreateProductInput) => {
      const newProduct = await db
        .insert(products)
        .values({
          name: input.name,
          description: input.description,
          price: input.price,
          isActive: input.isActive,
        })
        .returning();

      return newProduct[0];
    },
    updateProduct: async (input: UpdateProductInput) => {
      const updatedProduct = await db
        .update(products)
        .set({
          name: input.name,
          description: input.description,
          price: input.price,
          isActive: input.isActive,
        })
        .where(eq(products.id, Number(input.id)))
        .returning();

      return updatedProduct[0];
    },
  },
};
