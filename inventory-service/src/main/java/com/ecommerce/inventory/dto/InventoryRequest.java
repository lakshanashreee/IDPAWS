package com.ecommerce.inventory.dto;

/**
 * Request payload used to CREATE a new inventory record.
 * (productId links back to a Product created by the Product Service,
 * but this service never calls Product Service directly.)
 */
public class InventoryRequest {

    private String productId;
    private Integer availableQuantity;
    private Integer reservedQuantity;
    private Integer lowStockThreshold;

    public InventoryRequest() {
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public Integer getReservedQuantity() {
        return reservedQuantity;
    }

    public void setReservedQuantity(Integer reservedQuantity) {
        this.reservedQuantity = reservedQuantity;
    }

    public Integer getLowStockThreshold() {
        return lowStockThreshold;
    }

    public void setLowStockThreshold(Integer lowStockThreshold) {
        this.lowStockThreshold = lowStockThreshold;
    }
}
