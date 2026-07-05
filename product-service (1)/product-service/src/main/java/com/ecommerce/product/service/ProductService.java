package com.ecommerce.product.service;

import com.ecommerce.product.dto.ProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.exception.ProductNotFoundException;
import com.ecommerce.product.model.Product;
import com.ecommerce.product.repository.ProductRepository;
import com.ecommerce.product.util.IdGenerator;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Business logic for the Product Service. All validation and orchestration
 * of persistence happens here; the handler only deals with HTTP concerns.
 */
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService() {
        this.productRepository = new ProductRepository();
    }

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public ProductResponse createProduct(ProductRequest request) {
        validate(request);

        String now = Instant.now().toString();

        Product product = new Product();
        product.setProductId(IdGenerator.generateProductId());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setActive(request.getActive() == null || request.getActive());
        product.setCreatedAt(now);
        product.setUpdatedAt(now);

        productRepository.saveProduct(product);
        return ProductResponse.fromProduct(product);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.getAllProducts().stream()
                .filter(Product::isActive)
                .map(ProductResponse::fromProduct)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(String productId) {
        Product product = productRepository.getProductById(productId);
        if (product == null) {
            throw new ProductNotFoundException(productId);
        }
        // Returned even if inactive, with active=false surfaced to the caller.
        return ProductResponse.fromProduct(product);
    }

    public List<ProductResponse> getProductsByCategory(String category) {
        return productRepository.getProductsByCategory(category).stream()
                .filter(Product::isActive)
                .map(ProductResponse::fromProduct)
                .collect(Collectors.toList());
    }

    public ProductResponse updateProduct(String productId, ProductRequest request) {
        Product existing = productRepository.getProductById(productId);
        if (existing == null) {
            throw new ProductNotFoundException(productId);
        }

        validate(request);

        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setCategory(request.getCategory());
        existing.setPrice(request.getPrice());
        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }
        existing.setUpdatedAt(Instant.now().toString());

        productRepository.updateProduct(existing);
        return ProductResponse.fromProduct(existing);
    }

    public void deleteProduct(String productId) {
        Product existing = productRepository.getProductById(productId);
        if (existing == null) {
            throw new ProductNotFoundException(productId);
        }
        productRepository.deleteProduct(productId, Instant.now().toString());
    }

    public String healthCheck() {
        return "product-service is healthy";
    }

    private void validate(ProductRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("name is required");
        }
        if (request.getCategory() == null || request.getCategory().isBlank()) {
            throw new IllegalArgumentException("category is required");
        }
        if (request.getPrice() == null || request.getPrice() < 0) {
            throw new IllegalArgumentException("price must be >= 0");
        }
    }
}
