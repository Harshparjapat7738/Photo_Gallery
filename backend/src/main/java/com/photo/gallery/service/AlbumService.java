package com.photo.gallery.service;

import com.photo.gallery.model.Album;
import com.photo.gallery.repository.AlbumRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlbumService {

    private final AlbumRepo albumRepo;

    /** Returns every album in the gallery. */
    public List<Album> getAllAlbums() {
        return albumRepo.findAll();
    }

    /** Finds the albums belonging to a user. */
    public List<Album> getAlbumsByUser(String userId) {
        return albumRepo.findByUserId(userId);
    }

    /** Finds an album by ID, returning 404 when it does not exist. */
    public Album getAlbumById(String albumId) {
        return albumRepo.findById(albumId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Album not found"));
    }
}
