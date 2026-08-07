package com.ecommerce.payment.handler;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SQSEvent;
import com.ecommerce.payment.dto.PaymentResponse;
import com.ecommerce.payment.model.OrderPlacedEvent;
import com.ecommerce.payment.service.PaymentService;
import com.ecommerce.payment.util.JsonUtil;

/**
 * Lambda entry point for the Payment Service's SQS-driven event consumer.
 *
 * Lambda name: L_PaymentEventService
 * Handler: com.ecommerce.payment.handler.PaymentEventHandler::handleRequest
 *
 * This Lambda is triggered by an SQS queue (e.g. PaymentQueue) that is
 * itself subscribed to the Order Service's SNS topic. It consumes
 * OrderPlaced events and creates a Payment record for each one.
 *
 * This is the ONLY normal path by which Payment records are created —
 * there is no public "create payment" HTTP route (see PaymentHandler).
 *
 * Per spec: if one message in the batch fails to process, the error is
 * logged and processing continues with the remaining records — a single
 * bad message does not fail the whole batch.
 */
public class PaymentEventHandler implements RequestHandler<SQSEvent, Void> {

    private final PaymentService paymentService;

    public PaymentEventHandler() {
        this.paymentService = new PaymentService();
    }

    public PaymentEventHandler(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @Override
    public Void handleRequest(SQSEvent event, Context context) {
        LambdaLogger logger = context.getLogger();

        if (event == null || event.getRecords() == null) {
            logger.log("Received empty SQS event, nothing to process");
            return null;
        }

        for (SQSEvent.SQSMessage message : event.getRecords()) {
            String messageId = message.getMessageId();
            try {
                String body = message.getBody();
                OrderPlacedEvent orderPlacedEvent = JsonUtil.fromJson(body, OrderPlacedEvent.class);

                PaymentResponse payment = paymentService.createPaymentFromOrderEvent(orderPlacedEvent);

                logger.log("Successfully processed OrderPlaced event for orderId="
                        + payment.getOrderId() + ", created paymentId=" + payment.getPaymentId()
                        + " (sqsMessageId=" + messageId + ")");

            } catch (Exception e) {
                // Log and continue with the next record instead of letting
                // one bad message fail the whole batch.
                logger.log("Failed to process SQS message (messageId=" + messageId + "): " + e.getMessage());
            }
        }

        return null;
    }
}
