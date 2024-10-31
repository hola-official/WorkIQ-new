const express = require("express");
const {
  createOrder,
  submitRequirements,
  getOrderById,
  getOrdersByClient,
  submitOrderCompletion,
  approveOrderDelivery,
  cancelOrder,
} = require("../controllers/order.managementContoller");
const verifyJWT = require("../middleware/verifyJWT");

const router = express.Router();

router.post("/create-order/:sectionId", verifyJWT, createOrder);
router.post("/requirement", verifyJWT, submitRequirements);
router.get("/track/:orderId", verifyJWT, getOrderById);
router.get("/get-all-orders", verifyJWT, getOrdersByClient);
router.put("/:orderId/approve", verifyJWT, approveOrderDelivery);
router.put("/:orderId/deliver", verifyJWT, submitOrderCompletion);
router.put('/cancel/:orderId', verifyJWT, cancelOrder);

module.exports = router;
