import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentsService } from './payments.service.js';
import { OrderStatus } from '../common/constants/enums.js';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { createHmac } from 'crypto';

describe('PaymentsService', () => {
  let paymentsService: PaymentsService;
  let mockOrderModel: any;
  let mockPaymentModel: any;
  let mockCourseModel: any;
  let mockEnrollmentModel: any;
  let mockConfigService: any;

  const mockSecret = 'test_secret_key_123';

  beforeEach(() => {
    mockOrderModel = {
      findOne: vi.fn(),
      create: vi.fn((data) => Promise.resolve({ id: 'ord-uuid-1', ...data })),
    };

    mockPaymentModel = {
      create: vi.fn((data) => Promise.resolve({ id: 'pay-uuid-1', ...data })),
    };

    mockCourseModel = {
      findById: vi.fn(),
      findByIdAndUpdate: vi.fn().mockResolvedValue({}),
    };

    mockEnrollmentModel = {
      findOne: vi.fn(),
      create: vi.fn((data) => Promise.resolve({ id: 'enr-uuid-1', ...data })),
    };

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'RAZORPAY_KEY_ID') return 'rzp_test_key_123';
        if (key === 'RAZORPAY_KEY_SECRET') return mockSecret;
        return null;
      }),
    };

    paymentsService = new PaymentsService(
      mockOrderModel,
      mockPaymentModel,
      mockCourseModel,
      mockEnrollmentModel,
      mockConfigService,
    );
  });

  describe('createOrder', () => {
    it('should throw NotFoundException if course does not exist', async () => {
      mockCourseModel.findById.mockResolvedValue(null);

      await expect(
        paymentsService.createOrder('user-1', 'non-existent-course'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if course is free', async () => {
      mockCourseModel.findById.mockResolvedValue({ id: 'c-free', price: 0 });

      await expect(paymentsService.createOrder('user-1', 'c-free')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create order and return payload with paise conversion', async () => {
      mockCourseModel.findById.mockResolvedValue({ id: 'c-101', price: 89.99 });
      mockEnrollmentModel.findOne.mockResolvedValue(null);

      const result = await paymentsService.createOrder('user-1', 'c-101');

      expect(mockOrderModel.create).toHaveBeenCalled();
      expect(result.amount).toBe(8999); // 89.99 * 100
      expect(result.currency).toBe('INR');
      expect(result.orderId).toBe('ord-uuid-1');
    });
  });

  describe('verifyPayment', () => {
    it('should fail verification if signature does not match secret HMAC', async () => {
      const mockOrderDoc: any = {
        id: 'ord-uuid-1',
        razorpayOrderId: 'order_test_123',
        status: OrderStatus.PENDING,
        save: vi.fn().mockResolvedValue(true),
      };
      mockOrderModel.findOne.mockResolvedValue(mockOrderDoc);

      await expect(
        paymentsService.verifyPayment({
          razorpayOrderId: 'order_test_123',
          razorpayPaymentId: 'pay_test_456',
          razorpaySignature: 'invalid_tampered_signature_hex',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockOrderDoc.status).toBe(OrderStatus.FAILED);
      expect(mockOrderDoc.save).toHaveBeenCalled();
    });

    it('should succeed verification, mark order completed, and create enrollment with valid HMAC', async () => {
      const orderId = 'order_test_123';
      const paymentId = 'pay_test_456';
      const validSignature = createHmac('sha256', mockSecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const mockOrderDoc: any = {
        id: 'ord-uuid-1',
        userId: 'user-1',
        courseId: 'course-1',
        amount: 89.99,
        currency: 'INR',
        razorpayOrderId: orderId,
        status: OrderStatus.PENDING,
        save: vi.fn().mockResolvedValue(true),
      };
      mockOrderModel.findOne.mockResolvedValue(mockOrderDoc);
      mockEnrollmentModel.findOne.mockResolvedValue(null);

      const result = await paymentsService.verifyPayment({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature,
      });

      expect(result.message).toContain('Payment verified');
      expect(mockOrderDoc.status).toBe(OrderStatus.COMPLETED);
      expect(mockOrderDoc.save).toHaveBeenCalled();
      expect(mockEnrollmentModel.create).toHaveBeenCalled();
    });
  });
});
