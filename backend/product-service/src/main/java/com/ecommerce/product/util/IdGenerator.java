package com.ecommerce.product.util;

import java.util.UUID;

/**
 * Generates productId values in the form: PROD-<epochMillis>-<shortUuid>
 */
public final class IdGenerator {

    private IdGenerator() {
    }

    public static String generateProductId() {
        long timestamp = System.currentTimeMillis();
        String shortUuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        return "PROD-" + timestamp + "-" + shortUuid;
    }

    public static String generateCategoryId() {
        long timestamp = System.currentTimeMillis();
        String shortUuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        return "CAT-" + timestamp + "-" + shortUuid;
    }
}
