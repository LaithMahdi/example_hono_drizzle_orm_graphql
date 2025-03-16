export const graphqlController = {
  Query: {
    all: () => {
      return [
        { id: 1, name: "Product 1", price: 100 },
        { id: 2, name: "Product 2", price: 200 },
        { id: 3, name: "Product 3", price: 300 },
      ];
    },
    productById: (id: number) => {
      return { id, name: `Product ${id}`, price: id * 100 };
    },
  },
  Mutation: {},
};
