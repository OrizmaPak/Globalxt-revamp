// Simple Email Service - Always Send Notifications
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Message } from '../types/chat';
import { getApiUrl, getDefaultHeaders } from '../config/api';

export const simpleEmailService = {
  // Send email notification - now with proper recipient logic and slick design
  async sendMessageNotification(message: Message, recipientEmail: string, chatRoomId: string): Promise<void> {
    try {
      // Determine if this is going to customer or company
      const isToCustomer = message.senderType === 'admin';
      
      console.log(`📧 Sending email notification to ${recipientEmail} (${isToCustomer ? 'customer' : 'company'})`);
      
      // Create different email templates based on recipient
      const emailData = isToCustomer
        ? this.createCustomerEmailTemplate(message, chatRoomId)
        : this.createCompanyEmailTemplate(message, chatRoomId);
      
      const response = await fetch(getApiUrl('/api/send-email'), {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({
          to: recipientEmail,
          subject: emailData.subject,
          message: emailData.html,
          replyTo: message.senderEmail
        })
      });

      if (response.ok) {
        // Mark email as sent
        const messageRef = doc(db, 'messages', chatRoomId, 'messages', message.id);
        await updateDoc(messageRef, { emailNotificationSent: true });
        
        console.log(`✅ Email notification sent to ${recipientEmail}`);
      } else {
        console.error('❌ Failed to send email notification');
      }
    } catch (error) {
      console.error('❌ Error sending email notification:', error);
    }
  },

  // Create sleek minimal email template for customers (when company sends message)
  createCustomerEmailTemplate(message: Message, chatRoomId: string) {
    const isFileMessage = message.messageType === 'file';
    const hasImage = isFileMessage && message.fileData?.fileType.startsWith('image/');
    
    return {
      subject: `New message from Global XT`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Message</title>
        </head>
        <body style="margin: 0; padding: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 480px; margin: 60px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);">
            
            <!-- Clean Header -->
            <div style="padding: 48px 40px 32px; text-align: center; background: linear-gradient(180deg, #ffffff 0%, #f8fffe 100%);">
              <div style="width: 56px; height: 56px; background: #10b981; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z" fill="white"/>
                </svg>
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.4px;">Global XT</h1>
              <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280; font-weight: 400;">Support Message</p>
            </div>
            
            <!-- Message Content -->
            <div style="padding: 0 40px 40px;">
              
              <!-- Sender Info -->
              <div style="display: flex; align-items: center; margin-bottom: 20px; padding: 16px 20px; background: #f8fffe; border-radius: 12px; border-left: 3px solid #10b981;">
                <div style="width: 36px; height: 36px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0;">
                  <span style="color: white; font-weight: 600; font-size: 14px;">${message.senderName.charAt(0).toUpperCase()}</span>
                </div>
                <div style="min-width: 0;">
                  <p style="margin: 0; font-weight: 600; color: #1a1a1a; font-size: 15px;">${message.senderName}</p>
                  <p style="margin: 2px 0 0; color: #6b7280; font-size: 13px;">Support Team</p>
                </div>
              </div>
              
              ${hasImage ? `
                <div style="margin-bottom: 24px; text-align: center;">
                  <div style="padding: 20px; background: #f8fffe; border: 1px solid #d1fae5; border-radius: 12px;">
                    <div style="font-size: 24px; margin-bottom: 8px;">🖼️</div>
                    <p style="margin: 0; font-weight: 500; color: #059669;">${message.fileData!.fileName}</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">Image attachment</p>
                  </div>
                </div>
              ` : ''}
              
              <!-- Message Text -->
              <div style="background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 32px;">
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6; font-weight: 400;">
                  ${message.content.replace(/\n/g, '<br>')}
                </p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center;">
                <a href="${window.location.origin}/chat/${chatRoomId}" style="display: inline-block; background: #1a1a1a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px; letter-spacing: -0.1px; transition: all 0.2s ease;">
                  Reply
                </a>
              </div>
              
            </div>
            
          </div>
          
          <!-- Minimal Footer -->
          <div style="text-align: center; margin-top: 32px; padding-bottom: 60px;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px; font-weight: 400;">
              Global XT Limited
            </p>
          </div>
          
        </body>
        </html>
      `
    };
  },

  // Create sleek minimal email template for company (when customer sends message)
  createCompanyEmailTemplate(message: Message, chatRoomId: string) {
    const isFileMessage = message.messageType === 'file';
    const hasImage = isFileMessage && message.fileData?.fileType.startsWith('image/');
    
    return {
      subject: `New message from ${message.senderName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Customer Message</title>
        </head>
        <body style="margin: 0; padding: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 480px; margin: 60px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);">
            
            <!-- Clean Header -->
            <div style="padding: 48px 40px 32px; text-align: center; background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);">
              <div style="width: 56px; height: 56px; background: #1a1a1a; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 6V4M12 6C13.1046 6 14 6.89543 14 8V14C14 15.1046 13.1046 16 12 16C10.8954 16 10 15.1046 10 14V8C10 6.89543 10.8954 6 12 6ZM12 6C9.79086 6 8 7.79086 8 10V14C8 17.3137 10.6863 20 14 20H18C18.5523 20 19 19.5523 19 19C19 18.4477 18.5523 18 18 18H14C11.7909 18 10 16.2091 10 14M22 14C22 18.4183 18.4183 22 14 22H10C5.58172 22 2 18.4183 2 14C2 9.58172 5.58172 6 10 6H14C18.4183 6 22 9.58172 22 14Z" fill="white"/>
                </svg>
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.4px;">Global XT</h1>
              <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280; font-weight: 400;">Customer Message</p>
            </div>
            
            <!-- Message Content -->
            <div style="padding: 0 40px 40px;">
              
              <!-- Priority Badge -->
              <div style="display: inline-flex; align-items: center; background: #fef3c7; border: 1px solid #fbbf24; color: #92400e; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 500; margin-bottom: 24px;">
                <div style="width: 6px; height: 6px; background: #f59e0b; border-radius: 50%; margin-right: 8px;"></div>
                New Customer Message
              </div>
              
              <!-- Customer Info -->
              <div style="display: flex; align-items: center; margin-bottom: 24px; padding: 20px; background: #f8fafe; border-radius: 12px; border-left: 3px solid #6366f1;">
                <div style="width: 44px; height: 44px; background: #6366f1; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0;">
                  <span style="color: white; font-weight: 600; font-size: 16px;">${message.senderName.charAt(0).toUpperCase()}</span>
                </div>
                <div style="min-width: 0;">
                  <p style="margin: 0; font-weight: 600; color: #1a1a1a; font-size: 16px;">${message.senderName}</p>
                  <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">${message.senderEmail}</p>
                </div>
              </div>
              
              ${hasImage ? `
                <div style="margin-bottom: 24px; text-align: center;">
                  <div style="padding: 20px; background: #f8fafe; border: 1px solid #e0e7ff; border-radius: 12px;">
                    <div style="font-size: 24px; margin-bottom: 8px;">🖼️</div>
                    <p style="margin: 0; font-weight: 500; color: #6366f1;">${message.fileData!.fileName}</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">Image attachment</p>
                  </div>
                </div>
              ` : ''}
              
              <!-- Message Text -->
              <div style="background: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 32px;">
                <p style="margin: 0 0 8px; font-size: 12px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6; font-weight: 400;">
                  ${message.content.replace(/\n/g, '<br>')}
                </p>
              </div>
              
              <!-- CTA Buttons -->
              <div style="display: flex; gap: 12px;">
                <a href="${window.location.origin}/admin/chat" style="flex: 1; display: block; background: #f8fafc; color: #374151; padding: 14px 20px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px; text-align: center; border: 1px solid #e5e7eb; transition: all 0.2s ease;">
                  Dashboard
                </a>
                <a href="${window.location.origin}/chat/${chatRoomId}" style="flex: 1; display: block; background: #1a1a1a; color: white; padding: 14px 20px; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px; text-align: center; transition: all 0.2s ease;">
                  Reply
                </a>
              </div>
              
            </div>
            
          </div>
          
          <!-- Minimal Footer -->
          <div style="text-align: center; margin-top: 32px; padding-bottom: 60px;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px; font-weight: 400;">
              Global XT Admin
            </p>
          </div>
          
        </body>
        </html>
      `
    };
  }
};
