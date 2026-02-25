import { Router } from "express";
import {
  createContactMessage,
  createServiceEnquiry,
  deleteContactMessage,
  deleteServiceEnquiry,
  getContactMessages,
  getServiceEnquiries,
  updateContactMessageStatus,
} from "../controllers/enquiry.controller.js";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({ message: "List enquiries" });
});

router.get("/service", getServiceEnquiries);
router.post("/service", createServiceEnquiry);
router.delete("/service/:id", deleteServiceEnquiry);
router.get("/message", getContactMessages);
router.post("/message", createContactMessage);
router.put("/message/:id", updateContactMessageStatus);
router.delete("/message/:id", deleteContactMessage);

router.get("/:id", (req, res) => {
  res.status(200).json({ message: "Get enquiry", id: req.params.id });
});

router.post("/", (req, res) => {
  res.status(201).json({ message: "Create enquiry", data: req.body });
});

router.put("/:id", (req, res) => {
  res.status(200).json({ message: "Update enquiry", id: req.params.id, data: req.body });
});

router.delete("/:id", (req, res) => {
  res.status(200).json({ message: "Delete enquiry", id: req.params.id });
});

export default router;
