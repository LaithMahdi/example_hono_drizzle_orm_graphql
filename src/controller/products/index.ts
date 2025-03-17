import { z } from "zod";
import { db } from "@/db";
import { products } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { Float, ID } from "@getcronit/pylon";

type Product = {
  id: ID;
  name: string;
  description: string;
  price: Float;
  isActive: boolean;
};

type CreateProductInput = Omit<Product, "id">;
type UpdateProductInput = Partial<Omit<Product, "id">> & { id: ID };

// Validation Schema for Product Creation
const createProductSchema = z.object({
  name: z.string().min(1, "Name cannot be empty"),
  description: z.string().min(1, "Description cannot be empty"),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  isActive: z.boolean(),
});

// Validation Schema for Product Update
const updateProductSchema = createProductSchema.partial().extend({
  id: z.number().positive("Invalid product ID"),
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
    createProduct: async (input: CreateProductInput) => {
      const parsedInput = createProductSchema.safeParse(input);
      if (!parsedInput.success) {
        throw new Error(
          parsedInput.error.errors.map((e) => e.message).join(", ")
        );
      }

      const newProduct = await db
        .insert(products)
        .values(parsedInput.data)
        .returning();
      return newProduct[0];
    },
    updateProduct: async (input: UpdateProductInput) => {
      const parsedInput = updateProductSchema.safeParse(input);
      if (!parsedInput.success) {
        throw new Error(
          parsedInput.error.errors.map((e) => e.message).join(", ")
        );
      }
      const updatedProduct = await db
        .update(products)
        .set(parsedInput.data)
        .where(eq(products.id, Number(input.id)))
        .returning();

      return updatedProduct[0];
    },
  },
};
