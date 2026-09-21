import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { PaymentsService } from './payments.service.js';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Razorpay order' })
  async createOrder(@CurrentUser('id') userId: string, @Body() data: { courseId: string }) {
    return this.paymentsService.createOrder(userId, data.courseId);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify Razorpay payment' })
  async verifyPayment(@Body() data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    return this.paymentsService.verifyPayment(data);
  }

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user orders' })
  async getUserOrders(@CurrentUser('id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.paymentsService.getUserOrders(userId, page, limit);
  }
}
