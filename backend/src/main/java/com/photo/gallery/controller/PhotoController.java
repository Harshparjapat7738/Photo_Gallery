package com.photo.gallery.controller;

import com.photo.gallery.model.Photo;
import com.photo.gallery.security.SessionAuth;
import com.photo.gallery.service.AlbumService;
import com.photo.gallery.service.PhotoService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/jsonplaceholder.typicode.com/photo")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;
    private final AlbumService albumService;

    private static final String UPLOAD_DIR = "src/main/resources/static/images";

    // Upload multiple images to an album
    @PostMapping("/album/{albumId}/upload")
    public ResponseEntity<List<Photo>> uploadImages(
            @PathVariable String albumId,
            @RequestParam("files") MultipartFile[] files,
            HttpSession session) {

        String userId = SessionAuth.requireUserId(session);
        albumService.getOwnedAlbum(albumId, userId);
        List<Photo> uploadedPhotos = new ArrayList<>();

        try {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            for (MultipartFile file : files) {
                String originalFileName = file.getOriginalFilename();
                String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
                String savedFileName = UUID.randomUUID().toString() + fileExtension;

                Path filePath = Paths.get(UPLOAD_DIR, savedFileName);
                Files.write(filePath, file.getBytes());

                String imageUrl = "https://photo-gallery-2-j186.onrender.com/images/" + savedFileName;

                Photo photo = new Photo();
                photo.setAlbumId(albumId);
                photo.setImageTitle(originalFileName);
                photo.setImageDescription("Uploaded image");
                photo.setImageUrl(imageUrl);
                photo.setSortOrder(uploadedPhotos.size() + 1);
                photo.setCreatedAt(Instant.now());
                photo.setUpdatedAt(Instant.now());

                Photo savedPhoto = photoService.addPhotoToAlbum(albumId, photo, userId);
                uploadedPhotos.add(savedPhoto);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(uploadedPhotos);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get all photos in an album
    @GetMapping("/album/{albumId}")
    public ResponseEntity<List<Photo>> getPhotosByAlbum(@PathVariable String albumId) {
        return ResponseEntity.ok(photoService.getPhotosByAlbum(albumId));
    }

    // Get Photo by id
    @GetMapping("/{id}")
    public ResponseEntity<Photo> getPhotoById(@PathVariable String id) {
        return ResponseEntity.ok(photoService.getPhotoById(id));
    }

    // Update Photo
    @PutMapping("/{id}")
    public ResponseEntity<Photo> updatePhoto(
            @PathVariable String id,
            @RequestBody Photo photo,
            HttpSession session) {
        return ResponseEntity.ok(photoService.updatePhoto(id, photo, SessionAuth.requireUserId(session)));
    }

    // Delete Photo
    @DeleteMapping("/{id}")
    public ResponseEntity<Photo> deletePhoto(@PathVariable String id, HttpSession session) {
        return ResponseEntity.ok(photoService.deletePhoto(id, SessionAuth.requireUserId(session)));
    }
}
