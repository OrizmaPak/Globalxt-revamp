# EmailJS Setup Guide

## Overview
Your enquiry form now uses EmailJS to send emails directly from the browser without needing a backend server. Follow these steps to set it up:

## Step 1: Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (allows 200 emails/month)
3. Verify your email address

## Step 2: Add Email Service
1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, Yahoo, etc.)
4. Follow the instructions to connect your email account
5. Note down the **Service ID** (you'll need this)

## Step 3: Create Email Template
1. Go to "Email Templates" in your dashboard
2. Click "Create New Template"
3. Copy the content from `src/config/email-template-sample.html` into the template editor
4. Give your template a name (e.g., "Product Enquiry")
5. Note down the **Template ID** (you'll need this)

## Step 4: Get Your Public Key
1. Go to "Account" > "General"
2. Copy your **Public Key**

## Step 5: Update Configuration
1. Open `src/config/emailjs.js`
2. Replace the placeholder values:
   ```javascript
   export const EMAILJS_CONFIG = {
     PUBLIC_KEY: 'your_actual_public_key',
     SERVICE_ID: 'your_actual_service_id',  
     TEMPLATE_ID: 'your_actual_template_id',
     TO_EMAIL: 'your-business-email@example.com'
   };
   ```

## Step 6: Test the Integration
1. Save your changes
2. Go to your website and try submitting an enquiry
3. Check your email for the enquiry message

## Template Variables Used
The email template uses these variables from your form:
- `{{customer_name}}` - Customer's full name
- `{{customer_email}}` - Customer's email address  
- `{{customer_phone}}` - Customer's phone number
- `{{general_message}}` - General message from customer
- `{{products_list}}` - List of selected products with notes
- `{{products_count}}` - Number of selected products
- `{{enquiry_date}}` - Date of the enquiry

## Troubleshooting
- **Emails not sending**: Check your Service ID, Template ID, and Public Key
- **Variables not showing**: Make sure variable names in template match exactly
- **Rate limiting**: Free account has 200 emails/month limit
- **Spam folder**: Initial emails might go to spam, whitelist the service

## Security Notes
- EmailJS Public Key is safe to use in frontend code
- All actual email credentials stay secure with EmailJS
- Consider upgrading to paid plan for higher limits in production

## Alternative: Mailto Links
If you prefer not to use EmailJS, you can also use mailto links as a simple alternative:

```javascript
const handleSendEnquiry = () => {
  const subject = `Product Enquiry from ${contactDetails.name}`;
  const body = `
Name: ${contactDetails.name}
Email: ${contactDetails.email}
Phone: ${contactDetails.phone || 'Not provided'}

Products:
${items.map(item => `- ${item.name}${item.notes ? ` (${item.notes})` : ''}`).join('\n')}

Message: ${generalMessage || 'No additional message'}
  `;
  
  const mailtoLink = `mailto:your-email@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
};
```