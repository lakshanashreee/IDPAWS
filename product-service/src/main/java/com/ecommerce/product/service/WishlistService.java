package com.ecommerce.product.service;

import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.model.WishlistItem;
import com.ecommerce.product.repository.ProductRepository;
import com.ecommerce.product.repository.WishlistRepository;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    public WishlistService() {
        this.wishlistRepository = new WishlistRepository();
        this.productRepository = new ProductRepository();
    }

    public WishlistService(WishlistRepository wishlistRepository, ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
    }

    public void addProductToWishlist(String userId, String productId) {
        WishlistItem item = new WishlistItem(userId, productId, Instant.now().toString());
        wishlistRepository.save(item);
    }

    public void removeProductFromWishlist(String userId, String productId) {
        wishlistRepository.delete(userId, productId);
    }

    public List<ProductResponse> getWishlistForUser(String userId) {
        List<WishlistItem> items = wishlistRepository.getWishlistByUserId(userId);
        return items.stream()
                .map(item -> productRepository.getProductById(item.getProductId()))
                .filter(Objects::nonNull)
                .map(ProductResponse::fromProduct)
                .collect(Collectors.toList());
    }
}
