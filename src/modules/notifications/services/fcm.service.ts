import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as admin from "firebase-admin";

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // Use path relative to project root
      const path = require('path');
      const serviceAccountPath = path.join(
        process.cwd(),
        'snap-cal-5fd97-firebase-adminsdk-fbsvc-29930cbe7c.json'
      );

      // Initialize Firebase Admin SDK
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });

      this.logger.log("Firebase Admin SDK initialized successfully");
    } catch (error) {
      this.logger.error("Failed to initialize Firebase Admin SDK", error);
    }
  }

  async sendNotification(
    fcmToken: string,
    title: string,
    message: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    if (!this.firebaseApp) {
      this.logger.warn("Firebase not initialized. Skipping notification.");
      return false;
    }

    try {
      const payload: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title,
          body: message,
        },
        data: data || {},
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channelId: "snapcal_notifications",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
      };
      console.log(payload);
      const response = await admin.messaging().send(payload);
      this.logger.log(`Notification sent successfully: ${response}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);

      // Handle invalid token errors
      if (
        error.code === "messaging/invalid-registration-token" ||
        error.code === "messaging/registration-token-not-registered"
      ) {
        this.logger.warn(`Invalid FCM token: ${fcmToken}`);
        // You might want to mark this token as invalid in the database
      }

      return false;
    }
  }

  async sendMulticast(
    fcmTokens: string[],
    title: string,
    message: string,
    data?: Record<string, string>,
  ): Promise<{ successCount: number; failureCount: number }> {
    if (!this.firebaseApp) {
      this.logger.warn("Firebase not initialized. Skipping notification.");
      return { successCount: 0, failureCount: fcmTokens.length };
    }

    if (fcmTokens.length === 0) {
      return { successCount: 0, failureCount: 0 };
    }

    try {
      const payload: admin.messaging.MulticastMessage = {
        tokens: fcmTokens,
        notification: {
          title,
          body: message,
        },
        data: data || {},
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channelId: "snapcal_notifications",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(payload);

      this.logger.log(
        `Multicast sent: ${response.successCount} success, ${response.failureCount} failures`,
      );

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send multicast notification: ${error.message}`,
      );
      return { successCount: 0, failureCount: fcmTokens.length };
    }
  }
}
