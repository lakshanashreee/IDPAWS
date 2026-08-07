package com.ecommerce.common.security;

import java.util.Set;

public class UserContext {
    private final String userId;
    private final String email;
    private final String username;
    private final Set<String> groups;

    public UserContext(String userId, String email, String username, Set<String> groups) {
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.groups = groups;
    }

    public String getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getUsername() {
        return username;
    }

    public Set<String> getGroups() {
        return groups;
    }

    public boolean hasRole(String role) {
        return groups != null && groups.contains(role.toUpperCase());
    }

    public boolean isAdmin() {
        return hasRole("ADMIN");
    }

    public boolean isCustomer() {
        return hasRole("CUSTOMER");
    }
}
