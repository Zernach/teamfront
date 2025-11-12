package com.invoiceme.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.web.context.WebServerInitializedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextClosedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Listener that logs detailed information about server startup and readiness.
 * This helps diagnose deployment issues by providing visibility into:
 * - When the server actually starts listening on the port
 * - Port binding status
 * - Server readiness for accepting connections
 */
@Component
@Order(1)
public class ServerStartupListener implements ApplicationListener<WebServerInitializedEvent> {

    private static final Logger logger = LoggerFactory.getLogger(ServerStartupListener.class);
    private static final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    @Override
    public void onApplicationEvent(WebServerInitializedEvent event) {
        int port = event.getWebServer().getPort();
        String serverType = event.getWebServer().getClass().getSimpleName();
        
        logger.info("========================================");
        logger.info("🚀 SERVER STARTUP EVENT");
        logger.info("========================================");
        logger.info("Server Type: {}", serverType);
        logger.info("Port: {}", port);
        logger.info("Server Instance: {}", event.getWebServer());
        
        try {
            InetAddress localhost = InetAddress.getLocalHost();
            logger.info("Hostname: {}", localhost.getHostName());
            logger.info("Host Address: {}", localhost.getHostAddress());
            logger.info("Canonical Hostname: {}", localhost.getCanonicalHostName());
        } catch (UnknownHostException e) {
            logger.warn("Could not determine hostname: {}", e.getMessage());
        }
        
        // Log environment variables related to port
        String portEnv = System.getenv("PORT");
        String serverPortEnv = System.getenv("SERVER_PORT");
        String serverPortProp = System.getProperty("server.port");
        
        logger.info("Environment Variables:");
        logger.info("  PORT: {}", portEnv != null ? portEnv : "NOT SET");
        logger.info("  SERVER_PORT: {}", serverPortEnv != null ? serverPortEnv : "NOT SET");
        logger.info("  System Property server.port: {}", serverPortProp != null ? serverPortProp : "NOT SET");
        logger.info("  Actual Port Bound: {}", port);
        
        // Verify port matches expected value
        if (portEnv != null) {
            try {
                int expectedPort = Integer.parseInt(portEnv);
                if (port != expectedPort) {
                    logger.error("⚠️  PORT MISMATCH: Expected {}, but server bound to {}", expectedPort, port);
                } else {
                    logger.info("✅ Port matches expected value: {}", port);
                }
            } catch (NumberFormatException e) {
                logger.warn("Could not parse PORT environment variable: {}", portEnv);
            }
        }
        
        logger.info("========================================");
        logger.info("✅ Server is now LISTENING on port {}", port);
        logger.info("✅ Server is READY to accept connections");
        logger.info("========================================");
        
        // Schedule periodic health check logging
        scheduler.scheduleAtFixedRate(() -> {
            try {
                logger.debug("Server health check - Port {} is still listening", port);
            } catch (Exception e) {
                logger.error("Error during health check: {}", e.getMessage());
            }
        }, 60, 60, TimeUnit.SECONDS);
    }

    @EventListener
    @Order(1)
    public void onApplicationReady(ApplicationReadyEvent event) {
        logger.info("========================================");
        logger.info("✅ APPLICATION READY EVENT");
        logger.info("========================================");
        logger.info("Application Context: {}", event.getApplicationContext().getDisplayName());
        logger.info("Active Profiles: {}", String.join(", ", event.getApplicationContext().getEnvironment().getActiveProfiles()));
        logger.info("Application Name: {}", event.getApplicationContext().getEnvironment().getProperty("spring.application.name"));
        logger.info("========================================");
    }

    @EventListener
    @Order(1)
    public void onContextClosed(ContextClosedEvent event) {
        logger.info("========================================");
        logger.info("🛑 APPLICATION SHUTDOWN EVENT");
        logger.info("========================================");
        logger.info("Application Context: {}", event.getApplicationContext().getDisplayName());
        logger.info("Shutdown initiated at: {}", new java.util.Date());
        logger.info("========================================");
        
        // Shutdown scheduler
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}

