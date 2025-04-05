import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const setUserRole = functions.https.onCall(
  async (
    request: functions.https.CallableRequest<{
            uid: string;
            isBusiness: boolean;
        }>
  ) => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Request must be authenticated."
      );
    }
    const {uid, isBusiness} = request.data;
    try {
      await admin.auth().setCustomUserClaims(uid, {isBusiness});
      return {message: "User role updated successfully."};
    } catch (error: unknown) {
      const err = error as Error;
      throw new functions.https.HttpsError("unknown", err.message, error);
    }
  }
);
