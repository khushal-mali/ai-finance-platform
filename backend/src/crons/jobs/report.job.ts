import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import mongoose from "mongoose";
import { sendReportEmail } from "../../mailers/report.mailer.js";
import ReportSettingModel from "../../models/report-setting.model.js";
import ReportModel, { ReportStatusEnum } from "../../models/report.model.js";
import type { UserDocument } from "../../models/user.model.js";
import { generateReportService } from "../../services/report.service.js";
import { calculateNextReportDate } from "../../utils/helper.js";

export const processReportJob = async () => {
  const now = new Date();
  let processCount = 0;
  let failedCount = 0;

  const from = startOfMonth(subMonths(now, 1));
  const to = endOfMonth(subMonths(now, 1));

  try {
    const reportSettingCursor = ReportSettingModel.find({
      isEnabled: true,
      nextReportDate: { $lte: now },
    })
      .populate<{ userId: UserDocument }>("userId")
      .cursor();

    console.log("Running report.");

    for await (const setting of reportSettingCursor) {
      const user = setting.userId as UserDocument;
      if (!user) {
        console.log(`User not found for settings. ${setting._id}`);
        continue;
      }

      const session = await mongoose.startSession();

      try {
        const report = await generateReportService(user.id, from, to);

        console.log("Report Data", report);

        let emailSent = false;
        if (report) {
          try {
            // Sent email
            await sendReportEmail({
              email: user.email!,
              username: user.name!,
              report: {
                period: report.period,
                totalIncome: report.summary.income,
                totalExpenses: report.summary.expenses,
                availableBalance: report.summary.balance,
                savingsRate: report.summary.savingsRate,
                topSpendingCategories: report.summary.topCategories,
                insights: report.insights,
              },
              frequency: setting.frequency!,
            });
            emailSent = true;
          } catch (error) {
            console.log(`Email failed for ${user.id}`);
          }
        }

        await session.withTransaction(
          async () => {
            const bulkReports: any[] = [];
            const bulkSettings: any[] = [];

            if (report && emailSent) {
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user.id,
                    sentDate: now,
                    period: report.period,
                    status: ReportStatusEnum.SENT,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });

              bulkSettings.push({
                updateOne: {
                  filter: { _id: setting._id },
                  update: {
                    $set: {
                      lastSentDate: now,
                      nextReportDate: calculateNextReportDate(now),
                      updatedAt: now,
                    },
                  },
                },
              });
            } else {
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user.id,
                    sentDate: now,
                    period:
                      report?.period ||
                      `${format(from, "MMMM d")}-${format(to, "d, yyyy")}`,
                    status: report
                      ? ReportStatusEnum.FAILED
                      : ReportStatusEnum.NO_ACTIVITY,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });

              bulkSettings.push({
                updateOne: {
                  filter: { _id: setting._id },
                  update: {
                    $set: {
                      lastSentDate: null,
                      nextReportDate: calculateNextReportDate(now),
                      updatedAt: now,
                    },
                  },
                },
              });
            }

            await Promise.all([
              ReportModel.bulkWrite(bulkReports, { ordered: false }),
              ReportSettingModel.bulkWrite(bulkSettings, { ordered: false }),
            ]);
          },
          {
            maxCommitTimeMS: 10000,
          }
        );

        processCount++;
      } catch (error) {
        console.log(`Failed to process reports`, error);
        failedCount++;
      } finally {
        await session.endSession();
      }
    }

    console.log(`✅ Processed: ${processCount} report`);
    console.log(`❌ Failed: ${failedCount} report`);

    return {
      success: true,
      processCount,
      failedCount,
    };
  } catch (error) {
    console.error("Error processing reports", error);

    return {
      success: false,
      error: "Report process failed",
    };
  }
};
