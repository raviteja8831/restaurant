const jwt = require('jsonwebtoken');

module.exports = (app) => {
  const router = require("express").Router();

  // Debug route to test JWT secret and token validation
  router.get('/jwt-test', (req, res) => {
    try {
      // Load environment variables
      require('dotenv').config();

      const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

      // Test token generation
      const testPayload = { id: 1, role: 'test', phone: '1234567890' };
      const testToken = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '7d' });

      // Test token verification
      const decoded = jwt.verify(testToken, JWT_SECRET);

      res.json({
        success: true,
        message: 'JWT working correctly',
        environment: {
          JWT_SECRET_EXISTS: !!process.env.JWT_SECRET,
          JWT_SECRET_VALUE: process.env.JWT_SECRET || 'Using fallback',
          NODE_ENV: process.env.NODE_ENV || 'Not set'
        },
        test: {
          generated_token: testToken.substring(0, 50) + '...',
          decoded_payload: decoded,
          token_valid: true
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        JWT_SECRET_EXISTS: !!process.env.JWT_SECRET
      });
    }
  });

  // Debug route to test authorization header parsing
  router.get('/auth-test', (req, res) => {
    const authHeader = req.headers.authorization;

    let tokenInfo = {
      header_exists: !!authHeader,
      header_value: authHeader,
      token_extracted: null,
      token_valid: false,
      decoded_payload: null,
      error: null
    };

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      tokenInfo.token_extracted = token ? token.substring(0, 50) + '...' : 'Failed to extract';

      if (token) {
        try {
          require('dotenv').config();
          const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';
          const decoded = jwt.verify(token, JWT_SECRET);
          tokenInfo.token_valid = true;
          tokenInfo.decoded_payload = decoded;
        } catch (error) {
          tokenInfo.error = error.message;
        }
      }
    }

    res.json({
      success: true,
      message: 'Authorization header test',
      token_info: tokenInfo
    });
  });

  app.use("/api/debug", router);
};