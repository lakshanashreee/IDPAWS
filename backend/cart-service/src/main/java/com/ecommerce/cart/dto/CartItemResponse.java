package com.ecommerce.cart.dto;

import com.ecommerce.cart.model.CartItem;

/**
 * Outbound representation of a single cart line item.
 */
public class CartItemResponse {

    private String productId;
    private String productName;
    private double price;
    private int quantity;
    private String updatedAt;

    public CartItemResponse() {
    }

    public static CartItemResponse fromCartItem(CartItem item) {
        CartItemResponse response = new CartItemResponse();
        response.setProductId(item.getProductId());
        response.setProductName(item.getProductName());
        response.setPrice(item.getPrice());
        response.setQuantity(item.getQuantity());
        response.setUpdatedAt(item.getUpdatedAt());
        return response;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
