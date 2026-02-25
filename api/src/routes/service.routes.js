import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({ message: "List services" });
});

router.get("/:id", (req, res) => {
  res.status(200).json({ message: "Get service", id: req.params.id });
});

router.post("/", (req, res) => {
  res.status(201).json({ message: "Create service", data: req.body });
});

router.put("/:id", (req, res) => {
  res.status(200).json({ message: "Update service", id: req.params.id, data: req.body });
});

router.delete("/:id", (req, res) => {
  res.status(200).json({ message: "Delete service", id: req.params.id });
});

export default router;
