import { ProductCollection } from "../libs/enums/product.enum";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";

import { T } from "../libs/types/common";
import ProductService from "../models/Product.servis";
import { ProductInput, ProductInquery } from "../libs/types/product";
import { AdminRequest, ExtendedRequest } from "../libs/types/members";
const productService = new ProductService();
const productController: T = {};

/** SPA */
productController.getProducts = async (req: Request, res: Response) => {
  try {
    console.log("getProducts");
    const {
      page,
      limit,
      order,
      productCollection: productCollection,
      search,
    } = req.query;
    const inquiry: ProductInquery = {
      order: String(order),
      page: Number(page),
      limit: Number(limit),
    };
    if (productCollection) {
      inquiry.productCollection = productCollection as ProductCollection;
    }
    if (search) inquiry.search = String(search);

    const result = await productService.getProducts(inquiry);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProducts", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.getProduct = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getProduct");

    const { id } = req.params;
    console.log("req.memeber:", req.member);
    const memberId = req.member?._id
      ? shapeIntoMongooseObjectId(req.member._id)
      : null;
    const result = await productService.getProduct(memberId, id);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProduct", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

/** SSR */

productController.getAllProducts = async (req: Request, res: Response) => {
  try {
    console.log("getAllProducts");
    const data = await productService.getAllProducts();
    res.render("products", { products: data });
  } catch (err) {
    console.log("Error, getAllProducts", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.createNewProduct = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("createNewProduct");
    console.log("req.body:", req.body);

    if (!req.files?.length)
      throw new Errors(HttpCode.INTERNAL_SERVICE_ERROR, Message.CREATE_FAILED);

    const data: ProductInput = req.body;
    data.productImages = req.files?.map((ele) => {
      return ele.path.replace(/\\/g, "/");
    });

    console.log("rasm", data);
    await productService.createNewProduct(data);
    console.log("productCollection:", data.productCollection);
    res.send(
      `Hi <script> alert(" Sucessful creation"); window .location.replace('/admin/product/all') </script>`
    );
  } catch (err) {
    console.log("Error, createNewProduct", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `Hi <script> alert(" ${message}"); window .location.replace('/admin/product/all') </script>`
    );
  }
};

// Productni id bo‘yicha olish uchun controller
// productController.getProductById = async (req: Request, res: Response) => {
//   try {
//     const id = req.params.id;
//     const product = await productService.getUpdateProduct(id); // productService ichida funksiya bo‘lishi kerak
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }
//     res.status(200).json({ data: product });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

productController.updateChosenProduct = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenproduct");
    const id = req.params.id;
    const input = req.body;

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // fayl nomlarini input.images ga joylaymiz
      input.images = req.files.map(
        (file: Express.Multer.File) => file.filename
      );
    }

    const result = await productService.updateChosenProduct(id, req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenproduct", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

productController.deleteChosenProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const deletedProduct = await productService.deleteChosenProduct(id);
    console.log("deletedProduct=>", deletedProduct);

    return res.redirect("/admin/product/all"); // faqat redirect
  } catch (err) {
    console.log("Error, deleteChosenProduct", err);
    return res.redirect("/admin/product/all?error=Could not delete");
  }
};

export default productController;
