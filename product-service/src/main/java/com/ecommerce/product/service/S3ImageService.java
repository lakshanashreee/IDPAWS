package com.ecommerce.product.service;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import java.time.Duration;
import java.util.Set;
import java.util.UUID;

/**
 * Handles all S3 image operations for the Product Service:
 *
 *  1. generatePresignedPutUrl() – produces a short-lived pre-signed PUT URL
 *     that the browser uses to upload a product image directly to S3 without
 *     routing the binary data through Lambda.
 *
 *  2. buildPublicUrl()          – derives the public HTTPS URL for a given key.
 *
 *  3. deleteObject()            – removes a stale S3 object when the admin
 *     replaces a product image (avoids bucket bloat).
 *
 * Configuration is driven by two Lambda environment variables:
 *   PRODUCT_IMAGES_BUCKET – name of the S3 bucket (required)
 *   AWS_REGION            – injected automatically by the Lambda runtime
 */
public class S3ImageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );
    /** Pre-signed URL validity window – 5 minutes is more than enough. */
    private static final Duration PRESIGN_TTL = Duration.ofMinutes(5);
    /** Maximum allowed raw file size that a pre-signed URL will accept (10 MB). */
    private static final long MAX_CONTENT_LENGTH = 10 * 1024 * 1024L;

    private final String bucketName;
    private final String region;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    public S3ImageService() {
        this.bucketName = requireEnv("PRODUCT_IMAGES_BUCKET");
        // AWS_REGION is set automatically by the Lambda runtime.
        this.region = System.getenv("AWS_REGION") != null
                ? System.getenv("AWS_REGION")
                : "ap-southeast-1";

        Region awsRegion = Region.of(this.region);
        this.s3Client = S3Client.builder().region(awsRegion).build();
        this.s3Presigner = S3Presigner.builder().region(awsRegion).build();
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Returns a pre-signed PUT URL that the browser can use to upload the image
     * directly to S3.  Also returns the resulting public URL that should later
     * be stored in DynamoDB.
     *
     * @param originalFilename original file name (e.g. "photo.jpg")
     * @param contentType      MIME type (e.g. "image/jpeg")
     * @return {@link PresignResult} containing the upload URL and the final image URL
     * @throws IllegalArgumentException if the content type is not in the allowed set
     */
    public PresignResult generatePresignedPutUrl(String originalFilename, String contentType) {
        validateContentType(contentType);

        String objectKey = buildObjectKey(originalFilename);
        String imageUrl   = buildPublicUrl(objectKey);

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(PRESIGN_TTL)
                .putObjectRequest(putObjectRequest)
                .build();

        PresignedPutObjectRequest presigned = s3Presigner.presignPutObject(presignRequest);

        return new PresignResult(presigned.url().toString(), imageUrl);
    }

    /**
     * Returns a pre-signed GET URL that allows read access to the image.
     * This avoids having to make the entire S3 bucket public.
     *
     * @param imageUrl the public URL stored in DynamoDB
     * @return a pre-signed GET URL, or the original URL if it couldn't be presigned
     */
    public String getPresignedGetUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return imageUrl;

        String key = extractKeyFromUrl(imageUrl);
        if (key == null || key.isBlank()) return imageUrl;

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(PRESIGN_TTL)
                .getObjectRequest(getObjectRequest)
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    /**
     * Deletes an S3 object by its public URL.
     * Silently ignores null/blank URLs and URLs that do not belong to this bucket.
     *
     * @param imageUrl the public URL stored in DynamoDB (e.g. "https://bucket.s3.region.amazonaws.com/products/uuid-photo.jpg")
     */
    public void deleteObject(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return;

        String key = extractKeyFromUrl(imageUrl);
        if (key == null || key.isBlank()) return;

        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build());
        } catch (Exception e) {
            // Log but don't propagate — a stale image is not a fatal error.
            System.err.println("[S3ImageService] Warning: failed to delete S3 object '"
                    + key + "': " + e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Builds a unique, collision-resistant S3 object key.
     * Format: products/{UUID}-{sanitisedFilename}
     */
    private String buildObjectKey(String originalFilename) {
        String safe = originalFilename == null
                ? "image"
                : originalFilename.replaceAll("[^a-zA-Z0-9._\\-]", "_");
        return "products/" + UUID.randomUUID() + "-" + safe;
    }

    /**
     * Derives the public HTTPS URL for a given object key.
     * Pattern: https://{bucket}.s3.{region}.amazonaws.com/{key}
     */
    public String buildPublicUrl(String objectKey) {
        return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + objectKey;
    }

    /**
     * Extracts the S3 object key from a full public URL.
     * Handles URLs of the form:
     *   https://bucket.s3.region.amazonaws.com/products/uuid-file.jpg
     *
     * Returns null if the URL cannot be parsed.
     */
    private String extractKeyFromUrl(String url) {
        try {
            // Strip the scheme + bucket + s3 host portion.
            String host = bucketName + ".s3." + region + ".amazonaws.com/";
            int idx = url.indexOf(host);
            if (idx < 0) return null;
            return url.substring(idx + host.length());
        } catch (Exception e) {
            return null;
        }
    }

    private void validateContentType(String contentType) {
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Unsupported image type: " + contentType
                            + ". Allowed types: " + ALLOWED_CONTENT_TYPES);
        }
    }

    private static String requireEnv(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing required environment variable: " + name);
        }
        return value;
    }

    // -------------------------------------------------------------------------
    // Result DTO
    // -------------------------------------------------------------------------

    /** Immutable result returned from {@link #generatePresignedPutUrl}. */
    public static class PresignResult {
        private final String uploadUrl;
        private final String imageUrl;

        public PresignResult(String uploadUrl, String imageUrl) {
            this.uploadUrl = uploadUrl;
            this.imageUrl  = imageUrl;
        }

        public String getUploadUrl() { return uploadUrl; }
        public String getImageUrl()  { return imageUrl;  }
    }
}
