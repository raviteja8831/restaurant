export const ORDER_API = {
  CREATE_ORDER: "/orders/create", // POST
  DELETE_ORDER: "/orders/delete", // DELETE
  UPDATE_ORDER: "/orders/:orderId", // PUT
  DELETE_ORDER_ITEMS: "/orders/delete/items", // POST
  // GET_PENDING_ORDERS: (restaurantId: number, userId: number) =>
  //   `/orders/pending/${restaurantId}/${userId}`, // GET
};
