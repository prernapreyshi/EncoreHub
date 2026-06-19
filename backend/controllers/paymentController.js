const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
  });
};

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    // For demo: simulate order creation when Razorpay keys not configured
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id') {
      return res.json({
        success: true,
        order: {
          id: 'order_demo_' + Date.now(),
          amount: amount * 100,
          currency: 'INR',
          status: 'created',
        },
        key: 'rzp_test_demo',
        demo: true,
      });
    }
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
    });
    res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    // Demo mode: skip verification
    if (razorpay_order_id?.startsWith('order_demo_')) {
      return res.json({ success: true, verified: true });
    }
    const generated = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (generated !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
    res.json({ success: true, verified: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
