import { T } from "../libs/types/common";
import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  Product,
  ProductInput,
  ProductInquery,
  ProductUpdateInput,
} from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { ProductStatus } from "../libs/enums/product.enum";
import { ObjectId } from "mongoose";
import { ViewService } from "./View.servic";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import { Types } from "mongoose";
class ProductService {
  private readonly productModel;
  public viewService;
  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();
  }

  /** SPA */

  public async getProducts(inquiry: ProductInquery): Promise<Product[]> {
    console.log("getProducts INQUIRY:", inquiry);

    const match: T = {
      productStatus: { $in: [ProductStatus.PROCESS, ProductStatus.SOLDOUT] },
    };

    // Faqat inquiry.productCollection mavjud bo‘lsa filter qo‘shamiz
    if (inquiry.productCollection) {
      console.log("Filtering by productCollection:", inquiry.productCollection);
      match.productCollection = inquiry.productCollection;
    }
    // Search bo‘lsa qo‘shamiz
    if (inquiry.search) {
      match.productName = { $regex: new RegExp(inquiry.search, "i") };
    }

    const sort: T =
      inquiry.order === "productPrice"
        ? { [inquiry.order]: 1 }
        : { [inquiry.order]: -1 };
    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
        { $limit: inquiry.limit * 1 },
      ])

      .exec();
    console.log("Pagination skip:", (inquiry.page - 1) * inquiry.limit);
    console.log("Pagination limit:", inquiry.limit);
    console.log("MongoDB match filter:", match);
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async getProduct(
    memberId: ObjectId | null,
    id: string
  ): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);

    let result = await this.productModel
      .findOne({
        _id: productId,
        productStatus: ProductStatus.PROCESS,
      })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    if (memberId) {
      // Check View Log Existence
      const input: ViewInput = {
        memberId: memberId,
        viewRefId: productId,
        viewGroup: ViewGroup.PRODUCT,
      };

      const existView = await this.viewService.checkViewExistence(input);
      console.log("exist:", !!existView);
      if (!existView) {
        // Insert New View Log
        console.log("PLANNING TO INSERT NEW VIEW");
        await this.viewService.insertMemberView(input);
        // Increase Target View
      }

      // Increase Counts
      result = await this.productModel
        .findByIdAndUpdate(
          productId,
          { $inc: { productViews: +1 } },
          { new: true }
        )
        .exec();
    }

    return result;
  }
  /** SSR */

  public async getAllProducts(): Promise<Product[]> {
    const result = await this.productModel.find().exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      return await this.productModel.create(input);
    } catch (err) {
      console.error("Error, model:createNewProduct:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateChosenProduct(
    id: string,
    input: ProductUpdateInput
  ): Promise<Product> {
    id = shapeIntoMongooseObjectId(id);

    const result = await this.productModel
      .findOneAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.UPDATED_FAILED);
    return result;
  }

  public async leftCount(id: string): Promise<Product> {
    id = shapeIntoMongooseObjectId(id);
    console.log("Received ID:", id);

    const product = await this.productModel.findById(id);
    console.log("Found product:", product);

    if (!product) throw new Errors(HttpCode.NOT_FOUND, Message.UPDATED_FAILED);

    if (product.productLeftCount > 0) {
      product.productLeftCount -= 1;

      if (product.productLeftCount === 0) {
        product.productStatus = ProductStatus.SOLDOUT;
      }

      await product.save();
      console.log("Updated product:", product);
    }

    return product;
  }

  public async deleteChosenProduct(id: string): Promise<Product> {
    if (!Types.ObjectId.isValid(id))
      throw new Errors(HttpCode.BAD_REQUEST, Message.NO_DATA_FOUND);

    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.DELETE_FAILED);
    console.log("deleteChosenProduct=>", result);
    return result;
  }

  public async productCount(): Promise<any> {
    const conuts = await this.productModel.aggregate([
      {
        $group: {
          _id: "$productStatus",
          total: { $sum: 1 },
        },
      },
    ]);

    return conuts;
  }

  // public async totalProduct(): Promise<number> {
  //   const pausedCount = await this.productModel.countDocuments({
  //     productStatus: "PAUSE",
  //   });
  //   console.log("Paused:", pausedCount);
  //   const deletedCount = await this.productModel.countDocuments({
  //     productStatus: "DELETE",
  //   });
  //   console.log("Paused:", deletedCount);
  //   const SoldOutCount = await this.productModel.countDocuments({
  //     productStatus: "SOLD-OUT",
  //   });
  //   console.log("Deleted:", SoldOutCount);
  //   const count = await this.productModel.countDocuments().exec();
  //   console.log("dashboardProduct", count);
  //   return count;
  //   return pausedCount;
  //   return deletedCount;
  //   return SoldOutCount;
  // }
}
export default ProductService;
