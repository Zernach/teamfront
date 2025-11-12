package com.invoiceme;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Arrays;
import java.util.Date;

@SpringBootApplication(scanBasePackages = {"com.invoiceme"})
public class InvoiceMeApplication {

    private static final Logger logger = LoggerFactory.getLogger(InvoiceMeApplication.class);

    public static void main(String[] args) {
        logger.info("========================================");
        logger.info("🚀 STARTING INVOICE ME BACKEND");
        logger.info("========================================");
        logger.info("Startup Time: {}", new Date());
        logger.info("Java Version: {}", System.getProperty("java.version"));
        logger.info("Java Home: {}", System.getProperty("java.home"));
        logger.info("Working Directory: {}", System.getProperty("user.dir"));
        logger.info("Command Line Args: {}", Arrays.toString(args));

        // Log environment variables
        logger.info("Environment Variables:");
        logger.info("  PORT: {}", System.getenv("PORT"));
        logger.info("  SERVER_PORT: {}", System.getenv("SERVER_PORT"));
        logger.info("  SPRING_PROFILES_ACTIVE: {}", System.getenv("SPRING_PROFILES_ACTIVE"));
        logger.info("  JAVA_OPTS: {}", System.getenv("JAVA_OPTS"));

        // Log system properties
        logger.info("System Properties:");
        logger.info("  server.port: {}", System.getProperty("server.port"));
        logger.info("  spring.profiles.active: {}", System.getProperty("spring.profiles.active"));

        try {
            SpringApplication app = new SpringApplication(InvoiceMeApplication.class);
            logger.info("Starting Spring Application...");
            app.run(args);
        } catch (Exception e) {
            logger.error("========================================");
            logger.error("❌ FAILED TO START APPLICATION");
            logger.error("========================================");
            logger.error("Error: {}", e.getMessage(), e);
            logger.error("========================================");
            throw e;
        }
    }
}

// ProdController removed - HelloController now handles all environments

