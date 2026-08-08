package com.ecommerce.user.service;

import com.ecommerce.user.model.UserDetails;
import com.ecommerce.user.model.UserAddress;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.UUID;

public class UserService {
    private final DynamoDbClient dynamoDbClient;
    private static final String TABLE_NAME = "L_UserDetails";

    public UserService() {
        this.dynamoDbClient = DynamoDbClient.builder().build();
    }

    public UserDetails getUserProfile(String userId) {
        Map<String, AttributeValue> key = new HashMap<>();
        key.put("userId", AttributeValue.builder().s(userId).build());

        GetItemRequest request = GetItemRequest.builder()
                .tableName(TABLE_NAME)
                .key(key)
                .build();

        Map<String, AttributeValue> item = dynamoDbClient.getItem(request).item();
        if (item == null || item.isEmpty()) {
            return null;
        }

        UserDetails user = new UserDetails();
        user.setUserId(userId);
        if (item.containsKey("email")) user.setEmail(item.get("email").s());
        if (item.containsKey("name")) user.setName(item.get("name").s());
        if (item.containsKey("photoUrl")) user.setPhotoUrl(item.get("photoUrl").s());

        if (item.containsKey("addresses") && item.get("addresses").l() != null) {
            List<UserAddress> addresses = new ArrayList<>();
            for (AttributeValue av : item.get("addresses").l()) {
                Map<String, AttributeValue> addrMap = av.m();
                UserAddress address = new UserAddress();
                if (addrMap.containsKey("id")) address.setId(addrMap.get("id").s());
                if (addrMap.containsKey("tag")) address.setTag(addrMap.get("tag").s());
                if (addrMap.containsKey("addressLine")) address.setAddressLine(addrMap.get("addressLine").s());
                addresses.add(address);
            }
            user.setAddresses(addresses);
        }

        return user;
    }

    public UserDetails updateUserProfile(String userId, String name, String photoUrl, List<UserAddress> addresses) {
        UserDetails user = getUserProfile(userId);
        if (user == null) {
            user = new UserDetails();
            user.setUserId(userId);
        }

        if (name != null) user.setName(name);
        if (photoUrl != null) user.setPhotoUrl(photoUrl);
        if (addresses != null) {
            for (UserAddress addr : addresses) {
                if (addr.getId() == null || addr.getId().isBlank()) {
                    addr.setId(UUID.randomUUID().toString());
                }
            }
            user.setAddresses(addresses);
        }

        Map<String, AttributeValue> item = new HashMap<>();
        item.put("userId", AttributeValue.builder().s(user.getUserId()).build());
        if (user.getEmail() != null) item.put("email", AttributeValue.builder().s(user.getEmail()).build());
        if (user.getName() != null) item.put("name", AttributeValue.builder().s(user.getName()).build());
        if (user.getPhotoUrl() != null) item.put("photoUrl", AttributeValue.builder().s(user.getPhotoUrl()).build());

        if (user.getAddresses() != null && !user.getAddresses().isEmpty()) {
            List<AttributeValue> addressList = new ArrayList<>();
            for (UserAddress addr : user.getAddresses()) {
                Map<String, AttributeValue> addrMap = new HashMap<>();
                if (addr.getId() != null) addrMap.put("id", AttributeValue.builder().s(addr.getId()).build());
                if (addr.getTag() != null) addrMap.put("tag", AttributeValue.builder().s(addr.getTag()).build());
                if (addr.getAddressLine() != null) addrMap.put("addressLine", AttributeValue.builder().s(addr.getAddressLine()).build());
                addressList.add(AttributeValue.builder().m(addrMap).build());
            }
            item.put("addresses", AttributeValue.builder().l(addressList).build());
        }

        PutItemRequest request = PutItemRequest.builder()
                .tableName(TABLE_NAME)
                .item(item)
                .build();

        dynamoDbClient.putItem(request);
        return user;
    }
}
