export enum HttpCode {
  OK = 200,
  CREATED = 201,
  NOT_MODIFIED = 304,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVICE_ERROR = 500,
}

export enum Message {
  DELETE_FAILED = "Delete failed",
  SOMETHING_WENT_WRONG = "Something went wrong!",
  NO_DATA_FOUND = "No data found",
  CREATE_FAILED = "Create failed",
  UPDATED_FAILED = "Update failed!",
  USED_NICK_PHONE = "Nickname or phone number is already in use!",

  NO_MEMBER_NICK = "No member with that nickname!!!",
  TOKEN_CREATION_FAILED = "Token creation error",
  BLOCKED_USER = "You have been blocked, please contact the restaurant!",
  WRONG_PASSWORD = "Wrong password entered. Please try again!",
  NOT_AUTHENTICATED = "You are not authenticated. Please log in first!",
}

export class Errors extends Error {
  public code: HttpCode;
  public message: Message;

  static standard = {
    code: HttpCode.INTERNAL_SERVICE_ERROR,
    message: Message.SOMETHING_WENT_WRONG,
  };

  constructor(statusCode: HttpCode, statusMessage: Message) {
    super(statusMessage);
    this.code = statusCode;
    this.message = statusMessage;

    this.name = "CustomError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export default Errors;
