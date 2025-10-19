import UserModel from "../models/user.model.js";

export const findByIdUserService = async (userId: string) => {
  const user = await UserModel.findById(userId);

  return user?.omitPassword();
};
