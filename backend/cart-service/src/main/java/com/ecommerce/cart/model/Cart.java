package com.ecommerce.cart.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * A user's shopping Cart. One record per userId in L_CartTable.
 */
public class Cart {

    private String userId;
    private List<CartItem> items;

    public Cart() {
        this.items = new ArrayList<>();
    }

    public Cart(String userId, List<CartItem> items) {
        this.userId = userId;
        this.items = items != null ? items : new ArrayList<>();
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items != null ? items : new ArrayList<>();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Cart)) return false;
        Cart cart = (Cart) o;
        return Objects.equals(userId, cart.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId);
    }

    @Override
    public String toString() {
        return "Cart{" +
                "userId='" + userId + '\'' +
                ", items=" + items +
                '}';
    }
}
