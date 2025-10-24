import mongoose from "mongoose";
import TransactionModel from "../../models/transaction.model.js";
import { calculateNextOccurence } from "../../utils/helper.js";
import { success } from "zod";

export const processRecurringTransactions = async () => {
  const now = new Date();
  let processCount = 0;
  let failedCount = 0;

  try {
    const transactionCursor = TransactionModel.find({
      isRecurring: true,
      nextRecurringDate: { $lte: now },
    }).cursor();

    console.log("Starting Recurring Process.");

    for await (const tx of transactionCursor) {
      const nextDate = calculateNextOccurence(
        tx.nextRecurringDate!,
        tx.recurringInterval!
      );

      const session = await mongoose.startSession();

      try {
        session.withTransaction(
          async () => {
            await TransactionModel.create(
              [
                {
                  ...tx.toObject(),
                  _id: new mongoose.Types.ObjectId(),
                  title: `Recurring - ${tx.title}`,
                  date: tx.nextRecurringDate,
                  isRecurring: false,
                  nextRecurringDate: null,
                  recurringInterval: null,
                  lastProcessed: null,
                  createdAt: undefined,
                  updatedAt: undefined,
                },
              ],
              { session }
            );

            await TransactionModel.updateOne(
              { _id: tx._id },
              {
                $set: {
                  nextRecurringDate: nextDate,
                  lastProcessed: now,
                },
              },
              { session }
            );
          },
          {
            maxCommitTimeMS: 20000,
          }
        );

        processCount++;
      } catch (error: any) {
        failedCount++;
        console.log(`Failed recurring tx: ${tx._id}`, error?.message);
      } finally {
        await session.endSession();
      }
    }

    console.log(`✅Processed: ${processCount} Transactions`);
    console.log(`❌Failed: ${failedCount} Transactions`);

    return {
      success: true,
      processCount,
      failedCount,
    };
  } catch (error: any) {
    console.error("Error occurred processing transaction.", error);

    return {
      success: false,
      error: error?.message,
    };
  }
};
