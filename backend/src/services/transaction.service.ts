import TransactionModel, { TransactionTypeEnum } from "../models/transaction.model.js";
import { NotFoundException } from "../utils/app-error.js";
import { calculateNextOccurence } from "../utils/helper.js";
import type {
  BulkDeleteTransactionType,
  CreateTransactionType,
  UpdateTransactionType,
} from "../validators/transaction.validator.js";

export const createTransactionService = async (
  body: CreateTransactionType,
  userId: string
) => {
  let nextRecurringDate: Date | undefined;
  const currentDate = new Date();
  console.log(body);

  if (body.isRecurring && body.recurringInterval) {
    const calculatedDate = calculateNextOccurence(body.date, body.recurringInterval);

    nextRecurringDate =
      calculatedDate < currentDate
        ? calculateNextOccurence(currentDate, body.recurringInterval)
        : calculatedDate;
  }

  const transaction = await TransactionModel.create({
    ...body,
    category: body.category,
    amount: Number(body.amount),
    userId,
    isRecurring: body.isRecurring || false,
    recurringInterval: body.recurringInterval || null,
    nextRecurringDate,
    lastProcessed: null,
  });

  console.log(transaction);

  return transaction;
};

export const getAllTransactionService = async (
  userId: string,
  filters: {
    keyword: string | undefined;
    type: keyof typeof TransactionTypeEnum | undefined;
    recurringStatus: "RECURRING" | "NON_RECURRING" | undefined;
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {
  const { keyword, recurringStatus, type } = filters;

  const filterConditions: Record<string, any> = {
    userId,
  };

  if (keyword) {
    filterConditions.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
    ];
  }

  if (type) {
    filterConditions.type = type;
  }

  if (recurringStatus) {
    if (recurringStatus === "RECURRING") {
      filterConditions.isRecurring = true;
    } else if (recurringStatus === "NON_RECURRING") {
      filterConditions.isRecurring = false;
    }
  }

  const { pageNumber, pageSize } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [transactions, totalCount] = await Promise.all([
    TransactionModel.find(filterConditions)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 }),
    TransactionModel.countDocuments(filterConditions),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    transactions,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const getTransactionByIdService = async (
  userId: string,
  transactionId: string
) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });

  if (!transaction) throw new NotFoundException("Transaction Not Found");

  return transaction;
};

export const duplicateTransactionService = async (
  userId: string,
  transactionId: string
) => {
  const transaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });

  if (!transaction) throw new NotFoundException("Transaction Not Found");

  const duplicated = await TransactionModel.create({
    ...transaction.toObject(),
    _id: undefined,
    title: `Duplicate - ${transaction.title}`,
    description: transaction.description
      ? `${transaction.description} (Duplicate)`
      : `Duplicated transaction`,
    isRecurring: false,
    recurringInterval: undefined,
    nextRecurringDate: undefined,
    createdAt: undefined,
    updatedAt: undefined,
  });

  return duplicated;
};

export const updateTransactionService = async (
  userId: string,
  transactionId: string,
  body: UpdateTransactionType
) => {
  const existingTransaction = await TransactionModel.findOne({
    _id: transactionId,
    userId,
  });

  if (!existingTransaction) throw new NotFoundException("Transaction Not Found");

  const now = new Date();
  const isRecurring = body.isRecurring ?? existingTransaction.isRecurring;
  const date = body.date !== undefined ? new Date(body.date) : existingTransaction.date;

  const recurringInterval =
    body.recurringInterval || existingTransaction.recurringInterval;

  let nextRecurringDate: Date | undefined;
  if (isRecurring && recurringInterval) {
    const calculatedDate = calculateNextOccurence(date, recurringInterval);

    nextRecurringDate =
      calculatedDate < now
        ? calculateNextOccurence(now, recurringInterval)
        : calculatedDate;
  }

  existingTransaction.set({
    ...(body.title && { title: body.title }),
    ...(body.description && { description: body.description }),
    ...(body.category && { category: body.category }),
    ...(body.type && { type: body.type }),
    ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
    ...(body.amount !== undefined && { amount: Number(body.amount) }),
    date,
    isRecurring,
    recurringInterval,
    nextRecurringDate,
  });

  await existingTransaction.save();

  return;
};

export const deleteTransactionService = async (userId: string, transactionId: string) => {
  const deleted = await TransactionModel.findOneAndDelete({
    _id: transactionId,
    userId,
  });

  if (!deleted) throw new NotFoundException("Transaction Not Found");

  return;
};

export const bulkDeleteTransactionService = async (
  userId: string,
  transactionIds: string[]
) => {
  console.log(transactionIds, userId);
  const result = await TransactionModel.deleteMany({
    _id: { $in: transactionIds },
    userId,
  });

  if (result.deletedCount === 0) throw new NotFoundException("No transaction found.");

  return {
    success: true,
    deleteCount: result.deletedCount,
  };
};

export const bulkTransactionService = async (
  userId: string,
  transactionIds: string[]
) => {};
