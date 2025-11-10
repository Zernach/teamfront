package com.rapidphotoupload.infrastructure.websocket;

import com.rapidphotoupload.infrastructure.security.JwtService;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.net.URI;
import java.util.Map;

/**
 * Interceptor to authenticate WebSocket connections using JWT tokens.
 */
public class JwtWebSocketHandshakeInterceptor implements HandshakeInterceptor {
    
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
        
        // Extract token from query parameter or header
        URI uri = request.getURI();
        String query = uri.getQuery();
        
        if (query != null && query.contains("token=")) {
            String token = query.substring(query.indexOf("token=") + 6);
            if (token.contains("&")) {
                token = token.substring(0, token.indexOf("&"));
            }
            
            try {
                if (!jwtService.isTokenExpired(token)) {
                    String userId = jwtService.extractUserId(token);
                    attributes.put("userId", userId);
                    return true;
                }
            } catch (Exception e) {
                // Invalid token
                return false;
            }
        }
        
        return false;
    }
    
    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception) {
        // No action needed after handshake
    }
}

