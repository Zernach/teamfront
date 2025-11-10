package com.rapidphotoupload.infrastructure.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rapidphotoupload.domain.events.PhotoUploadProgressed;
import com.rapidphotoupload.domain.events.UploadJobProgressed;
import com.rapidphotoupload.domain.repositories.PhotoRepository;
import com.rapidphotoupload.domain.repositories.UploadJobRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket handler for real-time upload progress updates.
 */
@Component
public class ProgressWebSocketHandler extends TextWebSocketHandler {
    
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final PhotoRepository photoRepository;
    private final UploadJobRepository uploadJobRepository;
    
    public ProgressWebSocketHandler(PhotoRepository photoRepository, UploadJobRepository uploadJobRepository) {
        this.photoRepository = photoRepository;
        this.uploadJobRepository = uploadJobRepository;
    }
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // Extract user ID from session attributes (set by interceptor)
        String userId = (String) session.getAttributes().get("userId");
        if (userId != null) {
            userSessions.put(userId, session);
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // Remove session when connection closes
        userSessions.entrySet().removeIf(entry -> entry.getValue().equals(session));
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // Handle incoming messages (e.g., ping/pong for keep-alive)
        // For now, we only send progress updates, so no handling needed
    }
    
    /**
     * Listen to PhotoUploadProgressed domain events and send to connected clients.
     */
    @EventListener
    public void handlePhotoUploadProgressed(PhotoUploadProgressed event) {
        // Get photo to find user
        photoRepository.findById(event.photoId()).ifPresent(photo -> {
            String userId = photo.getUploadedBy().getUserId().toString();
            sendProgressUpdate(userId, createProgressMessage(event));
        });
    }
    
    /**
     * Listen to UploadJobProgressed domain events and send to connected clients.
     */
    @EventListener
    public void handleUploadJobProgressed(UploadJobProgressed event) {
        // Get job to find user
        uploadJobRepository.findById(event.jobId()).ifPresent(job -> {
            String userId = job.getUserId().getValue().toString();
            sendProgressUpdate(userId, createJobProgressMessage(event));
        });
    }
    
    private void sendProgressUpdate(String userId, ProgressMessage message) {
        WebSocketSession session = userSessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                String json = objectMapper.writeValueAsString(message);
                session.sendMessage(new TextMessage(json));
            } catch (IOException e) {
                // Log error and remove session
                userSessions.remove(userId);
            }
        }
    }
    
    private ProgressMessage createProgressMessage(PhotoUploadProgressed event) {
        return new ProgressMessage(
            "photo_progress",
            event.photoId().getValue().toString(),
            null, // JobId not available in this event
            event.progressPercentage(),
            100, // Total percentage
            "UPLOADING"
        );
    }
    
    private ProgressMessage createJobProgressMessage(UploadJobProgressed event) {
        return new ProgressMessage(
            "job_progress",
            null,
            event.jobId().getValue().toString(),
            event.completedPhotos(),
            event.totalPhotos(),
            "IN_PROGRESS"
        );
    }
    
    /**
     * Message format for WebSocket progress updates.
     */
    public static class ProgressMessage {
        private String type;
        private String photoId;
        private String jobId;
        private int current;
        private int total;
        private String status;
        
        public ProgressMessage(String type, String photoId, String jobId, int current, int total, String status) {
            this.type = type;
            this.photoId = photoId;
            this.jobId = jobId;
            this.current = current;
            this.total = total;
            this.status = status;
        }
        
        // Getters
        public String getType() { return type; }
        public String getPhotoId() { return photoId; }
        public String getJobId() { return jobId; }
        public int getCurrent() { return current; }
        public int getTotal() { return total; }
        public String getStatus() { return status; }
        
        // Setters for Jackson
        public void setType(String type) { this.type = type; }
        public void setPhotoId(String photoId) { this.photoId = photoId; }
        public void setJobId(String jobId) { this.jobId = jobId; }
        public void setCurrent(int current) { this.current = current; }
        public void setTotal(int total) { this.total = total; }
        public void setStatus(String status) { this.status = status; }
    }
}

