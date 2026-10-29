package com.photo.gallery;

import com.photo.gallery.config.DemoDataInitializer;
import com.photo.gallery.controller.UsersController;
import com.photo.gallery.model.Album;
import com.photo.gallery.model.User;
import com.photo.gallery.repository.AlbumRepo;
import com.photo.gallery.repository.PhotoRepo;
import com.photo.gallery.repository.UserRepo;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootTest
class PhotoGalleryApplicationTests {

    @Autowired
    private DemoDataInitializer demoDataInitializer;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private AlbumRepo albumRepo;

    @Autowired
    private PhotoRepo photoRepo;

    @Autowired
    private UsersController usersController;

    @Test
    void contextLoads() {
    }

    @Test
    void seedsFiveUsersWithThreeAlbumsAndPhotosWithoutDuplicates() throws Exception {
        assertSeededGallery();

        demoDataInitializer.run();

        assertSeededGallery();
    }

    @Test
    void usersEndpointReturnsOnlySeededUsers() {
        Assertions.assertEquals(5, usersController.getAllUsers().getBody().size());
    }

    @Test
    @Transactional
    void replacesLegacyBackendImageUrlsWithFrontendAssets() {
        User user = userRepo.findByEmailIgnoreCase("avery.stone@demo.example");
        user.setProfilePicture("https://photo-gallery.example/images/old-profile.jpg");
        userRepo.save(user);

        Album legacyAlbum = new Album();
        legacyAlbum.setAlbumName("Legacy album");
        legacyAlbum.setUserId(user.getUserId());
        albumRepo.save(legacyAlbum);

        Album album = albumRepo.findByUserId(user.getUserId()).get(0);
        album.setCoverImage("https://photo-gallery.example/images/old-cover.jpg");
        albumRepo.save(album);

        var photo = photoRepo.findByAlbumId(album.getAlbumId()).get(0);
        photo.setImageUrl("https://photo-gallery.example/images/old-photo.jpg");
        photoRepo.save(photo);

        demoDataInitializer.run();

        Assertions.assertTrue(userRepo.findById(user.getUserId()).orElseThrow()
                .getProfilePicture().startsWith("/images/"));
        Assertions.assertTrue(albumRepo.findById(album.getAlbumId()).orElseThrow()
                .getCoverImage().startsWith("/images/"));
        Assertions.assertTrue(photoRepo.findById(photo.getImageId()).orElseThrow()
                .getImageUrl().startsWith("/images/"));
        Assertions.assertTrue(photoRepo.findByAlbumId(legacyAlbum.getAlbumId()).size() >= 15);
    }

    @Test
    void seededUsersHaveAlbumsWithDisplayablePhotos() {
        User user = userRepo.findByEmailIgnoreCase("avery.stone@demo.example");
        List<Album> albums = albumRepo.findByUserId(user.getUserId());
        Assertions.assertEquals(3, albums.size());
        for (Album album : albums) {
            var photos = photoRepo.findByAlbumId(album.getAlbumId());
            Assertions.assertTrue(photos.size() >= 15);
            Assertions.assertTrue(photos.stream().allMatch(photo -> photo.getImageUrl().startsWith("/images/")));
        }
    }

    private void assertSeededGallery() {
        List<User> demoUsers = userRepo.findAll().stream()
                .filter(user -> user.getEmail().endsWith("@demo.example"))
                .toList();
        Assertions.assertEquals(5, demoUsers.size());
        Assertions.assertTrue(demoUsers.stream()
                .allMatch(user -> user.getProfilePicture().startsWith("/images/")));

        List<Album> albums = demoUsers.stream()
                .flatMap(user -> albumRepo.findByUserId(user.getUserId()).stream())
                .toList();
        Assertions.assertEquals(15, albums.size());
        Assertions.assertEquals(225, photoRepo.count());

        for (Album album : albums) {
            var photos = photoRepo.findByAlbumId(album.getAlbumId());
            Assertions.assertTrue(photos.size() >= 15);
            Assertions.assertTrue(album.getCoverImage().startsWith("/images/"));
            Assertions.assertTrue(photos.stream().allMatch(photo -> photo.getImageUrl().startsWith("/images/")));
        }
    }
}
