package com.ecommerce.order.util;

import java.util.UUID;

/**
 * Generates orderId values in the form: ORD-<epochMillis>-<shortUuid>
 */
public final class IdGenerator {

    private IdGenerator() {
    }

    public static String generateOrderId() {
        long timestamp = System.currentTimeMillis();
        String shortUuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        return "ORD-" + timestamp + "-" + shortUuid;
    }
}
