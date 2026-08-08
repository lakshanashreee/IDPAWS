package com.ecommerce.inventory.repository;

import com.ecommerce.inventory.model.Inventory;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.DeleteItemRequest;
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
 * Data access layer for L_InventoryTable using AWS SDK for Java v2.
 *
 * NOTE: This class does not create the DynamoDB table. Table provisioning
 * is handled outside of this codebase (see README.md).
 */
public class InventoryRepository {

    private final DynamoDbClient dynamoDbClient;
    private final String tableName;

    public InventoryRepository() {
        this.dynamoDbClient = DynamoDbClient.builder().build();
        this.tableName = System.getenv("INVENTORY_TABLE") != null
                ? System.getenv("INVENTORY_TABLE")
                : "L_InventoryTable";
    }

    public InventoryRepository(DynamoDbClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
        this.tableName = System.getenv("INVENTORY_TABLE") != null
                ? System.getenv("INVENTORY_TABLE")
                : "L_InventoryTable";
    }

    public void saveInventory(Inventory inventory) {
        PutItemRequest request = PutItemRequest.builder()
                .tableName(tableName)
                .item(toItem(inventory))
                .build();
        dynamoDbClient.putItem(request);
    }

    public Inventory getInventoryById(String productId) {
        GetItemRequest request = GetItemRequest.builder()
                .tableName(tableName)
                .key(Map.of("productId", AttributeValue.builder().s(productId).build()))
                .build();

        GetItemResponse response = dynamoDbClient.getItem(request);
        if (response.item() == null || response.item().isEmpty()) {
            return null;
        }
        return fromItem(response.item());
    }

    public List<Inventory> getAllInventory() {
        List<Inventory> inventoryList = new ArrayList<>();
        Map<String, AttributeValue> lastEvaluatedKey = null;

        do {
            ScanRequest.Builder scanRequestBuilder = ScanRequest.builder().tableName(tableName);
            if (lastEvaluatedKey != null && !lastEvaluatedKey.isEmpty()) {
                scanRequestBuilder.exclusiveStartKey(lastEvaluatedKey);
            }

            ScanResponse response = dynamoDbClient.scan(scanRequestBuilder.build());
            for (Map<String, AttributeValue> item : response.items()) {
                inventoryList.add(fromItem(item));
            }
            lastEvaluatedKey = response.lastEvaluatedKey();
        } while (lastEvaluatedKey != null && !lastEvaluatedKey.isEmpty());

        return inventoryList;
    }

    public void updateInventory(Inventory inventory) {
        // Full overwrite of the item; productId (partition key) stays constant.
        PutItemRequest request = PutItemRequest.builder()
                .tableName(tableName)
                .item(toItem(inventory))
                .build();
        dynamoDbClient.putItem(request);
    }

    public void deleteInventory(String productId) {
        DeleteItemRequest request = DeleteItemRequest.builder()
                .tableName(tableName)
                .key(Map.of("productId", AttributeValue.builder().s(productId).build()))
                .build();
        dynamoDbClient.deleteItem(request);
    }

    private Map<String, AttributeValue> toItem(Inventory inventory) {
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("productId", AttributeValue.builder().s(inventory.getProductId()).build());
        item.put("availableQuantity", AttributeValue.builder().n(String.valueOf(inventory.getAvailableQuantity())).build());
        item.put("reservedQuantity", AttributeValue.builder().n(String.valueOf(inventory.getReservedQuantity())).build());
        item.put("lowStockThreshold", AttributeValue.builder().n(String.valueOf(inventory.getLowStockThreshold())).build());
        item.put("lastUpdated", AttributeValue.builder().s(nullSafe(inventory.getLastUpdated())).build());
        if (inventory.getNotifyEmails() != null && !inventory.getNotifyEmails().isEmpty()) {
            item.put("notifyEmails", AttributeValue.builder().ss(inventory.getNotifyEmails()).build());
        }
        item.put("notifyImageUrl", AttributeValue.builder().s(nullSafe(inventory.getNotifyImageUrl())).build());
        item.put("notifyProductName", AttributeValue.builder().s(nullSafe(inventory.getNotifyProductName())).build());
        return item;
    }

    private Inventory fromItem(Map<String, AttributeValue> item) {
        Inventory inventory = new Inventory();
        inventory.setProductId(getString(item, "productId"));
        inventory.setAvailableQuantity(getInt(item, "availableQuantity"));
        inventory.setReservedQuantity(getInt(item, "reservedQuantity"));
        inventory.setLowStockThreshold(getInt(item, "lowStockThreshold"));
        inventory.setLastUpdated(getString(item, "lastUpdated"));
        if (item.containsKey("notifyEmails") && item.get("notifyEmails").ss() != null) {
            inventory.setNotifyEmails(new java.util.HashSet<>(item.get("notifyEmails").ss()));
        }
        inventory.setNotifyImageUrl(getString(item, "notifyImageUrl"));
        inventory.setNotifyProductName(getString(item, "notifyProductName"));
        return inventory;
    }

    private String getString(Map<String, AttributeValue> item, String key) {
        AttributeValue value = item.get(key);
        return value != null ? value.s() : null;
    }

    private int getInt(Map<String, AttributeValue> item, String key) {
        AttributeValue value = item.get(key);
        return (value != null && value.n() != null) ? Integer.parseInt(value.n()) : 0;
    }

    private String nullSafe(String value) {
        return value != null ? value : "";
    }
}
