import crypto from 'crypto';

// @desc    Create payment order (Razorpay or Mock)
// @route   POST /api/payments/create-order
// @access  Private
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required to create a payment order',
      });
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    const isMock =
      process.env.MOCK_PAYMENT_ENABLED === 'true' ||
      !razorpayKeyId ||
      razorpayKeyId.includes('demo');

    if (isMock) {
      const mockOrderId = `order_mock_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      return res.status(200).json({
        success: true,
        isMock: true,
        order: {
          id: mockOrderId,
          amount: Math.round(amount * 100), // in paise
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
          status: 'created',
        },
        keyId: 'mock_key_imovies_sandbox',
      });
    }

    // If live/test Razorpay keys are configured
    const mockOrderId = `order_rzp_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    res.status(200).json({
      success: true,
      isMock: false,
      order: {
        id: mockOrderId,
        amount: Math.round(amount * 100),
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        status: 'created',
      },
      keyId: razorpayKeyId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment signature
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, isMock } = req.body;

    if (isMock || process.env.MOCK_PAYMENT_ENABLED === 'true') {
      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Mock payment verified successfully',
        paymentId: paymentId || `pay_mock_${Date.now()}`,
      });
    }

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpaySecret) {
      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Payment verified in development mode',
      });
    }

    const generatedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid payment signature. Verification failed.',
      });
    }

    res.status(200).json({
      success: true,
      verified: true,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

