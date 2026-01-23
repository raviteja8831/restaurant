// RazorpayPaymentService.js
// Frontend Payment Integration Examples

import axios from 'axios';
import RazorpayCheckout from 'react-native-razorpay';
import { Alert } from 'react-native';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class RazorpayPaymentService {
  /**
   * Initialize a payment order
   */
  static async initializePayment(restaurantId, orderId, amount, description) {
    try {
      console.log('📋 Initializing payment order...', {
        restaurantId,
        orderId,
        amount,
      });

      const response = await axios.post(`${API_BASE_URL}/razorpay/create-order`, {
        restaurantId,
        orderId,
        amount,
        description: description || `Order #${orderId}`,
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      console.log('✅ Order created:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error initializing payment:', error);
      throw error;
    }
  }

  /**
   * Open Razorpay checkout modal
   */
  static async openCheckout(orderData, userDetails) {
    return new Promise((resolve, reject) => {
      try {
        const options = {
          // Razorpay Configuration
          key: orderData.razorpayKeyId,
          amount: Math.round(orderData.amount * 100), // Convert to paise
          currency: 'INR',
          order_id: orderData.razorpayOrderId,

          // Merchant Details
          name: 'Menutha',
          description: `Order #${orderData.orderId} - ${orderData.amount} INR`,
          image: 'https://your-logo-url.png',

          // User Prefill (optional but recommended)
          prefill: {
            name: userDetails.name || 'Customer',
            email: userDetails.email || '',
            contact: userDetails.phone || '',
          },

          // Payment Methods to show
          method: {
            card: true,
            netbanking: true,
            wallet: true,
            upi: true,
          },

          // Commission Information (for reference)
          notes: {
            restaurantId: orderData.restaurantId,
            orderId: orderData.orderId,
            commission: orderData.commission,
            hasSubscription: orderData.hasSubscription,
          },

          // Callbacks
          handler: (response) => {
            console.log('✅ Payment successful!', response);
            resolve(response);
          },

          modal: {
            ondismiss: () => {
              console.log('❌ User dismissed payment modal');
              reject(new Error('Payment cancelled by user'));
            },
          },
        };

        console.log('🔓 Opening Razorpay checkout...', options);
        RazorpayCheckout.open(options);
      } catch (error) {
        console.error('❌ Error opening checkout:', error);
        reject(error);
      }
    });
  }

  /**
   * Verify payment on backend
   */
  static async verifyPayment(razorpayOrderId, razorpayPaymentId, signature) {
    try {
      console.log('🔐 Verifying payment signature...');

      const response = await axios.post(
        `${API_BASE_URL}/razorpay/verify-payment`,
        {
          razorpayOrderId,
          razorpayPaymentId,
          signature,
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      console.log('✅ Payment verified successfully!', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Handle payment failure
   */
  static async reportPaymentFailure(razorpayOrderId, errorCode, errorDescription) {
    try {
      console.log('❌ Reporting payment failure...', {
        razorpayOrderId,
        errorCode,
        errorDescription,
      });

      const response = await axios.post(`${API_BASE_URL}/razorpay/payment-failed`, {
        razorpayOrderId,
        errorCode,
        errorDescription,
      });

      console.log('Payment failure recorded:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error reporting payment failure:', error);
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  static async getTransactionDetails(transactionId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/razorpay/transaction/${transactionId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      throw error;
    }
  }

  /**
   * Get restaurant transactions
   */
  static async getRestaurantTransactions(restaurantId, filters = {}) {
    try {
      let url = `${API_BASE_URL}/razorpay/restaurant/${restaurantId}/transactions`;

      // Add query parameters
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(paymentId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/razorpay/payment/${paymentId}/status`
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  }
}

export default RazorpayPaymentService;

// ============================================
// USAGE EXAMPLE IN REACT COMPONENT
// ============================================

/*
import RazorpayPaymentService from './services/RazorpayPaymentService';

function CheckoutScreen({ orderId, restaurantId, amount, userEmail, userPhone, userName }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      // Step 1: Initialize payment
      const order = await RazorpayPaymentService.initializePayment(
        restaurantId,
        orderId,
        amount,
        `Order #${orderId} - ₹${amount}`
      );

      setOrderData(order);

      // Show commission info if no subscription
      if (!order.hasSubscription) {
        Alert.alert(
          'Commission Info',
          `App Fee: ₹${order.commission.toFixed(2)} (2.5% commission)`
        );
      } else {
        Alert.alert(
          'Subscription Benefit',
          'No commission charged - Active subscription!'
        );
      }

      // Step 2: Open checkout
      const paymentResponse = await RazorpayPaymentService.openCheckout(
        order,
        {
          name: userName,
          email: userEmail,
          phone: userPhone,
        }
      );

      // Step 3: Verify payment
      const verificationResult = await RazorpayPaymentService.verifyPayment(
        paymentResponse.razorpay_order_id,
        paymentResponse.razorpay_payment_id,
        paymentResponse.razorpay_signature
      );

      // Success!
      Alert.alert('Success', 'Payment completed successfully!');
      
      // Navigate to order confirmation
      navigation.navigate('OrderConfirmation', {
        orderId: orderId,
        transactionId: verificationResult.transactionId,
      });

    } catch (error) {
      console.error('Payment error:', error);

      // Attempt to report failure if we have order data
      if (orderData && error.razorpay_order_id) {
        await RazorpayPaymentService.reportPaymentFailure(
          error.razorpay_order_id,
          error.code || 'PAYMENT_FAILED',
          error.description || error.message
        );
      }

      Alert.alert('Payment Failed', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View>
      <Text>Order Amount: ₹{amount}</Text>
      <Text>Restaurant: {restaurantId}</Text>
      <Button
        title="Pay Now"
        onPress={handlePayment}
        disabled={isProcessing}
      />
    </View>
  );
}

export default CheckoutScreen;
*/

// ============================================
// USAGE EXAMPLE: DISPLAYING COMMISSION INFO
// ============================================

/*
function PaymentSummary({ orderData }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Summary</Text>
      
      <View style={styles.amountRow}>
        <Text>Subtotal:</Text>
        <Text>₹{orderData.amount}</Text>
      </View>

      {!orderData.hasSubscription && (
        <View style={styles.commissionRow}>
          <Text style={styles.commissionLabel}>
            App Fee (2.5%):
          </Text>
          <Text style={styles.commissionValue}>
            ₹{orderData.commission.toFixed(2)}
          </Text>
        </View>
      )}

      {orderData.hasSubscription && (
        <View style={styles.subscriptionBadge}>
          <Text style={styles.subscriptionText}>
            ✓ No Commission - Subscription Active!
          </Text>
        </View>
      )}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>₹{orderData.amount}</Text>
      </View>
    </View>
  );
}
*/

// ============================================
// USAGE EXAMPLE: RESTAURANT DASHBOARD
// ============================================

/*
function RestaurantDashboard({ restaurantId }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [restaurantId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await RazorpayPaymentService.getRestaurantTransactions(
        restaurantId,
        {
          status: 'completed',
          dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        }
      );

      setTransactions(data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text style={styles.header}>Recent Transactions</Text>
      
      <View style={styles.summaryCard}>
        <Text>Total Transactions: {data.summary.totalTransactions}</Text>
        <Text>Total Amount: ₹{data.summary.totalAmount}</Text>
        <Text>Total Commission: ₹{data.summary.totalCommission}</Text>
      </View>

      {transactions.map(transaction => (
        <View key={transaction.id} style={styles.transactionCard}>
          <Text>Order #{transaction.orderId}</Text>
          <Text>Amount: ₹{transaction.amount}</Text>
          <Text>Commission: ₹{transaction.commission}</Text>
          <Text>Status: {transaction.status}</Text>
        </View>
      ))}
    </View>
  );
}
*/

// ============================================
// UNIT TESTS
// ============================================

/*
import RazorpayPaymentService from './RazorpayPaymentService';

describe('RazorpayPaymentService', () => {
  describe('initializePayment', () => {
    test('should create order with correct parameters', async () => {
      const result = await RazorpayPaymentService.initializePayment(
        1, // restaurantId
        123, // orderId
        500, // amount
        'Test Order'
      );

      expect(result).toHaveProperty('razorpayOrderId');
      expect(result).toHaveProperty('commission');
      expect(result).toHaveProperty('hasSubscription');
    });

    test('should calculate commission correctly for non-subscribed restaurant', async () => {
      const result = await RazorpayPaymentService.initializePayment(
        1, 123, 1000, 'Test'
      );

      if (!result.hasSubscription) {
        expect(result.commission).toBe(25); // 2.5% of 1000
      }
    });
  });

  describe('verifyPayment', () => {
    test('should verify payment with correct signature', async () => {
      // Mock payment data
      const result = await RazorpayPaymentService.verifyPayment(
        'order_xxx',
        'pay_xxx',
        'signature_xxx'
      );

      expect(result).toHaveProperty('transactionId');
      expect(result.status).toBe('completed');
    });
  });
});
*/
