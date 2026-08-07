package com.ecommerce.order.repository;

import com.ecommerce.order.model.Order;
import com.ecommerce.order.model.OrderItem;
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
 * Data access layer for L_OrderTable using AWS SDK for Java v2.
 *
 * The "items" attribute is stored as a DynamoDB List of Maps (L of M),
 * one map per OrderItem.
 *
 * NOTE: This class does not create the DynamoDB table. Table provisioning
 * is handled outside of this codebase (see README.md).
 */
public class OrderRepository {

    private final DynamoDbClient dynamoDbClient;
    private final String tableName;

    public OrderRepository() {
        this.dynamoDbClient = DynamoDbClient.builder().build();
        this.tableName = System.getenv("ORDER_TABLE") != null
                ? System.getenv("ORDER_TABLE")
                : "L_OrderTable";
    }

    public OrderRepository(DynamoDbClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
        this.tableName = System.getenv("ORDER_TABLE") != null
                ? System.getenv("ORDER_TABLE")
                : "L_OrderTable";
    }

    public void saveOrder(Order order) {
        PutItemRequest request = PutItemRequest.builder()
                .tableName(tableName)
                .item(toItem(order))
                .build();
        dynamoDbClient.putItem(request);
    }

    public Order getOrderById(String orderId) {
        GetItemRequest request = GetItemRequest.builder()
                .tableName(tableName)
                .key(Map.of("orderId", AttributeValue.builder().s(orderId).build()))
                .build();

        GetItemResponse response = dynamoDbClient.getItem(request);
        if (response.item() == null || response.item().isEmpty()) {
            return null;
        }
        return fromItem(response.item());
    }

    public List<Order> getAllOrders() {
        List<Order> orders = new ArrayList<>();
        Map<String, AttributeValue> lastEvaluatedKey = null;

        do {
            ScanRequest.Builder scanRequestBuilder = ScanRequest.builder().tableName(tableName);
            if (lastEvaluatedKey != null && !lastEvaluatedKey.isEmpty()) {
                scanRequestBuilder.exclusiveStartKey(lastEvaluatedKey);
            }

            ScanResponse response = dynamoDbClient.scan(scanRequestBuilder.build());
            for (Map<String, AttributeValue> item : response.items()) {
                orders.add(fromItem(item));
            }
            lastEvaluatedKey = response.lastEvaluatedKey();
        } while (lastEvaluatedKey != null && !lastEvaluatedKey.isEmpty());

        return orders;
    }

    /**
     * Returns all orders belonging to a given userId. Uses a Scan with an
     * in-application filter for now — a GSI on userId is not required per
     * spec, but would be the natural optimization if this table grows large.
     */
    public List<Order> getOrdersByUserId(String userId) {
        List<Order> all = getAllOrders();
        List<Order> matches = new ArrayList<>();
        for (Order order : all) {
            if (order.getUserId() != null && order.getUserId().equals(userId)) {
                matches.add(order);
            }
        }
        return matches;
    }

    public void updateOrder(Order order) {
        // Full overwrite of the item; orderId (partition key) stays constant.
        PutItemRequest request = PutItemRequest.builder()
                .tableName(tableName)
                .item(toItem(order))
                .build();
        dynamoDbClient.putItem(request);
    }

    public void deleteOrder(String orderId) {
        DeleteItemRequest request = DeleteItemRequest.builder()
                .tableName(tableName)
                .key(Map.of("orderId", AttributeValue.builder().s(orderId).build()))
                .build();
        dynamoDbClient.deleteItem(request);
    }

    private Map<String, AttributeValue> toItem(Order order) {
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("orderId", AttributeValue.builder().s(order.getOrderId()).build());
        item.put("userId", AttributeValue.builder().s(nullSafe(order.getUserId())).build());

        List<AttributeValue> itemList = new ArrayList<>();
        for (OrderItem orderItem : order.getItems()) {
            itemList.add(AttributeValue.builder().m(toItemMap(orderItem)).build());
        }
        item.put("items", AttributeValue.builder().l(itemList).build());

        item.put("totalAmount", AttributeValue.builder().n(String.valueOf(order.getTotalAmount())).build());
        item.put("status", AttributeValue.builder().s(nullSafe(order.getStatus())).build());
        item.put("paymentMode", AttributeValue.builder().s(nullSafe(order.getPaymentMode())).build());
        item.put("createdAt", AttributeValue.builder().s(nullSafe(order.getCreatedAt())).build());
        item.put("updatedAt", AttributeValue.builder().s(nullSafe(order.getUpdatedAt())).build());

        return item;
    }

    private Map<String, AttributeValue> toItemMap(OrderItem orderItem) {
        Map<String, AttributeValue> map = new HashMap<>();
        map.put("productId", AttributeValue.builder().s(nullSafe(orderItem.getProductId())).build());
        map.put("productName", AttributeValue.builder().s(nullSafe(orderItem.getProductName())).build());
        map.put("price", AttributeValue.builder().n(String.valueOf(orderItem.getPrice())).build());
        map.put("quantity", AttributeValue.builder().n(String.valueOf(orderItem.getQuantity())).build());
        return map;
    }

    private Order fromItem(Map<String, AttributeValue> item) {
        Order order = new Order();
        order.setOrderId(getString(item, "orderId"));
        order.setUserId(getString(item, "userId"));

        List<OrderItem> items = new ArrayList<>();
        AttributeValue itemsAttr = item.get("items");
        if (itemsAttr != null && itemsAttr.l() != null) {
            for (AttributeValue itemValue : itemsAttr.l()) {
                items.add(fromItemMap(itemValue.m()));
            }
        }
        order.setItems(items);

        AttributeValue totalAmountAttr = item.get("totalAmount");
        order.setTotalAmount(totalAmountAttr != null && totalAmountAttr.n() != null
                ? Double.parseDouble(totalAmountAttr.n())
                : 0.0);

        order.setStatus(getString(item, "status"));
        order.setPaymentMode(getString(item, "paymentMode"));
        order.setCreatedAt(getString(item, "createdAt"));
        order.setUpdatedAt(getString(item, "updatedAt"));

        return order;
    }

    private OrderItem fromItemMap(Map<String, AttributeValue> map) {
        OrderItem orderItem = new OrderItem();
        orderItem.setProductId(getString(map, "productId"));
        orderItem.setProductName(getString(map, "productName"));

        AttributeValue priceAttr = map.get("price");
        orderItem.setPrice(priceAttr != null && priceAttr.n() != null ? Double.parseDouble(priceAttr.n()) : 0.0);

        AttributeValue quantityAttr = map.get("quantity");
        orderItem.setQuantity(quantityAttr != null && quantityAttr.n() != null ? Integer.parseInt(quantityAttr.n()) : 0);

        return orderItem;
    }

    private String getString(Map<String, AttributeValue> item, String key) {
        AttributeValue value = item.get(key);
        return value != null ? value.s() : null;
    }

    private String nullSafe(String value) {
        return value != null ? value : "";
    }
}
