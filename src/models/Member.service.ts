import { MemberType, MemberStatus } from "../libs/enums/member.enum";
import MemberModel from "../schema/Member.model";
import {
  LoginInput,
  Member,
  MemberInput,
  MemberUpdateInput,
} from "../libs/types/members";
import Errors, { HttpCode, Message } from "../libs/Errors";
import * as bcrypt from "bcryptjs";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { Types } from "mongoose";

class MemberService {
  private readonly memberModel;

  constructor() {
    this.memberModel = MemberModel;
  }
  /* USERS LOGIC SPA */

  public async getAdmin(): Promise<Member> {
    const result = await this.memberModel
      .findOne({ memberType: MemberType.ADMIN })
      .lean()
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async signup(input: MemberInput): Promise<Member> {
    const salt = await bcrypt.genSalt();
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

    try {
      const result = await this.memberModel.create(input);
      result.memberPassword = "";
      return result.toJSON();
    } catch (err) {
      console.error("Error, model:signup", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
    }
  }
  public async login(input: LoginInput): Promise<Member> {
    const member = await this.memberModel
      .findOne(
        {
          memberNick: input.memberNick,
          memberStatus: { $ne: MemberStatus.DELETE },
        },
        { _id: 1, memberNick: 1, memberPassword: 1, memberStatus: 1 }
      )
      .exec();
    console.log("Found Member:", member);
    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
    else if (member.memberStatus === MemberStatus.BLOCK) {
      throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
    }

    const isMatch = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword
    );

    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }
    return await this.memberModel.findById(member._id).lean().exec();
  }

  public async getMemberDetial(member: Member): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    console.log(memberId);
    const result = await this.memberModel
      .findOne({ _id: memberId, memberStatus: MemberStatus.ACTIVE })
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async updateMember(
    member: Member,
    input: MemberUpdateInput
  ): Promise<Member> {
    const memberId = member._id;

    const result = await this.memberModel
      .findOneAndUpdate({ _id: memberId }, { $set: input }, { new: true })
      .exec();
    console.log("storage", result);
    if (!result)
      throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATED_FAILED);
    return result;
  }

  public async getTopUsers(): Promise<Member[]> {
    const result = await this.memberModel
      .find({
        memberStatus: MemberStatus.ACTIVE,
        memberPoints: { $gte: 1 },
      })
      .sort({ memberPoints: -1 })
      .limit(4)
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async addUserPoint(member: Member, point: number): Promise<Member> {
    const memberId = shapeIntoMongooseObjectId(member._id);

    return await this.memberModel
      .findOneAndUpdate(
        {
          _id: memberId,
          memberType: MemberType.USER,
          memberStatus: MemberStatus.ACTIVE,
        },
        { $inc: { memberPoints: point } },
        { new: true }
      )
      .exec();
  }
  /* ADMIN LOGIC SSR */
  public async processSignup(input: MemberInput): Promise<Member> {
    const exist = await this.memberModel

      .findOne({ memberType: MemberType.ADMIN })
      .exec();
    if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    const salt = await bcrypt.genSalt();
    input.memberPassword = await bcrypt.hash(input.memberPassword, salt);
    try {
      const result = await this.memberModel.create(input);
      result.memberPassword = "";
      return result;
    } catch (err) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }
  public async processLogin(input: LoginInput): Promise<Member> {
    const member = await this.memberModel
      .findOne(
        { memberNick: input.memberNick },
        { memberNick: 1, memberPassword: 1 }
      )
      .exec();
    if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);

    const isMatch = await bcrypt.compare(
      input.memberPassword,
      member.memberPassword
    );

    if (!isMatch) {
      throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
    }
    return await this.memberModel.findById(member._id).exec();
  }

  public async getUsers(): Promise<Member[]> {
    const result = await this.memberModel
      .aggregate([
        { $match: { memberType: MemberType.USER } },
        {
          $lookup: {
            from: "orders", // orders collection nomi
            localField: "_id",
            foreignField: "memberId",
            as: "orders",
          },
        },
      ])
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result;
  }

  public async updateChosenUser(input: MemberUpdateInput): Promise<Member[]> {
    input._id = shapeIntoMongooseObjectId(input._id);
    const result = await this.memberModel
      .findByIdAndUpdate({ _id: input._id }, input, { new: true })
      .exec();

    if (!result)
      throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATED_FAILED);

    return result;
  }

  public async userCount(): Promise<any> {
    const count = await this.memberModel.aggregate([
      {
        $group: {
          _id: "$memberStatus",
          total: { $sum: 1 },
        },
      },
    ]);

    return count;
  }
}

export default MemberService;
