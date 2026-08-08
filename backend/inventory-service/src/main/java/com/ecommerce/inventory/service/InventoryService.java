package com.ecommerce.inventory.service;

import com.ecommerce.inventory.dto.InventoryRequest;
import com.ecommerce.inventory.dto.InventoryResponse;
import com.ecommerce.inventory.exception.InsufficientStockException;
import com.ecommerce.inventory.exception.InventoryNotFoundException;
import com.ecommerce.inventory.model.Inventory;
import com.ecommerce.inventory.repository.InventoryRepository;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Business logic for the Inventory Service. All validation and orchestration
 * of persistence happens here; the handler only deals with HTTP concerns.
 */
public class InventoryService {

    private static final int DEFAULT_LOW_STOCK_THRESHOLD = 5;

    private final InventoryRepository inventoryRepository;

    public InventoryService() {
        this.inventoryRepository = new InventoryRepository();
    }

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public InventoryResponse createInventory(InventoryRequest request) {
        validateCreateRequest(request);

        Inventory inventory = new Inventory();
        inventory.setProductId(request.getProductId());
        inventory.setAvailableQuantity(request.getAvailableQuantity() != null ? request.getAvailableQuantity() : 0);
        inventory.setReservedQuantity(request.getReservedQuantity() != null ? request.getReservedQuantity() : 0);
        inventory.setLowStockThreshold(request.getLowStockThreshold() != null
                ? request.getLowStockThreshold()
                : DEFAULT_LOW_STOCK_THRESHOLD);
        inventory.setLastUpdated(Instant.now().toString());

        inventoryRepository.saveInventory(inventory);
        return InventoryResponse.fromInventory(inventory);
    }

    public List<InventoryResponse> getAllInventory() {
        return inventoryRepository.getAllInventory().stream()
                .map(InventoryResponse::fromInventory)
                .collect(Collectors.toList());
    }

    public InventoryResponse getInventoryById(String productId) {
        Inventory inventory = inventoryRepository.getInventoryById(productId);
        if (inventory == null) {
            throw new InventoryNotFoundException(productId);
        }
        return InventoryResponse.fromInventory(inventory);
    }

    public InventoryResponse addStock(String productId, Integer quantity) {
        validateQuantity(quantity);

        Inventory inventory = inventoryRepository.getInventoryById(productId);
        if (inventory == null) {
            throw new InventoryNotFoundException(productId);
        }

        boolean wasOutOfStock = inventory.getAvailableQuantity() == 0;

        inventory.setAvailableQuantity(inventory.getAvailableQuantity() + quantity);
        inventory.setLastUpdated(Instant.now().toString());

        // Send notifications if restocked
        if (wasOutOfStock && inventory.getAvailableQuantity() > 0) {
            java.util.Set<String> emails = inventory.getNotifyEmails();
            if (emails != null && !emails.isEmpty()) {
                for (String email : emails) {
                    com.ecommerce.inventory.util.EmailSender.sendRestockNotification(email, productId, inventory.getNotifyImageUrl(), inventory.getNotifyProductName());
                }
                // Clear the notification list
                emails.clear();
                inventory.setNotifyEmails(emails);
                inventory.setNotifyImageUrl(null);
                inventory.setNotifyProductName(null);
            }
        }

        inventoryRepository.updateInventory(inventory);
        return InventoryResponse.fromInventory(inventory);
    }

    public void addNotifyEmail(String productId, String email, String imageUrl, String productName) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email cannot be blank");
        }
        Inventory inventory = inventoryRepository.getInventoryById(productId);
        if (inventory == null) {
            throw new InventoryNotFoundException(productId);
        }
        java.util.Set<String> emails = inventory.getNotifyEmails();
        emails.add(email);
        inventory.setNotifyEmails(emails);
        if (imageUrl != null) inventory.setNotifyImageUrl(imageUrl);
        if (productName != null) inventory.setNotifyProductName(productName);
        inventoryRepository.updateInventory(inventory);
    }

    public InventoryResponse reduceStock(String productId, Integer quantity) {
        validateQuantity(quantity);

        Inventory inventory = inventoryRepository.getInventoryById(productId);
        if (inventory == null) {
            throw new InventoryNotFoundException(productId);
        }

        int newAvailableQuantity = inventory.getAvailableQuantity() - quantity;
        if (newAvailableQuantity < 0) {
            throw new InsufficientStockException(
                    "Cannot reduce stock below zero. Available: " + inventory.getAvailableQuantity()
                            + ", requested reduction: " + quantity);
        }

        inventory.setAvailableQuantity(newAvailableQuantity);
        inventory.setLastUpdated(Instant.now().toString());

        inventoryRepository.updateInventory(inventory);
        return InventoryResponse.fromInventory(inventory);
    }

    public InventoryResponse updateInventory(String productId, Integer availableQuantity) {
        if (availableQuantity == null || availableQuantity < 0) {
            throw new IllegalArgumentException("availableQuantity must be >= 0");
        }

        Inventory inventory = inventoryRepository.getInventoryById(productId);
        if (inventory == null) {
            throw new InventoryNotFoundException(productId);
        }

        inventory.setAvailableQuantity(availableQuantity);
        inventory.setLastUpdated(Instant.now().toString());

        inventoryRepository.updateInventory(inventory);
        return InventoryResponse.fromInventory(inventory);
    }

    public List<InventoryResponse> getLowStockInventory() {
        return inventoryRepository.getAllInventory().stream()
                .filter(inventory -> inventory.getAvailableQuantity() <= inventory.getLowStockThreshold())
                .map(InventoryResponse::fromInventory)
                .collect(Collectors.toList());
    }

    public void deleteInventory(String productId) {
        Inventory existing = inventoryRepository.getInventoryById(productId);
        if (existing == null) {
            throw new InventoryNotFoundException(productId);
        }
        inventoryRepository.deleteInventory(productId);
    }

    public String healthCheck() {
        return "inventory-service is healthy";
    }

    private void validateCreateRequest(InventoryRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (request.getProductId() == null || request.getProductId().isBlank()) {
            throw new IllegalArgumentException("productId is required");
        }
        if (request.getAvailableQuantity() != null && request.getAvailableQuantity() < 0) {
            throw new IllegalArgumentException("availableQuantity must be >= 0");
        }
        if (request.getReservedQuantity() != null && request.getReservedQuantity() < 0) {
            throw new IllegalArgumentException("reservedQuantity must be >= 0");
        }
        if (request.getLowStockThreshold() != null && request.getLowStockThreshold() < 0) {
            throw new IllegalArgumentException("lowStockThreshold must be >= 0");
        }
    }

    private void validateQuantity(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("quantity must be a positive number");
        }
    }
}
