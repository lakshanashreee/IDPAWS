package com.ecommerce.cart.service;

import com.ecommerce.cart.dto.AddCartItemRequest;
import com.ecommerce.cart.dto.CartResponse;
import com.ecommerce.cart.dto.CartSummaryResponse;
import com.ecommerce.cart.exception.CartItemNotFoundException;
import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.model.CartItem;
import com.ecommerce.cart.repository.CartRepository;

import java.time.Instant;
import java.util.Optional;

/**
 * Business logic for the Cart Service. All validation and orchestration
 * of persistence happens here; the handler only deals with HTTP concerns.
 */
public class CartService {

    private final CartRepository cartRepository;

    public CartService() {
        this.cartRepository = new CartRepository();
    }

    public CartService(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    /**
     * Adds a product to a user's cart. If the product is already in the
     * cart, its quantity is increased instead of creating a duplicate line.
     */
    public CartResponse addItem(String userId, AddCartItemRequest request) {
        validateAddRequest(request);

        Cart cart = cartRepository.getCartByUserId(userId);
        if (cart == null) {
            cart = new Cart();
            cart.setUserId(userId);
        }

        String now = Instant.now().toString();

        Optional<CartItem> existing = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst();

        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            item.setProductName(request.getProductName());
            item.setPrice(request.getPrice());
            item.setUpdatedAt(now);
        } else {
            CartItem newItem = new CartItem();
            newItem.setProductId(request.getProductId());
            newItem.setProductName(request.getProductName());
            newItem.setPrice(request.getPrice());
            newItem.setQuantity(request.getQuantity());
            newItem.setUpdatedAt(now);
            cart.getItems().add(newItem);
        }

        cartRepository.saveCart(cart);
        return CartResponse.fromCart(cart);
    }

    /**
     * Returns the full cart for a user. If no cart exists yet, returns an
     * empty cart instead of a 404, since a cart is implicitly created on
     * first item add.
     */
    public CartResponse getCart(String userId) {
        Cart cart = cartRepository.getCartByUserId(userId);
        if (cart == null) {
            cart = new Cart();
            cart.setUserId(userId);
        }
        return CartResponse.fromCart(cart);
    }

    public CartSummaryResponse getCartSummary(String userId) {
        Cart cart = cartRepository.getCartByUserId(userId);
        if (cart == null) {
            return new CartSummaryResponse(userId, 0, 0, 0.0);
        }

        int totalItems = cart.getItems().size();
        int totalQuantity = cart.getItems().stream().mapToInt(CartItem::getQuantity).sum();
        double totalAmount = cart.getItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        return new CartSummaryResponse(userId, totalItems, totalQuantity, totalAmount);
    }

    public CartResponse updateItemQuantity(String userId, String productId, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("quantity must be a positive number");
        }

        Cart cart = cartRepository.getCartByUserId(userId);
        if (cart == null) {
            throw new CartItemNotFoundException(userId, productId);
        }

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new CartItemNotFoundException(userId, productId));

        item.setQuantity(quantity);
        item.setUpdatedAt(Instant.now().toString());

        cartRepository.saveCart(cart);
        return CartResponse.fromCart(cart);
    }

    public CartResponse removeItem(String userId, String productId) {
        Cart cart = cartRepository.getCartByUserId(userId);
        if (cart == null) {
            throw new CartItemNotFoundException(userId, productId);
        }

        boolean removed = cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        if (!removed) {
            throw new CartItemNotFoundException(userId, productId);
        }

        cartRepository.saveCart(cart);
        return CartResponse.fromCart(cart);
    }

    /**
     * Deletes the entire cart record for a user. Idempotent: succeeds even
     * if no cart currently exists.
     */
    public void clearCart(String userId) {
        cartRepository.deleteCart(userId);
    }

    public String healthCheck() {
        return "cart-service is healthy";
    }

    private void validateAddRequest(AddCartItemRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (request.getProductId() == null || request.getProductId().isBlank()) {
            throw new IllegalArgumentException("productId is required");
        }
        if (request.getProductName() == null || request.getProductName().isBlank()) {
            throw new IllegalArgumentException("productName is required");
        }
        if (request.getPrice() == null || request.getPrice() < 0) {
            throw new IllegalArgumentException("price must be >= 0");
        }
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("quantity must be a positive number");
        }
    }
}
