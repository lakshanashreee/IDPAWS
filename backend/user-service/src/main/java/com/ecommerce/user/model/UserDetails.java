package com.ecommerce.user.model;

import java.util.List;
import java.util.ArrayList;

public class UserDetails {
    private String userId;
    private String email;
    private String name;
    private String photoUrl;
    private List<UserAddress> addresses = new ArrayList<>();

    // Getters and setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public List<UserAddress> getAddresses() { return addresses; }
    public void setAddresses(List<UserAddress> addresses) { this.addresses = addresses; }
}
