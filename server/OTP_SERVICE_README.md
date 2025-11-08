# OTP Service Implementation with AWS SQS

This document describes the OTP service implementation for user and customer login authentication using AWS SQS.

## Overview

The OTP service provides secure authentication for:
- **User Login** (Restaurant Users/Managers/Chefs)
- **Customer Login** (App Customers)

OTP messages are queued using AWS SQS and can be sent via AWS SNS for SMS delivery.

## Architecture

```
Client → API → OTP Service → AWS SQS → (Worker) → AWS SNS → SMS
                    ↓
                Database (OTP Table)
```

## Configuration

### 1. Environment Variables

Update `/home/ec2-user/server/restaurant/server/.env` with your AWS credentials:

```env
# AWS Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# SQS Configuration
AWS_SQS_QUEUE_URL=https://sqs.ap-south-1.amazonaws.com/your-account-id/otp-queue

# SNS Configuration (for SMS)
AWS_SNS_SENDER_ID=MENUTHA

# OTP Configuration
OTP_EXPIRY_MINUTES=5
OTP_LENGTH=6
```

### 2. Database Setup

Run the migration to create the OTP table:

```bash
cd /home/ec2-user/server/restaurant/server
mysql -u admin -p restaurant_service < migrations/create_otp_table.sql
```

Or let Sequelize sync the model automatically when you start the server.

### 3. AWS Setup

#### Create SQS Queue:
1. Go to AWS SQS Console
2. Create a new queue named `otp-queue`
3. Copy the Queue URL and update `.env`

#### Configure SNS for SMS:
1. Go to AWS SNS Console
2. Enable SMS messaging in your region
3. Set spending limits if needed
4. Update sender ID in `.env`

## API Endpoints

### 1. Send OTP

**Endpoint:** `POST /api/otp/send`

**Request Body:**
```json
{
  "phone": "9876543210",
  "type": "USER_LOGIN"  // or "CUSTOMER_LOGIN" or "REGISTRATION"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresAt": "2025-10-29T10:35:00.000Z",
  "otpId": 123
}
```

**Response (Rate Limited):**
```json
{
  "success": false,
  "message": "Please wait 2 minutes before requesting a new OTP",
  "waitTime": 45
}
```

### 2. Verify OTP

**Endpoint:** `POST /api/otp/verify`

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456",
  "type": "USER_LOGIN"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "otpId": 123
}
```

**Response (Failed):**
```json
{
  "success": false,
  "message": "Invalid OTP. 2 attempt(s) remaining.",
  "remainingAttempts": 2
}
```

## Login Flow

### User Login (Restaurant Users)

1. **Request OTP:**
```bash
curl -X POST http://localhost:8090/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "type": "USER_LOGIN"}'
```

2. **Login with OTP:**
```bash
curl -X POST http://localhost:8090/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456"}'
```

**Response:**
```json
{
  "id": 1,
  "phone": "9876543210",
  "firstname": "John",
  "lastname": "Doe",
  "role": { "id": 1, "name": "manager" },
  "restaurant": { "id": 1, "name": "Test Restaurant" },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Customer Login

1. **Request OTP:**
```bash
curl -X POST http://localhost:8090/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "type": "CUSTOMER_LOGIN"}'
```

2. **Login with OTP:**
```bash
curl -X POST http://localhost:8090/api/customers/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456"}'
```

## Security Features

1. **Rate Limiting:** Users must wait 2 minutes between OTP requests
2. **Expiry:** OTPs expire after 5 minutes (configurable)
3. **Max Attempts:** Maximum 3 verification attempts per OTP
4. **Auto Cleanup:** Expired OTPs are automatically cleaned up
5. **Type Validation:** OTPs are validated against their type (USER_LOGIN, CUSTOMER_LOGIN, etc.)

## Files Created

### Models
- `/app/models/otp.model.js` - OTP database model

### Services
- `/app/services/otp.service.js` - Core OTP logic (generate, send, verify)
- `/app/services/sqs.service.js` - AWS SQS integration
- `/app/services/sns.service.js` - AWS SNS SMS integration

### Controllers
- `/app/controllers/otp.controller.js` - OTP API endpoints

### Routes
- `/app/routes/otp.routes.js` - OTP route definitions

### Updated Files
- `/app/controllers/user.controller.js` - User login now uses OTP verification
- `/app/controllers/customer.controller.js` - Customer login now uses OTP verification
- `/app/models/index.js` - Registered OTP model
- `/server.js` - Registered OTP routes

## Monitoring

The service includes comprehensive logging:
- `📤` OTP sent to SQS queue
- `📱` SMS sent via SNS
- `🔐` OTP generated
- `✅` OTP verified successfully
- `❌` Errors

Check server logs for OTP activity:
```bash
tail -f /var/log/server.log  # or wherever your logs are stored
```

## Testing

### Development Mode
For testing, you can check the OTP in the server logs (it's printed when generated):
```
🔐 Generated OTP for 9876543210: 123456 (ID: 1)
```

### Production Mode
In production, ensure AWS credentials are properly configured and SMS is working.

## Troubleshooting

### OTP not received
1. Check AWS credentials in `.env`
2. Verify SQS queue URL is correct
3. Check SNS SMS limits and spending
4. Verify phone number format (+91XXXXXXXXXX)

### Database errors
1. Ensure OTP table exists: `SHOW TABLES LIKE 'otp';`
2. Run migration if needed
3. Check Sequelize sync logs

### AWS errors
1. Verify IAM permissions for SQS and SNS
2. Check AWS region configuration
3. Ensure SQS queue exists
4. Verify SNS is enabled for your region

## Next Steps

1. **Create SQS Worker:** Create a separate worker process to consume messages from SQS and send SMS via SNS
2. **Add Rate Limiting:** Implement API rate limiting to prevent abuse
3. **Add Monitoring:** Set up CloudWatch alarms for OTP service
4. **Add Analytics:** Track OTP success/failure rates

## Support

For issues or questions, contact the development team.
