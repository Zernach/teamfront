package com.rapidphotoupload.infrastructure.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;

/**
 * AWS S3 implementation of CloudStorageService.
 * Uploads photos to configured S3 bucket and generates presigned URLs for secure access.
 */
public class S3PhotoStorageService implements CloudStorageService {
    
    private static final Logger logger = LoggerFactory.getLogger(S3PhotoStorageService.class);
    
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String bucketName;
    private final int presignedUrlExpirationMinutes;
    
    public S3PhotoStorageService(
            S3Client s3Client,
            S3Presigner s3Presigner,
            String bucketName,
            int presignedUrlExpirationMinutes) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.bucketName = bucketName;
        this.presignedUrlExpirationMinutes = presignedUrlExpirationMinutes;
        logger.info("S3PhotoStorageService initialized with bucket: {}", bucketName);
    }
    
    @Override
    public String upload(String key, InputStream inputStream, String contentType) {
        try {
            // Read all bytes from input stream
            byte[] fileBytes = inputStream.readAllBytes();
            
            // Build the put object request
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .contentLength((long) fileBytes.length)
                    .build();
            
            // Upload the file
            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileBytes));
            
            logger.info("Successfully uploaded file to S3: s3://{}/{}", bucketName, key);
            return key;
            
        } catch (S3Exception e) {
            logger.error("Failed to upload file to S3: {} - Error: {}", key, e.awsErrorDetails().errorMessage(), e);
            throw new RuntimeException("Failed to upload file to S3: " + e.awsErrorDetails().errorMessage(), e);
        } catch (IOException e) {
            logger.error("Failed to read input stream for S3 upload: {}", key, e);
            throw new RuntimeException("Failed to read file for upload", e);
        }
    }
    
    @Override
    public InputStream download(String key) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
            
            logger.debug("Downloading file from S3: s3://{}/{}", bucketName, key);
            return s3Client.getObject(getObjectRequest);
            
        } catch (NoSuchKeyException e) {
            logger.warn("File not found in S3: s3://{}/{}", bucketName, key);
            return null;
        } catch (S3Exception e) {
            logger.error("Failed to download file from S3: {} - Error: {}", key, e.awsErrorDetails().errorMessage(), e);
            throw new RuntimeException("Failed to download file from S3: " + e.awsErrorDetails().errorMessage(), e);
        }
    }
    
    @Override
    public void delete(String key) {
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
            
            s3Client.deleteObject(deleteObjectRequest);
            logger.info("Successfully deleted file from S3: s3://{}/{}", bucketName, key);
            
        } catch (S3Exception e) {
            logger.error("Failed to delete file from S3: {} - Error: {}", key, e.awsErrorDetails().errorMessage(), e);
            throw new RuntimeException("Failed to delete file from S3: " + e.awsErrorDetails().errorMessage(), e);
        }
    }
    
    @Override
    public String getPublicUrl(String key) {
        // For S3, we generate presigned URLs with default expiration
        return generatePresignedUrl(key, presignedUrlExpirationMinutes);
    }
    
    @Override
    public String generatePresignedUrl(String key, int expirationMinutes) {
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
            
            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(expirationMinutes > 0 ? expirationMinutes : presignedUrlExpirationMinutes))
                    .getObjectRequest(getObjectRequest)
                    .build();
            
            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            String url = presignedRequest.url().toString();
            
            logger.debug("Generated presigned URL for s3://{}/{} (expires in {} minutes)", 
                    bucketName, key, expirationMinutes);
            return url;
            
        } catch (S3Exception e) {
            logger.error("Failed to generate presigned URL for S3 object: {} - Error: {}", 
                    key, e.awsErrorDetails().errorMessage(), e);
            throw new RuntimeException("Failed to generate presigned URL: " + e.awsErrorDetails().errorMessage(), e);
        }
    }
}

