package com.ecommerce.cart.service;

import com.ecommerce.cart.dto.AddCartItemRequest;
import com.ecommerce.cart.dto.CartResponse;
import com.ecommerce.cart.dto.CartSummaryResponse;
import com.ecommerce.cart.exception.CartItemNotFoundException;
import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.model.CartItem;
import com.ecommerce.cart.repository.CartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    private CartService cartService;

    @BeforeEach
    void setUp() {
        cartService = new CartService(cartRepository);
    }

    @Test
    void testAddItem_NewCart() {
        when(cartRepository.getCartByUserId("user-1")).thenReturn(null);

        AddCartItemRequest request = new AddCartItemRequest();
        request.setProductId("prod-10");
        request.setProductName("Silk Dress");
        request.setPrice(350.0);
        request.setQuantity(2);

        CartResponse response = cartService.addItem("user-1", request);

        assertNotNull(response);
        assertEquals("user-1", response.getUserId());
        assertEquals(1, response.getItems().size());
        assertEquals("prod-10", response.getItems().get(0).getProductId());
        assertEquals(2, response.getItems().get(0).getQuantity());

        verify(cartRepository, times(1)).saveCart(any(Cart.class));
    }

    @Test
    void testAddItem_ExistingCart_IncreasesQuantity() {
        Cart cart = new Cart();
        cart.setUserId("user-1");
        CartItem existingItem = new CartItem();
        existingItem.setProductId("prod-10");
        existingItem.setProductName("Silk Dress");
        existingItem.setPrice(350.0);
        existingItem.setQuantity(1);
        cart.getItems().add(existingItem);

        when(cartRepository.getCartByUserId("user-1")).thenReturn(cart);

        AddCartItemRequest request = new AddCartItemRequest();
        request.setProductId("prod-10");
        request.setProductName("Silk Dress");
        request.setPrice(350.0);
        request.setQuantity(3);

        CartResponse response = cartService.addItem("user-1", request);

        assertEquals(1, response.getItems().size());
        assertEquals(4, response.getItems().get(0).getQuantity());
    }

    @Test
    void testGetCart_Empty() {
        when(cartRepository.getCartByUserId("user-2")).thenReturn(null);

        CartResponse response = cartService.getCart("user-2");

        assertNotNull(response);
        assertEquals("user-2", response.getUserId());
        assertTrue(response.getItems().isEmpty());
    }

    @Test
    void testGetCartSummary() {
        Cart cart = new Cart();
        cart.setUserId("user-1");
        CartItem item1 = new CartItem();
        item1.setProductId("p1");
        item1.setPrice(100.0);
        item1.setQuantity(2);

        CartItem item2 = new CartItem();
        item2.setProductId("p2");
        item2.setPrice(50.0);
        item2.setQuantity(1);

        cart.getItems().add(item1);
        cart.getItems().add(item2);

        when(cartRepository.getCartByUserId("user-1")).thenReturn(cart);

        CartSummaryResponse summary = cartService.getCartSummary("user-1");

        assertNotNull(summary);
        assertEquals(2, summary.getTotalItems());
        assertEquals(3, summary.getTotalQuantity());
        assertEquals(250.0, summary.getTotalAmount());
    }

    @Test
    void testUpdateItemQuantity_Success() {
        Cart cart = new Cart();
        cart.setUserId("user-1");
        CartItem item = new CartItem();
        item.setProductId("prod-1");
        item.setQuantity(1);
        cart.getItems().add(item);

        when(cartRepository.getCartByUserId("user-1")).thenReturn(cart);

        CartResponse response = cartService.updateItemQuantity("user-1", "prod-1", 5);

        assertEquals(5, response.getItems().get(0).getQuantity());
        verify(cartRepository, times(1)).saveCart(any(Cart.class));
    }

    @Test
    void testRemoveItem_Success() {
        Cart cart = new Cart();
        cart.setUserId("user-1");
        CartItem item = new CartItem();
        item.setProductId("prod-1");
        cart.getItems().add(item);

        when(cartRepository.getCartByUserId("user-1")).thenReturn(cart);

        CartResponse response = cartService.removeItem("user-1", "prod-1");

        assertTrue(response.getItems().isEmpty());
        verify(cartRepository, times(1)).saveCart(any(Cart.class));
    }

    @Test
    void testRemoveItem_NotFound_ThrowsException() {
        Cart cart = new Cart();
        cart.setUserId("user-1");
        when(cartRepository.getCartByUserId("user-1")).thenReturn(cart);

        assertThrows(CartItemNotFoundException.class, () -> cartService.removeItem("user-1", "unknown-prod"));
    }

    @Test
    void testClearCart() {
        cartService.clearCart("user-1");
        verify(cartRepository, times(1)).deleteCart("user-1");
    }
}
