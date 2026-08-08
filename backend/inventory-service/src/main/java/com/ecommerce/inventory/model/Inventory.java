package com.ecommerce.inventory.model;

import java.util.Objects;

/**
 * Core Inventory domain model.
 *
 * One inventory record exists per productId (1:1 with the Product Service's
 * ProductsTable, but this service does NOT call Product Service directly —
 * services stay independent. Any cross-service link is by shared productId
 * value only).
 */
public class Inventory {

    private String productId;
    private int availableQuantity;
    private int reservedQuantity;
    private int lowStockThreshold;
    private String lastUpdated;
    private java.util.Set<String> notifyEmails;
    private String notifyImageUrl;
    private String notifyProductName;

    public Inventory() {
        this.notifyEmails = new java.util.HashSet<>();
    }

    public Inventory(String productId, int availableQuantity, int reservedQuantity,
                      int lowStockThreshold, String lastUpdated) {
        this.productId = productId;
        this.availableQuantity = availableQuantity;
        this.reservedQuantity = reservedQuantity;
        this.lowStockThreshold = lowStockThreshold;
        this.lastUpdated = lastUpdated;
        this.notifyEmails = new java.util.HashSet<>();
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public int getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(int availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public int getReservedQuantity() {
        return reservedQuantity;
    }

    public void setReservedQuantity(int reservedQuantity) {
        this.reservedQuantity = reservedQuantity;
    }

    public int getLowStockThreshold() {
        return lowStockThreshold;
    }

    public void setLowStockThreshold(int lowStockThreshold) {
        this.lowStockThreshold = lowStockThreshold;
    }

    public String getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public java.util.Set<String> getNotifyEmails() {
        if (notifyEmails == null) {
            notifyEmails = new java.util.HashSet<>();
        }
        return notifyEmails;
    }

    public void setNotifyEmails(java.util.Set<String> notifyEmails) {
        this.notifyEmails = notifyEmails;
    }

    public String getNotifyImageUrl() {
        return notifyImageUrl;
    }

    public void setNotifyImageUrl(String notifyImageUrl) {
        this.notifyImageUrl = notifyImageUrl;
    }

    public String getNotifyProductName() {
        return notifyProductName;
    }

    public void setNotifyProductName(String notifyProductName) {
        this.notifyProductName = notifyProductName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Inventory)) return false;
        Inventory inventory = (Inventory) o;
        return Objects.equals(productId, inventory.productId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId);
    }

    @Override
    public String toString() {
        return "Inventory{" +
                "productId='" + productId + '\'' +
                ", availableQuantity=" + availableQuantity +
                ", reservedQuantity=" + reservedQuantity +
                ", lowStockThreshold=" + lowStockThreshold +
                ", lastUpdated='" + lastUpdated + '\'' +
                ", notifyEmails=" + (notifyEmails != null ? notifyEmails.size() : 0) + " waiting" +
                '}';
    }
}
