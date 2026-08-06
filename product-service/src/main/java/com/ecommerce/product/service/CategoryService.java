package com.ecommerce.product.service;

import com.ecommerce.product.model.Category;
import com.ecommerce.product.model.Product;
import com.ecommerce.product.repository.CategoryRepository;
import com.ecommerce.product.repository.ProductRepository;
import com.ecommerce.product.util.IdGenerator;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.logging.Logger;

public class CategoryService {

    private static final Logger LOGGER = Logger.getLogger(CategoryService.class.getName());

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService() {
        this.categoryRepository = new CategoryRepository();
        this.productRepository = new ProductRepository();
    }

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    public Category createCategory(Category request) {
        String now = Instant.now().toString();

        Category category = new Category();
        category.setCategoryId(IdGenerator.generateCategoryId());
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setCreatedAt(now);
        category.setUpdatedAt(now);

        categoryRepository.saveCategory(category);
        return category;
    }

    public List<Category> getAllCategories() {
        // Auto-extract categories from products
        List<Product> products = productRepository.getAllProducts();
        Set<String> productCategories = products.stream()
                .map(Product::getCategory)
                .filter(c -> c != null && !c.isBlank())
                .collect(Collectors.toSet());
        
        List<Category> existingCategories = categoryRepository.getAllCategories();
        Set<String> existingCategoryNames = existingCategories.stream()
                .map(Category::getName)
                .collect(Collectors.toSet());
        
        for (String catName : productCategories) {
            if (!existingCategoryNames.contains(catName)) {
                Category newCat = new Category();
                newCat.setCategoryId(IdGenerator.generateCategoryId());
                newCat.setName(catName);
                newCat.setCreatedAt(Instant.now().toString());
                newCat.setUpdatedAt(Instant.now().toString());
                categoryRepository.saveCategory(newCat);
                existingCategories.add(newCat);
                LOGGER.info("Auto-created missing category: " + catName);
            }
        }
        
        return existingCategories;
    }

    public Category updateCategory(String categoryId, Category request) {
        Category existing = categoryRepository.getCategory(categoryId);
        if (existing == null) {
            throw new IllegalArgumentException("Category not found");
        }

        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setImageUrl(request.getImageUrl());
        existing.setUpdatedAt(Instant.now().toString());

        categoryRepository.saveCategory(existing);
        return existing;
    }

    public void deleteCategory(String categoryId) {
        Category existing = categoryRepository.getCategory(categoryId);
        if (existing == null) {
            throw new IllegalArgumentException("Category not found");
        }
        categoryRepository.deleteCategory(categoryId);
    }
}
