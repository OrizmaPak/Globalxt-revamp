import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Gmail configuration
const GMAIL_USER = process.env.GMAIL_USER || 'globalxttech@gmail.com';
const GMAIL_PASS = process.env.GMAIL_PASS || 'qygl wnth oidv srxm';
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL || 'hello@globalxtlimited.com';

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter configuration failed:', error);
  } else {
    console.log('✅ Email transporter ready for sending emails');
  }
});

// Generate email HTML template
const generateEnquiryEmailHTML = (enquiry) => {
  const { products, generalMessage, contactDetails, timestamp } = enquiry;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Enquiry - Global XT Limited</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #1D741B; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 18px; font-weight: bold; color: #1D741B; margin-bottom: 12px; border-bottom: 2px solid #8FA01F; padding-bottom: 4px; }
        .product { background: #f9f9f9; border-left: 4px solid #8FA01F; padding: 16px; margin-bottom: 16px; border-radius: 4px; }
        .product-name { font-weight: bold; color: #1D741B; margin-bottom: 8px; }
        .product-info { margin-bottom: 4px; }
        .notes-box { background: #fff; border: 1px solid #ddd; padding: 12px; margin-top: 8px; border-radius: 4px; }
        .contact-info { background: #f0f8f0; padding: 16px; border-radius: 8px; }
        .general-message { background: #fff7e6; border-left: 4px solid #DED93E; padding: 16px; margin: 16px 0; }
        .footer { color: #666; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #ddd; }
        .highlight { color: #1D741B; font-weight: bold; }
        .badge { background: #8FA01F; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🌾 New Product Enquiry</h1>
        <p>A customer has submitted an enquiry through your website</p>
      </div>

      <div class="section">
        <div class="section-title">📞 Customer Contact Information</div>
        <div class="contact-info">
          <div><strong>Name:</strong> ${contactDetails.name}</div>
          <div><strong>Email:</strong> <a href="mailto:${contactDetails.email}">${contactDetails.email}</a></div>
          ${contactDetails.phone ? `<div><strong>Phone:</strong> <a href="tel:${contactDetails.phone}">${contactDetails.phone}</a></div>` : ''}
        </div>
      </div>

      <div class="section">
        <div class="section-title">📦 Products Enquired About <span class="badge">${products.length} item${products.length !== 1 ? 's' : ''}</span></div>
        ${products.map((product, index) => `
          <div class="product">
            <div class="product-name">${index + 1}. ${product.name}</div>
            <div class="product-info"><strong>Category:</strong> ${product.categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
            <div class="product-info"><strong>Product SKU:</strong> ${product.productSlug}</div>
            <div class="product-info"><strong>Product Link:</strong> <a href="https://globalxtlimited.com/products/${product.categorySlug}/${product.productSlug}" target="_blank">View Product</a></div>
            ${product.notes ? `
              <div class="notes-box">
                <strong>Customer Notes:</strong><br>
                ${product.notes.replace(/\n/g, '<br>')}
              </div>
            ` : '<div style="color: #666; font-style: italic;">No specific notes for this product</div>'}
          </div>
        `).join('')}
      </div>

      ${generalMessage ? `
        <div class="section">
          <div class="section-title">💬 General Message</div>
          <div class="general-message">
            ${generalMessage.replace(/\n/g, '<br>')}
          </div>
        </div>
      ` : ''}

      <div class="footer">
        <div><strong>Enquiry Details:</strong></div>
        <div>📅 Submitted: ${new Date(timestamp).toLocaleString('en-GB', { 
          dateStyle: 'full', 
          timeStyle: 'short',
          timeZone: 'Africa/Lagos'
        })} (Nigeria Time)</div>
        <div>🌐 Source: Global XT Limited Website</div>
        <div>📧 Reply to: <a href="mailto:${contactDetails.email}">${contactDetails.email}</a></div>
        
        <hr style="margin: 16px 0;">
        <p><em>This enquiry was automatically generated from your website. Please respond promptly to maintain customer satisfaction.</em></p>
      </div>
    </body>
    </html>
  `;
};

// API endpoint for sending enquiry emails
app.post('/api/send-enquiry', async (req, res) => {
  try {
    const enquiry = req.body;
    console.log('📧 Received enquiry submission:', {
      customer: enquiry.contactDetails.name,
      email: enquiry.contactDetails.email,
      productCount: enquiry.products.length,
      timestamp: enquiry.timestamp
    });

    // Validate required fields
    if (!enquiry.products || enquiry.products.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No products in enquiry' 
      });
    }

    if (!enquiry.contactDetails.name || !enquiry.contactDetails.email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Customer name and email are required' 
      });
    }

    // Generate email subject
    const productCount = enquiry.products.length;
    const customerName = enquiry.contactDetails.name;
    const subject = `New Enquiry – ${customerName} (${productCount} item${productCount !== 1 ? 's' : ''})`;

    // Generate email HTML
    const htmlContent = generateEnquiryEmailHTML(enquiry);

    // Email options
    const mailOptions = {
      from: {
        name: 'Global XT Website',
        address: GMAIL_USER
      },
      to: RECIPIENT_EMAIL,
      replyTo: enquiry.contactDetails.email,
      subject: subject,
      html: htmlContent,
      // Add plain text version as fallback
      text: `
New Product Enquiry from ${customerName}

Contact Information:
- Name: ${customerName}
- Email: ${enquiry.contactDetails.email}
${enquiry.contactDetails.phone ? `- Phone: ${enquiry.contactDetails.phone}` : ''}

Products (${productCount} items):
${enquiry.products.map((product, i) => `
${i + 1}. ${product.name}
   Category: ${product.categorySlug.replace(/-/g, ' ')}
   SKU: ${product.productSlug}
   ${product.notes ? `Notes: ${product.notes}` : 'No specific notes'}
`).join('')}

${enquiry.generalMessage ? `General Message:\n${enquiry.generalMessage}` : ''}

Submitted: ${new Date(enquiry.timestamp).toLocaleString()}
Source: Global XT Limited Website
      `.trim()
    };

    // Send email
    console.log('📤 Sending email to:', RECIPIENT_EMAIL);
    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', result.messageId);
    
    res.json({ 
      success: true, 
      messageId: result.messageId,
      message: 'Enquiry sent successfully' 
    });

  } catch (error) {
    console.error('❌ Error sending enquiry email:', error);
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send enquiry. Please try again or contact us directly.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Global XT Enquiry API'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Global XT Enquiry API server running on port ${PORT}`);
  console.log(`📧 Email configuration: ${GMAIL_USER} -> ${RECIPIENT_EMAIL}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});