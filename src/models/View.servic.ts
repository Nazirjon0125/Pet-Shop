import Errors, { HttpCode, Message } from "../libs/Errors";
import { View, ViewInput } from "../libs/types/view";
import ViewModel from "../schema/View.model";

export class ViewService {
  private readonly ViewModel;

  constructor() {
    this.ViewModel = ViewModel;
  }

  public async checkViewExistence(input: ViewInput): Promise<View | null> {
    return await this.ViewModel.findOne({
      memberId: input.memberId,
      viewRefId: input.viewRefId,
      viewGroup: input.viewGroup,
    }).exec();
  }
  public async insertMemberView(input: ViewInput): Promise<View> {
    try {
      return await this.ViewModel.create(input);
    } catch (err) {
      console.log("ERROR, model:insertMemberView:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }
}

export default ViewService;
