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
 *
 * S3 image lifecycle:
 *  - createProduct: imageUrl (from request) is stored in DynamoDB as-is.
 *  - updateProduct: if the incoming imageUrl differs from the existing one,
 *                   the old S3 object is deleted before the new URL is saved.
 */
public class ProductService {

    private final ProductRepository productRepository;
    private final S3ImageService s3ImageService;

    public ProductService() {
        this.productRepository = new ProductRepository();
        this.s3ImageService    = new S3ImageService();
    }

    /** Test constructor allowing dependency injection. */
    public ProductService(ProductRepository productRepository, S3ImageService s3ImageService) {
        this.productRepository = productRepository;
        this.s3ImageService    = s3ImageService;
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
        // Store the S3 URL received from the client (may be null if no image).
        product.setImageUrl(request.getImageUrl());
        product.setCreatedAt(now);
        product.setUpdatedAt(now);

        productRepository.saveProduct(product);
        return toResponse(product);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.getAllProducts().stream()
                .filter(Product::isActive)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(String productId) {
        Product product = productRepository.getProductById(productId);
        if (product == null) {
            throw new ProductNotFoundException(productId);
        }
        // Returned even if inactive, with active=false surfaced to the caller.
        return toResponse(product);
    }

    public List<ProductResponse> getProductsByCategory(String category) {
        return productRepository.getProductsByCategory(category).stream()
                .filter(Product::isActive)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse updateProduct(String productId, ProductRequest request) {
        Product existing = productRepository.getProductById(productId);
        if (existing == null) {
            throw new ProductNotFoundException(productId);
        }

        validate(request);

        // ── Image lifecycle: delete old S3 object when the image changes ─────────
        String oldImageUrl = existing.getImageUrl();
        String newImageUrl = request.getImageUrl();

        boolean imageChanged = newImageUrl != null
                && !newImageUrl.isBlank()
                && !newImageUrl.equals(oldImageUrl);

        if (imageChanged) {
            // Best-effort delete — logged internally, never throws.
            s3ImageService.deleteObject(oldImageUrl);
        }
        // ─────────────────────────────────────────────────────────────────────────

        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setCategory(request.getCategory());
        existing.setPrice(request.getPrice());
        if (request.getActive() != null) {
            existing.setActive(request.getActive());
        }
        // If no new image was provided, preserve the existing URL.
        if (newImageUrl != null && !newImageUrl.isBlank()) {
            existing.setImageUrl(newImageUrl);
        }
        existing.setUpdatedAt(Instant.now().toString());

        productRepository.updateProduct(existing);
        return toResponse(existing);
    }

    public void deleteProduct(String productId) {
        Product existing = productRepository.getProductById(productId);
        if (existing == null) {
            throw new ProductNotFoundException(productId);
        }
        // Soft delete in DynamoDB (sets active=false).
        productRepository.deleteProduct(productId, Instant.now().toString());
        // Best-effort S3 cleanup when a product is (soft) deleted.
        s3ImageService.deleteObject(existing.getImageUrl());
    }

    public String healthCheck() {
        return "product-service is healthy";
    }

    public S3ImageService getS3ImageService() {
        return s3ImageService;
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

    private ProductResponse toResponse(Product product) {
        ProductResponse response = ProductResponse.fromProduct(product);
        if (response.getImageUrl() != null && !response.getImageUrl().isBlank()) {
            response.setImageUrl(s3ImageService.getPresignedGetUrl(response.getImageUrl()));
        }
        return response;
    }
}

