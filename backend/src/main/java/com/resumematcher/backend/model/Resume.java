package com.resumematcher.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
@Data
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private java.util.UUID id;

    private String filename;
    private String candidateName;
    private String email;
    private String phoneNumber;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String skills; // JSON string for simplicity

    @Column(columnDefinition = "float8[]")
    private float[] embedding;

    private LocalDateTime createdAt = LocalDateTime.now();
}
