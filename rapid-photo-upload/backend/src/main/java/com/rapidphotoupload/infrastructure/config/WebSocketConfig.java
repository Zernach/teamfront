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
 * Registers JWT handshake interceptor so sessions can be tied to specific users.
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    private final ProgressWebSocketHandler progressWebSocketHandler;
    private final JwtWebSocketHandshakeInterceptor handshakeInterceptor;
    
    public WebSocketConfig(ProgressWebSocketHandler progressWebSocketHandler, JwtService jwtService) {
        this.progressWebSocketHandler = progressWebSocketHandler;
        this.handshakeInterceptor = new JwtWebSocketHandshakeInterceptor(jwtService);
    }
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(progressWebSocketHandler, "/ws/progress")
                .addInterceptors(handshakeInterceptor)
                .setAllowedOriginPatterns("*");
    }
}
 
