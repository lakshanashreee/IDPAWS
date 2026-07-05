package com.ecommerce.product.repository;

import com.ecommerce.product.model.Product;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.DeleteItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemResponse;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;
import software.amazon.awssdk.services.dynamodb.model.UpdateItemRequest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Data access layer for ProductsTable using AWS SDK for Java v2.
 *
 * NOTE: This class does not create the DynamoDB table. Table provisioning
 * is handled outside of this codebase (see README.md).
 */
public class ProductRepository {

    private final DynamoDbClient dynamoDbClient;
    private final String tableName;

    public ProductRepository() {
        this.dynamoDbClient = DynamoDbClient.builder().build();
        this.tableName = System.getenv("PRODUCTS_TABLE") != null
                ? System.getenv("PRODUCTS_TABLE")
                : "ProductsTable";
    }

    public ProductRepository(DynamoDbClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
        this.tableName = System.getenv("PRODUCTS_TABLE") != null
                ? System.getenv("PRODUCTS_TABLE")
                : "ProductsTable";
    }

    public void saveProduct(Product product) {
        PutItemRequest request = PutItemRequest.builder()
                .tableName(tableName)
                .item(toItem(product))
                .build();
        dynamoDbClient.putItem(request);
    }

    public Product getProductById(String productId) {
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

    public List<Product> getAllProducts() {
        List<Product> products = new ArrayList<>();
        Map<String, AttributeValue> lastEvaluatedKey = null;

        do {
            ScanRequest.Builder scanRequestBuilder = ScanRequest.builder().tableName(tableName);
            if (lastEvaluatedKey != null && !lastEvaluatedKey.isEmpty()) {
                scanRequestBuilder.exclusiveStartKey(lastEvaluatedKey);
            }

            ScanResponse response = dynamoDbClient.scan(scanRequestBuilder.build());
            for (Map<String, AttributeValue> item : response.items()) {
                products.add(fromItem(item));
            }
            lastEvaluatedKey = response.lastEvaluatedKey();
        } while (lastEvaluatedKey != null && !lastEvaluatedKey.isEmpty());

        return products;
    }

    public List<Product> getProductsByCategory(String category) {
        // Scan and filter in application code so category matching can be
        // performed case-insensitively without requiring a secondary index.
        List<Product> all = getAllProducts();
        List<Product> matches = new ArrayList<>();
        for (Product product : all) {
            if (product.getCategory() != null && product.getCategory().equalsIgnoreCase(category)) {
                matches.add(product);
            }
        }
        return matches;
    }

    public void updateProduct(Product product) {
        // Full overwrite of the item; productId (partition key) stays constant.
        PutItemRequest request = PutItemRequest.builder()
                .tableName(tableName)
                .item(toItem(product))
                .build();
        dynamoDbClient.putItem(request);
    }

    public void deleteProduct(String productId, String updatedAt) {
        // Soft delete: flip active to false instead of removing the item,
        // so downstream services (Cart, Order) never hit a missing productId.
        Map<String, AttributeValue> key = Map.of(
                "productId", AttributeValue.builder().s(productId).build()
        );

        Map<String, AttributeValue> expressionValues = new HashMap<>();
        expressionValues.put(":active", AttributeValue.builder().bool(false).build());
        expressionValues.put(":updatedAt", AttributeValue.builder().s(updatedAt).build());

        UpdateItemRequest request = UpdateItemRequest.builder()
                .tableName(tableName)
                .key(key)
                .updateExpression("SET active = :active, updatedAt = :updatedAt")
                .expressionAttributeValues(expressionValues)
                .build();

        dynamoDbClient.updateItem(request);
    }

    /**
     * Hard delete is intentionally not exposed via the service/handler layer
     * per the soft-delete requirement, but is kept here for completeness /
     * administrative use only.
     */
    public void hardDeleteProduct(String productId) {
        DeleteItemRequest request = DeleteItemRequest.builder()
                .tableName(tableName)
                .key(Map.of("productId", AttributeValue.builder().s(productId).build()))
                .build();
        dynamoDbClient.deleteItem(request);
    }

    private Map<String, AttributeValue> toItem(Product product) {
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("productId", AttributeValue.builder().s(product.getProductId()).build());
        item.put("name", AttributeValue.builder().s(nullSafe(product.getName())).build());
        item.put("description", AttributeValue.builder().s(nullSafe(product.getDescription())).build());
        item.put("category", AttributeValue.builder().s(nullSafe(product.getCategory())).build());
        item.put("price", AttributeValue.builder().n(String.valueOf(product.getPrice())).build());
        item.put("active", AttributeValue.builder().bool(product.isActive()).build());
        item.put("createdAt", AttributeValue.builder().s(nullSafe(product.getCreatedAt())).build());
        item.put("updatedAt", AttributeValue.builder().s(nullSafe(product.getUpdatedAt())).build());
        return item;
    }

    private Product fromItem(Map<String, AttributeValue> item) {
        Product product = new Product();
        product.setProductId(getString(item, "productId"));
        product.setName(getString(item, "name"));
        product.setDescription(getString(item, "description"));
        product.setCategory(getString(item, "category"));

        AttributeValue priceAttr = item.get("price");
        product.setPrice(priceAttr != null && priceAttr.n() != null ? Double.parseDouble(priceAttr.n()) : 0.0);

        AttributeValue activeAttr = item.get("active");
        product.setActive(activeAttr != null && Boolean.TRUE.equals(activeAttr.bool()));

        product.setCreatedAt(getString(item, "createdAt"));
        product.setUpdatedAt(getString(item, "updatedAt"));
        return product;
    }

    private String getString(Map<String, AttributeValue> item, String key) {
        AttributeValue value = item.get(key);
        return value != null ? value.s() : null;
    }

    private String nullSafe(String value) {
        return value != null ? value : "";
    }
}
