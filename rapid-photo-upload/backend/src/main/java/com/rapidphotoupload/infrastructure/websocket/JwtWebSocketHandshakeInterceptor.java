package com.rapidphotoupload.infrastructure.websocket;

import com.rapidphotoupload.infrastructure.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Interceptor to authenticate WebSocket connections using JWT tokens.
 */
public class JwtWebSocketHandshakeInterceptor implements HandshakeInterceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtWebSocketHandshakeInterceptor.class);
    private static final String ANONYMOUS_USER_ID = "00000000-0000-0000-0000-000000000000";
    
    private final JwtService jwtService;
    
    public JwtWebSocketHandshakeInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }
    
    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes) throws Exception {
        
        logger.info("WebSocket handshake request from: {}", request.getRemoteAddress());
        
        String token = extractToken(request.getURI());
        if (token != null && !token.isBlank()) {
            logger.debug("WebSocket token provided, attempting validation");
            try {
                if (!jwtService.isTokenExpired(token)) {
                    String userId = jwtService.extractUserId(token);
                    attributes.put("userId", userId);
                    logger.info("WebSocket connection authenticated for user: {}", userId);
                    return true;
                } else {
                    logger.warn("WebSocket token is expired, falling back to anonymous user");
                    // Fall through to anonymous user instead of rejecting
                }
            } catch (Exception e) {
                logger.warn("Invalid WebSocket token supplied, falling back to anonymous user: {}", e.getMessage());
                // Fall through to anonymous user instead of rejecting
            }
        } else {
            logger.debug("No WebSocket token provided");
        }
        
        // Allow anonymous uploads to receive progress updates
        attributes.put("userId", ANONYMOUS_USER_ID);
        logger.info("WebSocket connection established for anonymous user");
        return true;
    }
    
    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {
        // No action needed after handshake
    }
    
    private String extractToken(URI uri) {
        if (uri == null || uri.getQuery() == null) {
            return null;
        }
        String[] params = uri.getQuery().split("&");
        for (String param : params) {
            String[] parts = param.split("=", 2);
            if (parts.length == 2 && "token".equals(parts[0])) {
                return URLDecoder.decode(parts[1], StandardCharsets.UTF_8);
            }
        }
        return null;
    }
}
