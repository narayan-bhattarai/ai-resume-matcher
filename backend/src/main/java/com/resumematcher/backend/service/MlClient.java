package com.resumematcher.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.List;
import java.util.Map;

@Service
public class MlClient {

    private final RestClient restClient;

    public MlClient(RestClient.Builder builder) {
        // Points to localhost for local execution
        this.restClient = builder.baseUrl("http://localhost:8000").build();
    }

    public List<Double> getEmbedding(String text) {
        @SuppressWarnings("unchecked")
        Map<String, Object> response = restClient.post()
                .uri("/embed")
                .body(Map.of("text", text))
                .retrieve()
                .body(Map.class);

        if (response == null || !response.containsKey("embedding")) {
            throw new RuntimeException("Failed to get embedding from ML service");
        }

        return (List<Double>) response.get("embedding");
    }

    public Map<String, Object> extractDetails(String text) {
        @SuppressWarnings("unchecked")
        Map<String, Object> response = restClient.post()
                .uri("/extract_info")
                .body(Map.of("text", text))
                .retrieve()
                .body(Map.class);

        if (response == null) {
            return Map.of("skills", List.of(), "email", "", "phone", "");
        }

        return response;
    }
}
