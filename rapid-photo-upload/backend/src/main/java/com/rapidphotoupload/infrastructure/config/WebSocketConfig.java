package com.rapidphotoupload.infrastructure.config;

import com.rapidphotoupload.infrastructure.security.JwtService;
import com.rapidphotoupload.infrastructure.websocket.JwtWebSocketHandshakeInterceptor;
import com.rapidphotoupload.infrastructure.websocket.ProgressWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket configuration for real-time upload progress updates.
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    private final ProgressWebSocketHandler progressWebSocketHandler;
    private final JwtService jwtService;
    
    public WebSocketConfig(ProgressWebSocketHandler progressWebSocketHandler, JwtService jwtService) {
        this.progressWebSocketHandler = progressWebSocketHandler;
        this.jwtService = jwtService;
    }
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(progressWebSocketHandler, "/ws/progress")
                .addInterceptors(new JwtWebSocketHandshakeInterceptor(jwtService))
                .setAllowedOrigins("*"); // In production, configure specific origins
    }
}

