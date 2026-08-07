package com.ecommerce.cart.dto;

import com.ecommerce.cart.model.Cart;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Outbound representation of a full Cart, returned by GET /cart/{userId}.
 */
public class CartResponse {

    private String userId;
    private List<CartItemResponse> items;

    public CartResponse() {
    }

    public static CartResponse fromCart(Cart cart) {
        CartResponse response = new CartResponse();
        response.setUserId(cart.getUserId());
        response.setItems(
                cart.getItems().stream()
                        .map(CartItemResponse::fromCartItem)
                        .collect(Collectors.toList())
        );
        return response;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<CartItemResponse> getItems() {
        return items;
    }

    public void setItems(List<CartItemResponse> items) {
        this.items = items;
    }
}
