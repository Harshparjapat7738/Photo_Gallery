package com.photo.gallery.service;

import com.photo.gallery.model.Album;
import com.photo.gallery.model.Photo;
import com.photo.gallery.repository.AlbumRepo;
import com.photo.gallery.repository.PhotoRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PhotoService {

    @Autowired
    private AlbumRepo albumRepo;

    @Autowired
    private PhotoRepo photoRepo;

    @Autowired
    private AlbumService albumService;

    // Upload/Add Photo to Album
    public Photo addPhotoToAlbum(String albumId, Photo photo) {
        Album album = albumService.getOwnedAlbum(albumId);

        photo.setAlbumId(albumId);
        photo.setCreatedAt(Instant.now());
        photo.setUpdatedAt(Instant.now());

        Photo savedPhoto = photoRepo.save(photo);

        Integer count = album.getPhotoCount() == null ? 0 : album.getPhotoCount();
        album.setPhotoCount(count + 1);

        if (album.getCoverImage() == null || album.getCoverImage().isEmpty()) {
            album.setCoverImage(savedPhoto.getImageUrl());
        }

        albumRepo.save(album);

        return savedPhoto;
    }

    // Get all photos in an album
    public List<Photo> getPhotosByAlbum(String albumId) {
        return photoRepo.findByAlbumId(albumId);
    }

    // Get Photo by id
    public Photo getPhotoById(String photoId) {
        return photoRepo.findById(photoId).orElse(null);
    }

    // Update Photo
    public Photo updatePhoto(String photoId, Photo updatedPhoto) {
        Photo existingPhoto = photoRepo.findById(photoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo not found"));

        existingPhoto.setImageTitle(updatedPhoto.getImageTitle());
        existingPhoto.setImageDescription(updatedPhoto.getImageDescription());
        existingPhoto.setImageUrl(updatedPhoto.getImageUrl());
        existingPhoto.setSortOrder(updatedPhoto.getSortOrder());
        existingPhoto.setUpdatedAt(Instant.now());

        return photoRepo.save(existingPhoto);
    }

    // Delete Photo
    public Photo deletePhoto(String photoId) {
        Photo photo = photoRepo.findById(photoId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo not found"));

        String albumId = photo.getAlbumId();
        String photoUrl = photo.getImageUrl();

        photoRepo.delete(photo);

        Album album = albumRepo.findById(albumId).orElse(null);
        if (album != null) {
            Integer count = album.getPhotoCount() == null ? 0 : album.getPhotoCount();
            if (count > 0) {
                album.setPhotoCount(count - 1);
            }

            if (album.getCoverImage() != null && album.getCoverImage().equals(photoUrl)) {
                List<Photo> remainingPhotos = photoRepo.findByAlbumId(albumId);
                if (!remainingPhotos.isEmpty()) {
                    album.setCoverImage(remainingPhotos.get(0).getImageUrl());
                } else {
                    album.setCoverImage(null);
                }
            }

            albumRepo.save(album);
        }

        return photo;
    }
}
