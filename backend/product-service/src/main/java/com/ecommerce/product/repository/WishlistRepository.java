package com.ecommerce.product.repository;

import com.ecommerce.product.model.WishlistItem;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import java.util.List;
import java.util.stream.Collectors;

public class WishlistRepository {
    private static final String TABLE_NAME = "L_WishlistTable";
    private final DynamoDbTable<WishlistItem> table;

    public WishlistRepository() {
        DynamoDbClient client = DynamoDbClient.create();
        DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(client)
                .build();
        this.table = enhancedClient.table(TABLE_NAME, TableSchema.fromBean(WishlistItem.class));
    }

    public void save(WishlistItem item) {
        table.putItem(item);
    }

    public void delete(String userId, String productId) {
        Key key = Key.builder()
                .partitionValue(userId)
                .sortValue(productId)
                .build();
        table.deleteItem(key);
    }

    public List<WishlistItem> getWishlistByUserId(String userId) {
        Key key = Key.builder().partitionValue(userId).build();
        return table.query(r -> r.queryConditional(QueryConditional.keyEqualTo(key)))
                .items()
                .stream()
                .collect(Collectors.toList());
    }
}
