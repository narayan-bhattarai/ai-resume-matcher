package com.resumematcher.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Data
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private java.util.UUID id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "float8[]")
    private float[] embedding;

    @Transient
    private double matchScore;

    private LocalDateTime createdAt = LocalDateTime.now();
}
