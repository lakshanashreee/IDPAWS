package com.ecommerce.payment.repository;

import com.ecommerce.payment.model.Payment;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemResponse;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Data access layer for L_PaymentTable using AWS SDK for Java v2.
 *
 * NOTE: This class does not create the DynamoDB table. Table provisioning
 * is handled outside of this codebase (see README.md).
 */
public class PaymentRepository {

    private final DynamoDbClient dynamoDbClient;
    private final String tableName;

    public PaymentRepository() {
        this.dynamoDbClient = DynamoDbClient.builder().build();
        this.tableName = System.getenv("PAYMENT_TABLE") != null
                ? System.getenv("PAYMENT_TABLE")
                : "L_PaymentTable";
    }

    public PaymentRepository(DynamoDbClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
        this.tableName = System.getenv("PAYMENT_TABLE") != null
                ? System.getenv("PAYMENT_TABLE")
                : "L_PaymentTable";
    }

    public void savePayment(Payment payment) {
        PutItemRequest request = PutItemRequest.builder()
                .tableName(tableName)
                .item(toItem(payment))
                .build();
        dynamoDbClient.putItem(request);
    }

    public Payment getPaymentById(String paymentId) {
        GetItemRequest request = GetItemRequest.builder()
                .tableName(tableName)
                .key(Map.of("paymentId", AttributeValue.builder().s(paymentId).build()))
                .build();

        GetItemResponse response = dynamoDbClient.getItem(request);
        if (response.item() == null || response.item().isEmpty()) {
            return null;
        }
        return fromItem(response.item());
    }

    public List<Payment> getAllPayments() {
        List<Payment> payments = new ArrayList<>();
        Map<String, AttributeValue> lastEvaluatedKey = null;

        do {
            ScanRequest.Builder scanRequestBuilder = ScanRequest.builder().tableName(tableName);
            if (lastEvaluatedKey != null && !lastEvaluatedKey.isEmpty()) {
                scanRequestBuilder.exclusiveStartKey(lastEvaluatedKey);
            }

            ScanResponse response = dynamoDbClient.scan(scanRequestBuilder.build());
            for (Map<String, AttributeValue> item : response.items()) {
                payments.add(fromItem(item));
            }
            lastEvaluatedKey = response.lastEvaluatedKey();
        } while (lastEvaluatedKey != null && !lastEvaluatedKey.isEmpty());

        return payments;
    }

    /**
     * Returns all payments for a given orderId. Uses a Scan with an
     * in-application filter for now — a GSI on orderId is not required per
     * spec, but would be the natural optimization if this table grows large.
     */
    public List<Payment> getPaymentsByOrderId(String orderId) {
        List<Payment> all = getAllPayments();
        List<Payment> matches = new ArrayList<>();
        for (Payment payment : all) {
            if (payment.getOrderId() != null && payment.getOrderId().equals(orderId)) {
                matches.add(payment);
            }
        }
        return matches;
    }

    public void updatePayment(Payment payment) {
        // Full overwrite of the item; paymentId (partition key) stays constant.
        PutItemRequest request = PutItemRequest.builder()
                .tableName(tableName)
                .item(toItem(payment))
                .build();
        dynamoDbClient.putItem(request);
    }

    private Map<String, AttributeValue> toItem(Payment payment) {
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("paymentId", AttributeValue.builder().s(payment.getPaymentId()).build());
        item.put("orderId", AttributeValue.builder().s(nullSafe(payment.getOrderId())).build());
        item.put("userId", AttributeValue.builder().s(nullSafe(payment.getUserId())).build());
        item.put("amount", AttributeValue.builder().n(String.valueOf(payment.getAmount())).build());
        item.put("paymentMode", AttributeValue.builder().s(nullSafe(payment.getPaymentMode())).build());
        item.put("paymentStatus", AttributeValue.builder().s(nullSafe(payment.getPaymentStatus())).build());
        item.put("transactionTime", AttributeValue.builder().s(nullSafe(payment.getTransactionTime())).build());
        return item;
    }

    private Payment fromItem(Map<String, AttributeValue> item) {
        Payment payment = new Payment();
        payment.setPaymentId(getString(item, "paymentId"));
        payment.setOrderId(getString(item, "orderId"));
        payment.setUserId(getString(item, "userId"));

        AttributeValue amountAttr = item.get("amount");
        payment.setAmount(amountAttr != null && amountAttr.n() != null ? Double.parseDouble(amountAttr.n()) : 0.0);

        payment.setPaymentMode(getString(item, "paymentMode"));
        payment.setPaymentStatus(getString(item, "paymentStatus"));
        payment.setTransactionTime(getString(item, "transactionTime"));

        return payment;
    }

    private String getString(Map<String, AttributeValue> item, String key) {
        AttributeValue value = item.get(key);
        return value != null ? value.s() : null;
    }

    private String nullSafe(String value) {
        return value != null ? value : "";
    }
}
