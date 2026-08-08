package com.ecommerce.user.dto;

import com.ecommerce.user.model.UserAddress;
import java.util.List;

public class UpdateProfileRequest {
    private String name;
    private String photoUrl;
    private List<UserAddress> addresses;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public List<UserAddress> getAddresses() { return addresses; }
    public void setAddresses(List<UserAddress> addresses) { this.addresses = addresses; }
}
