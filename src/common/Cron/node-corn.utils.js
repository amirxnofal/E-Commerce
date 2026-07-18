import cron from "node-cron";
import { UserModel } from "../../database/models/user.model.js";

export const deleteExpiredAccounts = () => {
    cron.schedule("0 0 * * *", async () => {
        try {
            const result = await UserModel.deleteMany({
                status: "deleted",
                deletedAt: { $lte: new Date() },
            });

            if (result.deletedCount > 0) {
                console.log(
                    `[CRON] Deleted ${result.deletedCount} expired account(s)`,
                );
            }
        } catch (error) {
            console.error("[CRON] Error deleting expired accounts:", error);
        }
    });

    console.log(
        "[CRON] Scheduled: Delete expired accounts every day (30 days retention)",
    );
};
