package com.resumematcher.backend.repository;

import com.resumematcher.backend.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, UUID> {
    java.util.Optional<Resume> findByContent(String content);

    java.util.Optional<Resume> findByCandidateName(String candidateName);

    java.util.Optional<Resume> findByEmail(String email);

    java.util.Optional<Resume> findByFilename(String filename);
}
