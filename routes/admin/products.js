const express = require("express");
const multer = require("multer");
const memory = require("multer/storage/memory");

const { handleErrors, requireAuth } = require("./middlewares");
const productRepo = require("../../repositories/products");
const productNewTemplate = require("../../views/admin/products/newProduct");
const productsIndexTemplate = require("../../views/admin/products/index");
const productEditTemplate = require("../../views/admin/products/edit");
const { requireTitle, requirePrice } = require("./validator");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/admin/products", requireAuth, async (req, res) => {
  const products = await productRepo.getAll();
  res.send(productsIndexTemplate({ products }));
});
router.get("/admin/products/new", requireAuth, (req, res) => {
  res.send(productNewTemplate({}));
});
router.post(
  "/admin/products/new",
  requireAuth,
  upload.single("image"),
  [requireTitle, requirePrice],
  handleErrors(productNewTemplate),
  async (req, res) => {
    const image = req.file.buffer.toString("base64");
    const { title, price } = req.body;
    await productRepo.create({ title, price, image });
    res.redirect("/admin/products");
  }
);
router.get("/admin/products/:id/edit", requireAuth, async (req, res) => {
  const product = await productRepo.getOne(req.params.id);
  if (!product) {
    res.send("Product not found");
  }
  res.send(productEditTemplate({ product }));
});
router.post(
  "/admin/products/:id/edit",
  requireAuth,
  upload.single("image"),

  [(requireTitle, requirePrice)],

  handleErrors(productEditTemplate, async (req) => {
    const product = await productRepo.getOne(req.params.id);

    return { product };
  }),
  async (req, res) => {
    const changes = req.body;

    if (req.file) {
      changes.image = req.file.buffer.toString("base64");
    }

    try {
      await productRepo.update(req.params.id, changes);
    } catch (err) {
      return res.send("Could not find item");
    }
    res.redirect("/admin/products");
  }
);
router.post("/admin/products/:id/delete", requireAuth, async (req, res) => {
  console.log(req.params.id);
  await productRepo.delete(req.params.id);
  res.redirect("/admin/products");
});
module.exports = router;
