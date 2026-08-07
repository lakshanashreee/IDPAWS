package com.ecommerce.cart.dto;

/**
 * Request payload for POST /cart/{userId}/items
 * Example: { "productId": "PROD-1", "productName": "Wireless Mouse", "price": 19.99, "quantity": 2 }
 */
public class AddCartItemRequest {

    private String productId;
    private String productName;
    private Double price;
    private Integer quantity;

    public AddCartItemRequest() {
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

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
