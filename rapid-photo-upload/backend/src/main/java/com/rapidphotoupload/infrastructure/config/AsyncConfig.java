package com.rapidphotoupload.infrastructure.config;

import com.rapidphotoupload.infrastructure.storage.CloudStorageService;
import com.rapidphotoupload.infrastructure.storage.LocalFileStorageService;
import com.rapidphotoupload.infrastructure.storage.S3PhotoStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.util.concurrent.Executor;

/**
 * Configuration for async processing and storage services.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    
    /**
     * Task executor configured for high-concurrency photo uploads.
     * 
     * PERFORMANCE REQUIREMENTS:
     * - Must handle 100 concurrent photo uploads per user session
     * - Target: 100 photos (2MB each) uploaded in < 90 seconds
     * 
     * CONFIGURATION RATIONALE:
     * - CorePoolSize: 20 threads for immediate processing
     * - MaxPoolSize: 50 threads to handle burst loads
     * - QueueCapacity: 500 to buffer uploads during extreme load
     * - ThreadNamePrefix: For easy identification in logs/profiling
     * 
     * With 50 threads and 2MB average file size:
     * - Theoretical throughput: ~50 files in parallel
     * - With 10Mbps upload: ~1.25MB/s per file = ~2 seconds per 2MB file
     * - 100 files / 50 threads = 2 batches * 2s = ~4-6 seconds ideal
     * - Real-world with overhead: 10-20 seconds well under 90s requirement
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // Core pool: Always active threads for immediate processing
        executor.setCorePoolSize(20);
        
        // Max pool: Peak concurrent upload threads
        // Supports 100 concurrent uploads by processing in 2-3 batches
        executor.setMaxPoolSize(50);
        
        // Queue capacity: Buffer for uploads waiting for thread availability
        // Holds 500 uploads = 5 concurrent users with 100 photos each
        executor.setQueueCapacity(500);
        
        // Thread naming for monitoring and debugging
        executor.setThreadNamePrefix("photo-upload-");
        
        // Rejection policy: Caller-runs ensures no uploads are dropped
        // If queue is full, the HTTP request thread processes the upload
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        
        // Thread lifecycle: Keep idle threads alive for 60 seconds
        executor.setKeepAliveSeconds(60);
        executor.setAllowCoreThreadTimeOut(true);
        
        // Graceful shutdown: Wait up to 30 seconds for uploads to complete
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        
        executor.initialize();
        return executor;
    }
    
    /**
     * Configure AWS S3 Client bean.
     * Uses DefaultCredentialsProvider which checks for credentials in this order:
     * 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
     * 2. System properties
     * 3. AWS credentials file (~/.aws/credentials)
     * 4. EC2 instance profile credentials
     */
    @Bean
    public S3Client s3Client(@Value("${cloud.storage.s3.region:us-west-1}") String region) {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
    
    /**
     * Configure AWS S3 Presigner bean for generating presigned URLs.
     */
    @Bean
    public S3Presigner s3Presigner(@Value("${cloud.storage.s3.region:us-west-1}") String region) {
        return S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
    
    /**
     * Configure CloudStorageService bean.
     * Uses S3PhotoStorageService for production with S3, 
     * or LocalFileStorageService for local development.
     */
    @Bean
    public CloudStorageService cloudStorageService(
            @Value("${cloud.storage.type:local}") String storageType,
            @Value("${cloud.storage.local.directory:./uploads}") String localDirectory,
            @Value("${cloud.storage.s3.bucket-name:}") String s3BucketName,
            @Value("${cloud.storage.s3.presigned-url-expiration-minutes:60}") int presignedUrlExpiration,
            S3Client s3Client,
            S3Presigner s3Presigner) {
        
        if ("s3".equalsIgnoreCase(storageType)) {
            if (s3BucketName == null || s3BucketName.isBlank()) {
                throw new IllegalArgumentException("S3 bucket name must be configured when using S3 storage type");
            }
            return new S3PhotoStorageService(s3Client, s3Presigner, s3BucketName, presignedUrlExpiration);
        } else {
            // Default to local file storage for development
            return new LocalFileStorageService(localDirectory);
        }
    }
}

