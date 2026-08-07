package com.ecommerce.inventory.dto;

import com.ecommerce.inventory.model.Inventory;

/**
 * Outbound representation of an Inventory record.
 */
public class InventoryResponse {

    private String productId;
    private int availableQuantity;
    private int reservedQuantity;
    private int lowStockThreshold;
    private String lastUpdated;

    public InventoryResponse() {
    }

    public static InventoryResponse fromInventory(Inventory inventory) {
        InventoryResponse response = new InventoryResponse();
        response.setProductId(inventory.getProductId());
        response.setAvailableQuantity(inventory.getAvailableQuantity());
        response.setReservedQuantity(inventory.getReservedQuantity());
        response.setLowStockThreshold(inventory.getLowStockThreshold());
        response.setLastUpdated(inventory.getLastUpdated());
        return response;
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
}
