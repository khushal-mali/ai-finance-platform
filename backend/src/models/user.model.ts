import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt.js";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  profilePicture: string | null;
  createdAt: Date;
  updatedAt: Date;
  omitPassword: () => Omit<UserDocument, "password">;
  comparedPassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: true },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashValue(this.password);
    }
  }
  next();
});

userSchema.methods.omitPassword = function (): Omit<UserDocument, "password"> {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.methods.comparedPassword = async function (
  password: string
): Promise<boolean> {
  return compareValue(password, this.password);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
