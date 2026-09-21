import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { Order, OrderDocument } from './entities/order.entity.js';
import { Payment, PaymentDocument } from './entities/payment.entity.js';
import { Course, CourseDocument } from '../courses/entities/course.entity.js';
import { Enrollment, EnrollmentDocument } from '../enrollments/entities/enrollment.entity.js';
import { OrderStatus, PaymentStatus, EnrollmentStatus } from '../common/constants/enums.js';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: Model<EnrollmentDocument>,
    private readonly configService: ConfigService,
  ) {}

  async createOrder(userId: string, courseId: string) {
    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    if (Number(course.price) === 0) {
      throw new BadRequestException('This course is free. Use the enrollment endpoint.');
    }

    const existingEnrollment = await this.enrollmentModel.findOne({
      userId,
      courseId,
    });
    if (existingEnrollment) {
      throw new BadRequestException('You are already enrolled in this course');
    }

    const amount = Math.round(Number(course.price) * 100); // Convert to paise
    let razorpayOrderId = `dev_order_${Date.now()}`;

    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (keyId && keySecret) {
      try {
        const Razorpay = (await import('razorpay')).default;
        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const rzpOrder = await razorpay.orders.create({
          amount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        });
        razorpayOrderId = rzpOrder.id;
      } catch {
        // Fall back to dev mode
      }
    }

    const order = await this.orderModel.create({
      userId,
      courseId,
      amount: course.price,
      currency: 'INR',
      razorpayOrderId,
      status: OrderStatus.PENDING,
    });

    const orderId = order.id || order._id.toString();

    return {
      orderId,
      razorpayOrderId,
      amount,
      currency: 'INR',
      keyId: keyId || '',
    };
  }

  async verifyPayment(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const order = await this.orderModel.findOne({
      razorpayOrderId: data.razorpayOrderId,
    });
    if (!order) throw new NotFoundException('Order not found');

    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (keySecret) {
      const expectedSignature = createHmac('sha256', keySecret)
        .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
        .digest('hex');

      if (expectedSignature !== data.razorpaySignature) {
        order.status = OrderStatus.FAILED;
        await order.save();
        throw new BadRequestException('Payment verification failed');
      }
    }

    // Mark order as completed
    order.status = OrderStatus.COMPLETED;
    await order.save();

    const orderId = order.id || order._id.toString();

    // Create payment record
    await this.paymentModel.create({
      orderId,
      razorpayPaymentId: data.razorpayPaymentId,
      razorpaySignature: data.razorpaySignature,
      amount: order.amount,
      currency: order.currency,
      status: PaymentStatus.COMPLETED,
    });

    // Create enrollment
    const existingEnrollment = await this.enrollmentModel.findOne({
      userId: order.userId,
      courseId: order.courseId,
    });

    if (!existingEnrollment) {
      await this.enrollmentModel.create({
        userId: order.userId,
        courseId: order.courseId,
        status: EnrollmentStatus.ACTIVE,
      });
      await this.courseModel.findByIdAndUpdate(order.courseId, { $inc: { enrollmentCount: 1 } });
    }

    return { message: 'Payment verified and enrollment created successfully' };
  }

  async getUserOrders(userId: string, page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.orderModel
        .find({ userId })
        .populate('course')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments({ userId }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
