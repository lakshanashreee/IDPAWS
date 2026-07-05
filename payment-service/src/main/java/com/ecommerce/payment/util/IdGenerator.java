package com.ecommerce.payment.util;

import java.util.UUID;

/**
 * Generates paymentId values in the form: PAY-<epochMillis>-<shortUuid>
 */
public final class IdGenerator {

    private IdGenerator() {
    }

    public static String generatePaymentId() {
        long timestamp = System.currentTimeMillis();
        String shortUuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        return "PAY-" + timestamp + "-" + shortUuid;
    }
}
