package com.photo.gallery.repository;

import com.photo.gallery.model.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhotoRepo extends JpaRepository<Photo, String> {
    List<Photo> findByAlbumId(String albumId);

    void deleteByAlbumId(String albumId);
}
