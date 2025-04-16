package com.askknightro.askknightro.repository;

import com.askknightro.askknightro.entity.CourseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


// Repository Interface used for data interaction of our Course Material table in Postgres
@Repository
public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, Integer>
{

    // Custom methods for Course Material data interaction
    Optional<CourseMaterial> findById(Integer id); // inherited from JpaRepository


}
