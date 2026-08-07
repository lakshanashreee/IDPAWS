package com.ecommerce.payment.model;

/**
 * Mirrors the shape of a line item inside the incoming OrderPlaced SQS
 * event. This is a read-only copy used only for deserialization — Payment
 * Service does not persist item-level detail, only the order-level total.
 */
public class OrderItem {

    private String productId;
    private String productName;
    private double price;
    private int quantity;

    public OrderItem() {
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

    @Override
    public String toString() {
        return "OrderItem{" +
                "productId='" + productId + '\'' +
                ", productName='" + productName + '\'' +
                ", price=" + price +
                ", quantity=" + quantity +
                '}';
    }
}
