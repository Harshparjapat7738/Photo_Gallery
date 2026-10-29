package com.photo.gallery.repository;

import com.photo.gallery.model.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PhotoRepo extends JpaRepository<Photo, String> {
    List<Photo> findByAlbumId(String albumId);
}
