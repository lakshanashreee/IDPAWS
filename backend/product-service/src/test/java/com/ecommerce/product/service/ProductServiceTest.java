package com.ecommerce.product.service;

import com.ecommerce.product.dto.ProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.exception.ProductNotFoundException;
import com.ecommerce.product.model.Product;
import com.ecommerce.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private S3ImageService s3ImageService;

    private ProductService productService;

    @BeforeEach
    void setUp() {
        productService = new ProductService(productRepository, s3ImageService);
    }

    @Test
    void testCreateProduct_Success() {
        ProductRequest request = new ProductRequest();
        request.setName("Luxury Silk Shirt");
        request.setDescription("Handcrafted silk shirt");
        request.setCategory("WOMEN'S CLOTHING");
        request.setPrice(350.0);
        request.setActive(true);
        request.setImageUrl("https://s3.amazonaws.com/bucket/image.jpg");

        ProductResponse response = productService.createProduct(request);

        assertNotNull(response);
        assertEquals("Luxury Silk Shirt", response.getName());
        assertEquals(350.0, response.getPrice());
        assertEquals("WOMEN'S CLOTHING", response.getCategory());
        assertTrue(response.isActive());

        verify(productRepository, times(1)).saveProduct(any(Product.class));
    }

    @Test
    void testCreateProduct_NullName_ThrowsException() {
        ProductRequest request = new ProductRequest();
        request.setName("");
        request.setCategory("ELECTRONICS");
        request.setPrice(100.0);

        assertThrows(IllegalArgumentException.class, () -> productService.createProduct(request));
    }

    @Test
    void testGetAllProducts_ReturnsList() {
        Product p1 = new Product("prod-1", "Product 1", "Desc 1", "CAT1", 100.0, true, "img1", "now", "now");
        Product p2 = new Product("prod-2", "Product 2", "Desc 2", "CAT2", 200.0, true, "img2", "now", "now");

        when(productRepository.getAllProducts()).thenReturn(Arrays.asList(p1, p2));
        when(s3ImageService.getPresignedGetUrl(anyString())).thenAnswer(invocation -> invocation.getArgument(0));

        List<ProductResponse> products = productService.getAllProducts();

        assertEquals(2, products.size());
        assertEquals("Product 1", products.get(0).getName());
        assertEquals("Product 2", products.get(1).getName());
    }

    @Test
    void testGetProductById_Found() {
        Product p = new Product("prod-123", "iPhone 17 Pro Max", "Latest phone", "ELECTRONICS", 130000.0, true, "img", "now", "now");
        when(productRepository.getProductById("prod-123")).thenReturn(p);

        ProductResponse response = productService.getProductById("prod-123");

        assertNotNull(response);
        assertEquals("prod-123", response.getProductId());
        assertEquals("iPhone 17 Pro Max", response.getName());
    }

    @Test
    void testGetProductById_NotFound_ThrowsException() {
        when(productRepository.getProductById("unknown-id")).thenReturn(null);

        assertThrows(ProductNotFoundException.class, () -> productService.getProductById("unknown-id"));
    }

    @Test
    void testUpdateProduct_Success() {
        Product existing = new Product("prod-100", "Old Name", "Old Desc", "General", 50.0, true, "old-img", "now", "now");
        when(productRepository.getProductById("prod-100")).thenReturn(existing);

        ProductRequest updateReq = new ProductRequest();
        updateReq.setName("New Name");
        updateReq.setDescription("New Desc");
        updateReq.setCategory("General");
        updateReq.setPrice(75.0);

        ProductResponse updated = productService.updateProduct("prod-100", updateReq);

        assertNotNull(updated);
        assertEquals("New Name", updated.getName());
        assertEquals(75.0, updated.getPrice());
        verify(productRepository, times(1)).updateProduct(any(Product.class));
    }

    @Test
    void testDeleteProduct_Success() {
        Product existing = new Product("prod-100", "Item", "Desc", "General", 50.0, true, "img", "now", "now");
        when(productRepository.getProductById("prod-100")).thenReturn(existing);

        productService.deleteProduct("prod-100");

        verify(productRepository, times(1)).deleteProduct(eq("prod-100"), anyString());
        verify(s3ImageService, times(1)).deleteObject("img");
    }
}
