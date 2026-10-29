package com.photo.gallery.service;

import com.photo.gallery.model.Photo;
import com.photo.gallery.repository.PhotoRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final PhotoRepo photoRepo;

    /** Finds every photo in an album. */
    public List<Photo> getPhotosByAlbum(String albumId) {
        return photoRepo.findByAlbumId(albumId);
    }

    /** Finds a photo by ID, returning 404 when it does not exist. */
    public Photo getPhotoById(String photoId) {
        return photoRepo.findById(photoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo not found"));
    }
}
