package com.ecommerce.product.service;

import com.ecommerce.product.model.Category;
import com.ecommerce.product.repository.CategoryRepository;
import com.ecommerce.product.util.IdGenerator;

import java.time.Instant;
import java.util.List;

public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final S3ImageService s3ImageService;

    public CategoryService() {
        this.categoryRepository = new CategoryRepository();
        this.s3ImageService = new S3ImageService();
    }

    public CategoryService(CategoryRepository categoryRepository, S3ImageService s3ImageService) {
        this.categoryRepository = categoryRepository;
        this.s3ImageService = s3ImageService;
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
        return categoryRepository.getAllCategories();
    }

    public Category updateCategory(String categoryId, Category request) {
        Category existing = categoryRepository.getCategory(categoryId);
        if (existing == null) {
            throw new RuntimeException("Category not found");
        }

        if (request.getImageUrl() != null && !request.getImageUrl().equals(existing.getImageUrl())) {
            if (existing.getImageUrl() != null) {
                try {
                    s3ImageService.deleteObject(existing.getImageUrl());
                } catch (Exception e) {
                    System.err.println("Failed to delete old category image from S3: " + e.getMessage());
                }
            }
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
            throw new RuntimeException("Category not found");
        }
        if (existing.getImageUrl() != null) {
            try {
                s3ImageService.deleteObject(existing.getImageUrl());
            } catch (Exception e) {
                System.err.println("Failed to delete category image from S3: " + e.getMessage());
            }
        }
        categoryRepository.deleteCategory(categoryId);
    }
}
