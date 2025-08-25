import mongoose from "mongoose";
import UserModel, { type UserDocument } from "../models/user.model.js";
import { NotFoundException, UnauthorizedException } from "../utils/app-error.js";
import type {
  LoginSchemaType,
  RegisterSchemaType,
} from "../validators/auth.validator.js";
import ReportSettingModel, {
  ReportFrequencyEnum,
} from "../models/report-setting.model.js";
import { calculateNextReportDate } from "../utils/helper.js";
import { signJwtToken } from "../utils/jwt.js";

export const registerService = async (body: RegisterSchemaType) => {
  const { email } = body;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const existingUser = await UserModel.findOne({
        email,
      }).session(session);
      if (existingUser) throw new UnauthorizedException("User already exists.");

      const newUser = new UserModel({
        ...body,
      });

      await newUser.save({ session });

      const reportSetting = new ReportSettingModel({
        userId: newUser._id,
        frequency: ReportFrequencyEnum.MONTHLY,
        isEnabled: true,
        lastSentDate: null,
        nextReportDate: calculateNextReportDate(),
      });

      await reportSetting.save({ session });

      return { user: newUser.omitPassword() };
    });
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
};

export const loginService = async (body: LoginSchemaType) => {
  const { email, password } = body;
  const user = await UserModel.findOne({
    email,
  });

  if (!user) throw new NotFoundException("Email/Password not found!");

  const isPasswordValid = await user.comparedPassword(password);

  if (!isPasswordValid) throw new UnauthorizedException("Invalid email/password");

  const { expiresAt, token } = signJwtToken({ userId: user.id });

  const reportSetting = await ReportSettingModel.findOne(
    {
      userId: user.id,
    },
    { _id: 1, frequency: 1, isEnabled: 1 }
  ).lean();

  return {
    user: user.omitPassword(),
    reportSetting,
    accessToken: token,
    expiresAt,
  };
};
