package com.ecommerce.inventory.dto;

public class NotifyRequest {
    private String email;
    private String imageUrl;
    private String productName;

    public NotifyRequest() {
    }

    public NotifyRequest(String email, String imageUrl, String productName) {
        this.email = email;
        this.imageUrl = imageUrl;
        this.productName = productName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }
}
