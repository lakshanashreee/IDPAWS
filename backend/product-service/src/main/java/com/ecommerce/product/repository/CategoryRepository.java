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
import software.amazon.awssdk.auth.credentials.EnvironmentVariableCredentialsProvider;
import software.amazon.awssdk.regions.Region;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CategoryRepository {

    private static final String ENV_CATEGORY_TABLE = "CATEGORY_TABLE";
    private static final String DEFAULT_TABLE = "L_CategoryTable";

    private static final String ATTR_CATEGORY_ID = "categoryId";
    private static final String ATTR_NAME = "name";
    private static final String ATTR_DESC = "description";
    private static final String ATTR_IMAGE = "imageUrl";
    private static final String ATTR_CREATED = "createdAt";
    private static final String ATTR_UPDATED = "updatedAt";

    private final DynamoDbClient dynamoDbClient;
    private final String tableName;

    public CategoryRepository() {
        this.dynamoDbClient = DynamoDbClient.builder()
                .region(Region.of(System.getenv("AWS_REGION") != null ? System.getenv("AWS_REGION") : "ap-southeast-1"))
                .credentialsProvider(EnvironmentVariableCredentialsProvider.create())
                .build();
        this.tableName = System.getenv(ENV_CATEGORY_TABLE) != null
                ? System.getenv(ENV_CATEGORY_TABLE)
                : DEFAULT_TABLE;
    }

    public CategoryRepository(DynamoDbClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
        this.tableName = System.getenv(ENV_CATEGORY_TABLE) != null
                ? System.getenv(ENV_CATEGORY_TABLE)
                : DEFAULT_TABLE;
    }

    public void saveCategory(Category category) {
        Map<String, AttributeValue> item = new HashMap<>();
        item.put(ATTR_CATEGORY_ID, AttributeValue.builder().s(category.getCategoryId()).build());
        item.put(ATTR_NAME, AttributeValue.builder().s(category.getName()).build());
        if (category.getDescription() != null) {
            item.put(ATTR_DESC, AttributeValue.builder().s(category.getDescription()).build());
        }
        if (category.getImageUrl() != null) {
            item.put(ATTR_IMAGE, AttributeValue.builder().s(category.getImageUrl()).build());
        }
        if (category.getCreatedAt() != null) {
            item.put(ATTR_CREATED, AttributeValue.builder().s(category.getCreatedAt()).build());
        }
        if (category.getUpdatedAt() != null) {
            item.put(ATTR_UPDATED, AttributeValue.builder().s(category.getUpdatedAt()).build());
        }

        PutItemRequest request = PutItemRequest.builder()
                .tableName(tableName)
                .item(item)
                .build();
        dynamoDbClient.putItem(request);
    }

    public Category getCategory(String categoryId) {
        Map<String, AttributeValue> key = new HashMap<>();
        key.put(ATTR_CATEGORY_ID, AttributeValue.builder().s(categoryId).build());

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
        key.put(ATTR_CATEGORY_ID, AttributeValue.builder().s(categoryId).build());

        DeleteItemRequest request = DeleteItemRequest.builder()
                .tableName(tableName)
                .key(key)
                .build();
        dynamoDbClient.deleteItem(request);
    }

    private Category mapToCategory(Map<String, AttributeValue> item) {
        Category category = new Category();
        if (item.containsKey(ATTR_CATEGORY_ID)) category.setCategoryId(item.get(ATTR_CATEGORY_ID).s());
        if (item.containsKey(ATTR_NAME)) category.setName(item.get(ATTR_NAME).s());
        if (item.containsKey(ATTR_DESC)) category.setDescription(item.get(ATTR_DESC).s());
        if (item.containsKey(ATTR_IMAGE)) category.setImageUrl(item.get(ATTR_IMAGE).s());
        if (item.containsKey(ATTR_CREATED)) category.setCreatedAt(item.get(ATTR_CREATED).s());
        if (item.containsKey(ATTR_UPDATED)) category.setUpdatedAt(item.get(ATTR_UPDATED).s());
        return category;
    }
}
