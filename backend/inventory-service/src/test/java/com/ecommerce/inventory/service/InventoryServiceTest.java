package com.ecommerce.inventory.service;

import com.ecommerce.inventory.dto.InventoryRequest;
import com.ecommerce.inventory.dto.InventoryResponse;
import com.ecommerce.inventory.exception.InsufficientStockException;
import com.ecommerce.inventory.exception.InventoryNotFoundException;
import com.ecommerce.inventory.model.Inventory;
import com.ecommerce.inventory.repository.InventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    private InventoryService inventoryService;

    @BeforeEach
    void setUp() {
        inventoryService = new InventoryService(inventoryRepository);
    }

    @Test
    void testCreateInventory_Success() {
        InventoryRequest request = new InventoryRequest();
        request.setProductId("prod-10");
        request.setAvailableQuantity(50);
        request.setLowStockThreshold(10);

        InventoryResponse response = inventoryService.createInventory(request);

        assertNotNull(response);
        assertEquals("prod-10", response.getProductId());
        assertEquals(50, response.getAvailableQuantity());
        assertEquals(10, response.getLowStockThreshold());

        verify(inventoryRepository, times(1)).saveInventory(any(Inventory.class));
    }

    @Test
    void testGetInventoryById_Found() {
        Inventory inv = new Inventory("prod-10", 30, 0, 5, "now");
        when(inventoryRepository.getInventoryById("prod-10")).thenReturn(inv);

        InventoryResponse response = inventoryService.getInventoryById("prod-10");

        assertNotNull(response);
        assertEquals("prod-10", response.getProductId());
        assertEquals(30, response.getAvailableQuantity());
    }

    @Test
    void testGetInventoryById_NotFound_ThrowsException() {
        when(inventoryRepository.getInventoryById("unknown")).thenReturn(null);

        assertThrows(InventoryNotFoundException.class, () -> inventoryService.getInventoryById("unknown"));
    }

    @Test
    void testAddStock_Success() {
        Inventory inv = new Inventory("prod-10", 20, 0, 5, "now");
        when(inventoryRepository.getInventoryById("prod-10")).thenReturn(inv);

        InventoryResponse response = inventoryService.addStock("prod-10", 15);

        assertEquals(35, response.getAvailableQuantity());
        verify(inventoryRepository, times(1)).updateInventory(any(Inventory.class));
    }

    @Test
    void testReduceStock_Success() {
        Inventory inv = new Inventory("prod-10", 20, 0, 5, "now");
        when(inventoryRepository.getInventoryById("prod-10")).thenReturn(inv);

        InventoryResponse response = inventoryService.reduceStock("prod-10", 5);

        assertEquals(15, response.getAvailableQuantity());
        verify(inventoryRepository, times(1)).updateInventory(any(Inventory.class));
    }

    @Test
    void testReduceStock_InsufficientStock_ThrowsException() {
        Inventory inv = new Inventory("prod-10", 3, 0, 5, "now");
        when(inventoryRepository.getInventoryById("prod-10")).thenReturn(inv);

        assertThrows(InsufficientStockException.class, () -> inventoryService.reduceStock("prod-10", 10));
    }

    @Test
    void testGetLowStockInventory() {
        Inventory inv1 = new Inventory("prod-1", 3, 0, 5, "now");
        Inventory inv2 = new Inventory("prod-2", 50, 0, 5, "now");

        when(inventoryRepository.getAllInventory()).thenReturn(Arrays.asList(inv1, inv2));

        List<InventoryResponse> lowStock = inventoryService.getLowStockInventory();

        assertEquals(1, lowStock.size());
        assertEquals("prod-1", lowStock.get(0).getProductId());
    }

    @Test
    void testDeleteInventory_Success() {
        Inventory inv = new Inventory("prod-10", 10, 0, 5, "now");
        when(inventoryRepository.getInventoryById("prod-10")).thenReturn(inv);

        inventoryService.deleteInventory("prod-10");

        verify(inventoryRepository, times(1)).deleteInventory("prod-10");
    }
}
