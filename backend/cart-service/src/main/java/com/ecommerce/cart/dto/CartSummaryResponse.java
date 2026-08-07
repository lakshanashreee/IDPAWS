package com.ecommerce.cart.dto;

/**
 * Outbound summary for GET /cart/{userId}/summary
 *
 * totalItems    - number of distinct products in the cart
 * totalQuantity - sum of quantity across all items
 * totalAmount   - sum of (price * quantity) across all items
 */
public class CartSummaryResponse {

    private String userId;
    private int totalItems;
    private int totalQuantity;
    private double totalAmount;

    public CartSummaryResponse() {
    }

    public CartSummaryResponse(String userId, int totalItems, int totalQuantity, double totalAmount) {
        this.userId = userId;
        this.totalItems = totalItems;
        this.totalQuantity = totalQuantity;
        this.totalAmount = totalAmount;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }

    public int getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(int totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }
}
