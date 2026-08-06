package com.ecommerce.product.repository;

import com.ecommerce.product.model.Category;
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

public class CategoryRepository {

    private final DynamoDbClient dynamoDbClient;
    private final String tableName;

    public CategoryRepository() {
        this.dynamoDbClient = DynamoDbClient.builder().build();
        this.tableName = System.getenv("CATEGORY_TABLE") != null
                ? System.getenv("CATEGORY_TABLE")
                : "L_CategoryTable";
    }

    public CategoryRepository(DynamoDbClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
        this.tableName = System.getenv("CATEGORY_TABLE") != null
                ? System.getenv("CATEGORY_TABLE")
                : "L_CategoryTable";
    }

    public void saveCategory(Category category) {
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("categoryId", AttributeValue.builder().s(category.getCategoryId()).build());
        item.put("name", AttributeValue.builder().s(category.getName()).build());
        if (category.getDescription() != null) {
            item.put("description", AttributeValue.builder().s(category.getDescription()).build());
        }
        if (category.getImageUrl() != null) {
            item.put("imageUrl", AttributeValue.builder().s(category.getImageUrl()).build());
        }
        if (category.getCreatedAt() != null) {
            item.put("createdAt", AttributeValue.builder().s(category.getCreatedAt()).build());
        }
        if (category.getUpdatedAt() != null) {
            item.put("updatedAt", AttributeValue.builder().s(category.getUpdatedAt()).build());
        }

        PutItemRequest request = PutItemRequest.builder()
                .tableName(tableName)
                .item(item)
                .build();
        dynamoDbClient.putItem(request);
    }

    public Category getCategory(String categoryId) {
        Map<String, AttributeValue> key = new HashMap<>();
        key.put("categoryId", AttributeValue.builder().s(categoryId).build());

        GetItemRequest request = GetItemRequest.builder()
                .tableName(tableName)
                .key(key)
                .build();

        GetItemResponse response = dynamoDbClient.getItem(request);
        if (response.hasItem()) {
            return mapToCategory(response.item());
        }
        return null;
    }

    public List<Category> getAllCategories() {
        ScanRequest request = ScanRequest.builder()
                .tableName(tableName)
                .build();
        ScanResponse response = dynamoDbClient.scan(request);
        List<Category> categories = new ArrayList<>();
        for (Map<String, AttributeValue> item : response.items()) {
            categories.add(mapToCategory(item));
        }
        return categories;
    }

    public void deleteCategory(String categoryId) {
        Map<String, AttributeValue> key = new HashMap<>();
        key.put("categoryId", AttributeValue.builder().s(categoryId).build());

        DeleteItemRequest request = DeleteItemRequest.builder()
                .tableName(tableName)
                .key(key)
                .build();
        dynamoDbClient.deleteItem(request);
    }

    private Category mapToCategory(Map<String, AttributeValue> item) {
        Category category = new Category();
        if (item.containsKey("categoryId")) category.setCategoryId(item.get("categoryId").s());
        if (item.containsKey("name")) category.setName(item.get("name").s());
        if (item.containsKey("description")) category.setDescription(item.get("description").s());
        if (item.containsKey("imageUrl")) category.setImageUrl(item.get("imageUrl").s());
        if (item.containsKey("createdAt")) category.setCreatedAt(item.get("createdAt").s());
        if (item.containsKey("updatedAt")) category.setUpdatedAt(item.get("updatedAt").s());
        return category;
    }
}
