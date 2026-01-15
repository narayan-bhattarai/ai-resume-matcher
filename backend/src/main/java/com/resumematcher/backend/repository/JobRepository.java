package com.resumematcher.backend.repository;

import com.resumematcher.backend.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {

    // We will retrieve all jobs and filter in application memory for MVP
    // as standard PostgreSQL arrays don't support vector search operators
    // efficiently without extension
    @Query(value = "SELECT * FROM jobs", nativeQuery = true)
    List<Job> findAllNative();
}
