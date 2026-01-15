package com.resumematcher.backend.controller;

import com.resumematcher.backend.model.Job;
import com.resumematcher.backend.model.Resume;
import com.resumematcher.backend.repository.JobRepository;
import com.resumematcher.backend.repository.ResumeRepository;
import com.resumematcher.backend.service.MlClient;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // For development
@RequiredArgsConstructor
public class AppController {

    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final MlClient mlClient;

    @DeleteMapping("/jobs/{id}")
    public void deleteJob(@PathVariable java.util.UUID id) {
        jobRepository.deleteById(id);
    }

    @DeleteMapping("/resumes/{id}")
    public void deleteResume(@PathVariable java.util.UUID id) {
        resumeRepository.deleteById(id);
    }

    @GetMapping("/jobs/{id}")
    public Job getJob(@PathVariable java.util.UUID id) {
        return jobRepository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
    }

    @GetMapping("/resumes")
    public List<Resume> getResumes() {
        // Return only unique filenames (keeping the latest one)
        Map<String, Resume> uniqueResumes = resumeRepository.findAll().stream()
                .collect(java.util.stream.Collectors.toMap(
                        Resume::getFilename,
                        resume -> resume,
                        (existing, replacement) -> existing.getCreatedAt().isAfter(replacement.getCreatedAt())
                                ? existing
                                : replacement));
        return new java.util.ArrayList<>(uniqueResumes.values());
    }

    @GetMapping("/resumes/{id}")
    public Resume getResume(@PathVariable java.util.UUID id) {
        return resumeRepository.findById(id).orElseThrow(() -> new RuntimeException("Resume not found"));
    }

    @PostMapping("/jobs")
    public Job createJob(@RequestBody Job job) {
        // Generate embedding for job description
        List<Double> embedList = mlClient.getEmbedding(job.getDescription());
        job.setEmbedding(listToArray(embedList));
        return jobRepository.save(job);
    }

    @GetMapping("/jobs")
    public List<Job> getJobs() {
        return jobRepository.findAll();
    }

    @PostMapping("/resumes/upload")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file) throws IOException {
        String content;
        String originalFilename = file.getOriginalFilename();

        if (originalFilename != null && originalFilename.toLowerCase().endsWith(".pdf")) {
            try (org.apache.pdfbox.pdmodel.PDDocument document = org.apache.pdfbox.pdmodel.PDDocument
                    .load(file.getInputStream())) {
                org.apache.pdfbox.text.PDFTextStripper stripper = new org.apache.pdfbox.text.PDFTextStripper();
                content = stripper.getText(document);
            }
        } else if (originalFilename != null && originalFilename.toLowerCase().endsWith(".docx")) {
            try (org.apache.poi.xwpf.usermodel.XWPFDocument document = new org.apache.poi.xwpf.usermodel.XWPFDocument(
                    file.getInputStream())) {
                org.apache.poi.xwpf.extractor.XWPFWordExtractor extractor = new org.apache.poi.xwpf.extractor.XWPFWordExtractor(
                        document);
                content = extractor.getText();
            }
        } else {
            // Fallback for TXT or others
            content = new String(file.getBytes(), StandardCharsets.UTF_8);
        }

        // Clean up content slightly
        content = content.replaceAll("\\s+", " ").trim();

        // Check for duplicates (Filename or Content)
        java.util.Optional<Resume> existingOpt = resumeRepository.findByFilename(originalFilename);
        if (existingOpt.isEmpty()) {
            existingOpt = resumeRepository.findByContent(content);
        }

        if (existingOpt.isPresent()) {
            // Return existing resume with a flag
            return ResponseEntity.ok(Map.of(
                    "resume", existingOpt.get(),
                    "message", "Resume already uploaded. Showing matching based on that.",
                    "isDuplicate", true));
        }

        // Processing new resume
        // 1. Get Embeddings
        List<Double> embedList = mlClient.getEmbedding(content);

        // 2. Extract Details (Skills, Email, Phone)
        Map<String, Object> details = mlClient.extractDetails(content);
        @SuppressWarnings("unchecked")
        List<String> skills = (List<String>) details.get("skills");
        String skillsJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(skills);

        String extractedEmail = (String) details.get("email");
        String extractedPhone = (String) details.get("phone");
        String candidateName = (String) details.get("name");

        if (candidateName == null || candidateName.equals("Unknown")) {
            candidateName = "Unknown";
            // Simple fallback
            String[] lines = content.split("\n");
            for (String line : lines) {
                String trimmed = line.trim();
                if (!trimmed.isEmpty() && trimmed.length() < 50 && !trimmed.contains("@")
                        && !trimmed.matches(".*\\d.*")) {
                    candidateName = trimmed;
                    break;
                }
            }
        }

        Resume resume = new Resume();
        resume.setFilename(originalFilename);
        resume.setCandidateName(candidateName);
        resume.setEmail(extractedEmail);
        resume.setPhoneNumber(extractedPhone);
        resume.setContent(content);
        resume.setEmbedding(listToArray(embedList));
        resume.setSkills(skillsJson); // Save skills to DB

        Resume saved = resumeRepository.save(resume);

        // Return new resume with success flag
        return ResponseEntity.ok(Map.of(
                "resume", saved,
                "message", "Resume uploaded successfully.",
                "isDuplicate", false));
    }

    @PostMapping("/match")
    public List<Job> matchJobs(@RequestBody Map<String, String> request) {
        String resumeId = request.get("resumeId");

        Resume resume = resumeRepository.findById(java.util.UUID.fromString(resumeId))
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        // Fetch all jobs and calculate similarity in-memory (MVP approach)
        List<Job> allJobs = jobRepository.findAll();

        return allJobs.stream()
                .map(job -> {
                    double score = cosineSimilarity(resume.getEmbedding(), job.getEmbedding());
                    job.setMatchScore(score);
                    return job;
                })
                .sorted((j1, j2) -> Double.compare(j2.getMatchScore(), j1.getMatchScore()))
                .limit(5)
                .collect(java.util.stream.Collectors.toList());
    }

    private double cosineSimilarity(float[] vectorA, float[] vectorB) {
        if (vectorA == null || vectorB == null || vectorA.length != vectorB.length) {
            return 0.0;
        }
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += Math.pow(vectorA[i], 2);
            normB += Math.pow(vectorB[i], 2);
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // Helper to convert List<Double> to float[]
    private float[] listToArray(List<Double> list) {
        float[] arr = new float[list.size()];
        for (int i = 0; i < list.size(); i++) {
            arr[i] = list.get(i).floatValue();
        }
        return arr;
    }
}
