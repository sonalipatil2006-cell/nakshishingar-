const nodemailer = require('nodemailer');

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (not your regular password)
  },
});

// ✅ Send OTP Email
const sendOTPEmail = async (toEmail, otp, fullName) => {
  console.log(`[EmailUtil] Preparing OTP email for ${toEmail}...`);
  const mailOptions = {
    from: `"Nakshishrungar 💍" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🔐 Your OTP for Nakshishrungar Registration',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0c88e; border-radius: 10px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #8B4513, #D4AF37); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">💍 Nakshishrungar</h1>
          <p style="color: #ffe; margin: 5px 0;">Premium Jewellery</p>
        </div>
        <div style="padding: 30px; background: #fff8f0;">
          <h2 style="color: #8B4513;">Hello, ${fullName || 'Guest'}! 👋</h2>
          <p style="color: #555; font-size: 15px;">Your OTP for account registration is:</p>
          <div style="background: #8B4513; color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #888; font-size: 13px;">⚠️ This OTP will expire in 10 minutes. Please do not share it with anyone.</p>
          <hr style="border-color: #e0c88e; margin: 20px 0;">
          <p style="color: #aaa; font-size: 12px; text-align: center;">© 2025 Nakshishrungar. All rights reserved.</p>
        </div>
      </div>
    `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailUtil] OTP sent to ${toEmail}. Response: ${info.response}`);
  } catch (err) {
    console.error(`[EmailUtil] Failed to send OTP to ${toEmail}:`, err.message);
    throw err;
  }
};

// ✅ Send Order Confirmation Email
const sendOrderConfirmationEmail = async (toEmail, fullName, order) => {
  const mailOptions = {
    from: `"Nakshishrungar 💍" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '✅ Order Confirmed - Nakshishrungar',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: auto; border: 1px solid #e0c88e; border-radius: 10px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #8B4513, #D4AF37); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">💍 Nakshishrungar</h1>
          <p style="color: #ffe; margin: 5px 0;">Premium Jewellery</p>
        </div>
        <div style="padding: 30px; background: #fff8f0;">
          <h2 style="color: #8B4513;">🎉 Order Confirmed, ${fullName}!</h2>
          <p style="color: #555;">Your order has been successfully placed. Here are your order details:</p>
          
          <div style="background: white; border: 1px solid #e0c88e; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p><strong>🆔 Order ID:</strong> ${order._id}</p>
            <p><strong>💰 Total Amount:</strong> ₹${order.totalAmount}</p>
            <p><strong>💳 Payment Method:</strong> ${order.paymentMethod}</p>
            <p><strong>📦 Status:</strong> <span style="color: #D4AF37; font-weight: bold;">Order Placed</span></p>
          </div>

          <div style="background: #D4AF37; color: white; text-align: center; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0;">🚚 Coming Soon to Your Doorstep!</h3>
            <p style="margin: 5px 0; font-size: 13px;">Your order will be dispatched soon. You will receive regular updates.</p>
          </div>

          <p style="color: #888; font-size: 13px; text-align: center;">If you have any questions, feel free to contact us.</p>
          <hr style="border-color: #e0c88e; margin: 20px 0;">
          <p style="color: #aaa; font-size: 12px; text-align: center;">© 2025 Nakshishrungar. All rights reserved.</p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// ✅ Send Order Status Update Email
const sendOrderStatusEmail = async (toEmail, fullName, order, newStatus) => {
  const statusMessages = {
    'placed': { emoji: '📦', title: 'Order Placed!', msg: 'Your Order has been successfully placed.' },
    'processing': { emoji: '⚙️', title: 'Order Processing!', msg: 'Your order is being prepared.' },
    'shipped': { emoji: '🚚', title: 'Order Shipped!', msg: 'Your order has been dispatched. You will resive it soon!!' },
    'out_for_delivery': { emoji: '🛵', title: 'Out for Delivery!', msg: 'Your order will be deliverd Today!' },
    'delivered': { emoji: '✅', title: 'Order Delivered!', msg: 'Your order has been successfully delivered. Enjoy! 🎉' },
    'cancelled': { emoji: '❌', title: 'Order Cancelled', msg: 'Your order has been cancelled.' },
    'coming_soon': { emoji: '⏳', title: 'Coming Soon!', msg: 'This item will be available soon. You will be notified.' },
  };

  const info = statusMessages[newStatus] || { emoji: '📢', title: `Status: ${newStatus}`, msg: 'There is an update in your order.' };

  const mailOptions = {
    from: `"Nakshishrungar 💍" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${info.emoji} ${info.title} - Nakshishrungar`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: auto; border: 1px solid #e0c88e; border-radius: 10px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #8B4513, #D4AF37); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">💍 Nakshishrungar</h1>
          <p style="color: #ffe; margin: 5px 0;">Premium Jewellery</p>
        </div>
        <div style="padding: 30px; background: #fff8f0;">
          <h2 style="color: #8B4513;">${info.emoji} ${info.title}</h2>
          <p style="color: #555;">Hi ${fullName},</p>
          <p style="color: #555;">${info.msg}</p>

          <div style="background: white; border: 1px solid #e0c88e; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p><strong>🆔 Order ID:</strong> ${order._id}</p>
            <p><strong>💰 Total Amount:</strong> ₹${order.totalAmount}</p>
            <p><strong>📦 New Status:</strong> <span style="color: #D4AF37; font-weight: bold; text-transform: capitalize;">${newStatus}</span></p>
          </div>

          <p style="color: #888; font-size: 13px; text-align: center;">If you have any questions, feel free to contact us.</p>
          <hr style="border-color: #e0c88e; margin: 20px 0;">
          <p style="color: #aaa; font-size: 12px; text-align: center;">© 2025 Nakshishrungar. All rights reserved.</p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// ✅ Send Registration Success Email
const sendRegistrationSuccessEmail = async (toEmail, fullName) => {
  const mailOptions = {
    from: `"Nakshishrungar 💍" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🎉 Welcome to Nakshishrungar - Registration Successful!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0c88e; border-radius: 10px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #8B4513, #D4AF37); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">💍 Nakshishrungar</h1>
          <p style="color: #ffe; margin: 5px 0;">Premium Jewellery</p>
        </div>
        <div style="padding: 30px; background: #fff8f0;">
          <h2 style="color: #8B4513;">Welcome, ${fullName}! 🎉</h2>
          <p style="color: #555; font-size: 15px;">Your account has been successfully created on Nakshishrungar.</p>
          <div style="background: white; border: 1px solid #e0c88e; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
            <p style="color: #8B4513; font-weight: bold; margin: 0;">Explore our Premium Collections and enjoy your shopping experience!</p>
          </div>
          <p style="color: #888; font-size: 13px; text-align: center;">Happy Shopping! 🛍️</p>
          <hr style="border-color: #e0c88e; margin: 20px 0;">
          <p style="color: #aaa; font-size: 12px; text-align: center;">© 2025 Nakshishrungar. All rights reserved.</p>
        </div>
      </div>
    `,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailUtil] Registration Success email sent to ${toEmail}. Response: ${info.response}`);
  } catch (err) {
    console.error(`[EmailUtil] Failed to send Registration Success email to ${toEmail}:`, err.message);
  }
};

module.exports = { sendOTPEmail, sendRegistrationSuccessEmail, sendOrderConfirmationEmail, sendOrderStatusEmail };
