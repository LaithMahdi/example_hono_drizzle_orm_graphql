export const userController = {
  Query: {
    allUsers: () => {
      return [
        { id: 1, name: "Alice", email: "alice@example.com" },
        { id: 2, name: "Bob", email: "bob@example.com" },
      ];
    },
    userById: (id: number) => {
      return { id, name: `User ${id}`, email: `user${id}@example.com` };
    },
  },
  Mutation: {
    createUser: (name: string, email: string) => {
      return { id: Date.now(), name, email };
    },
  },
};
