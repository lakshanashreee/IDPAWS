package com.ecommerce.cart.repository;

import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.model.CartItem;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.DeleteItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemResponse;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Data access layer for L_CartTable using AWS SDK for Java v2.
 *
 * One item per userId. The "items" attribute is stored as a DynamoDB List
 * of Maps (L of M), one map per CartItem.
 *
 * NOTE: This class does not create the DynamoDB table. Table provisioning
 * is handled outside of this codebase (see README.md).
 */
public class CartRepository {

    private final DynamoDbClient dynamoDbClient;
    private final String tableName;

    public CartRepository() {
        this.dynamoDbClient = DynamoDbClient.builder().build();
        this.tableName = System.getenv("CART_TABLE") != null
                ? System.getenv("CART_TABLE")
                : "L_CartTable";
    }

    public CartRepository(DynamoDbClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
        this.tableName = System.getenv("CART_TABLE") != null
                ? System.getenv("CART_TABLE")
                : "L_CartTable";
    }

    public void saveCart(Cart cart) {
        PutItemRequest request = PutItemRequest.builder()
                .tableName(tableName)
                .item(toItem(cart))
                .build();
        dynamoDbClient.putItem(request);
    }

    public Cart getCartByUserId(String userId) {
        GetItemRequest request = GetItemRequest.builder()
                .tableName(tableName)
                .key(Map.of("userId", AttributeValue.builder().s(userId).build()))
                .build();

        GetItemResponse response = dynamoDbClient.getItem(request);
        if (response.item() == null || response.item().isEmpty()) {
            return null;
        }
        return fromItem(response.item());
    }

    public void deleteCart(String userId) {
        DeleteItemRequest request = DeleteItemRequest.builder()
                .tableName(tableName)
                .key(Map.of("userId", AttributeValue.builder().s(userId).build()))
                .build();
        dynamoDbClient.deleteItem(request);
    }

    private Map<String, AttributeValue> toItem(Cart cart) {
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("userId", AttributeValue.builder().s(cart.getUserId()).build());

        List<AttributeValue> itemList = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            itemList.add(AttributeValue.builder().m(toItemMap(cartItem)).build());
        }
        item.put("items", AttributeValue.builder().l(itemList).build());

        return item;
    }

    private Map<String, AttributeValue> toItemMap(CartItem cartItem) {
        Map<String, AttributeValue> map = new HashMap<>();
        map.put("productId", AttributeValue.builder().s(nullSafe(cartItem.getProductId())).build());
        map.put("productName", AttributeValue.builder().s(nullSafe(cartItem.getProductName())).build());
        map.put("price", AttributeValue.builder().n(String.valueOf(cartItem.getPrice())).build());
        map.put("quantity", AttributeValue.builder().n(String.valueOf(cartItem.getQuantity())).build());
        map.put("updatedAt", AttributeValue.builder().s(nullSafe(cartItem.getUpdatedAt())).build());
        return map;
    }

    private Cart fromItem(Map<String, AttributeValue> item) {
        Cart cart = new Cart();
        cart.setUserId(getString(item, "userId"));

        List<CartItem> items = new ArrayList<>();
        AttributeValue itemsAttr = item.get("items");
        if (itemsAttr != null && itemsAttr.l() != null) {
            for (AttributeValue itemValue : itemsAttr.l()) {
                items.add(fromItemMap(itemValue.m()));
            }
        }
        cart.setItems(items);

        return cart;
    }

    private CartItem fromItemMap(Map<String, AttributeValue> map) {
        CartItem cartItem = new CartItem();
        cartItem.setProductId(getString(map, "productId"));
        cartItem.setProductName(getString(map, "productName"));

        AttributeValue priceAttr = map.get("price");
        cartItem.setPrice(priceAttr != null && priceAttr.n() != null ? Double.parseDouble(priceAttr.n()) : 0.0);

        AttributeValue quantityAttr = map.get("quantity");
        cartItem.setQuantity(quantityAttr != null && quantityAttr.n() != null ? Integer.parseInt(quantityAttr.n()) : 0);

        cartItem.setUpdatedAt(getString(map, "updatedAt"));
        return cartItem;
    }

    private String getString(Map<String, AttributeValue> item, String key) {
        AttributeValue value = item.get(key);
        return value != null ? value.s() : null;
    }

    private String nullSafe(String value) {
        return value != null ? value : "";
    }
}
