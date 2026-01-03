package com.rubix.repository;

import com.rubix.model.entity.Scramble;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScrambleRepository extends JpaRepository<Scramble, UUID> {

    /**
     * Find scrambles by puzzle type ordered by generation date (newest first)
     */
    @Query(value = "SELECT * FROM scrambles WHERE puzzle_type = :puzzleType ORDER BY generated_at DESC LIMIT :limit", 
           nativeQuery = true)
    List<Scramble> findByPuzzleTypeOrderByGeneratedAtDesc(@Param("puzzleType") String puzzleType, @Param("limit") int limit);

    /**
     * Find recent scrambles with limit
     */
    @Query(value = "SELECT * FROM scrambles WHERE puzzle_type = :puzzleType ORDER BY generated_at DESC LIMIT :limit", 
           nativeQuery = true)
    List<Scramble> findRecentByPuzzleType(@Param("puzzleType") String puzzleType, @Param("limit") int limit);

    /**
     * Find custom scrambles by user
     */
    @Query("SELECT s FROM Scramble s WHERE s.createdByUser.id = :userId AND s.isCustom = true ORDER BY s.generatedAt DESC")
    List<Scramble> findCustomScramblesByUser(@Param("userId") UUID userId);

    /**
     * Find scrambles generated after a certain time
     */
    List<Scramble> findByGeneratedAtAfterOrderByGeneratedAtDesc(Instant after);

    /**
     * Find scrambles by puzzle type and custom flag
     */
    List<Scramble> findByPuzzleTypeAndIsCustomOrderByGeneratedAtDesc(Scramble.PuzzleType puzzleType, Boolean isCustom);

    /**
     * Count scrambles by puzzle type
     */
    long countByPuzzleType(Scramble.PuzzleType puzzleType);

    /**
     * Count custom scrambles by user
     */
    long countByCreatedByUserIdAndIsCustom(UUID userId, Boolean isCustom);

    /**
     * Find most used scrambles (by number of solves)
     */
    @Query(value = """
        SELECT s.* FROM scrambles s 
        LEFT JOIN solves so ON s.id = so.scramble_id 
        WHERE s.puzzle_type = :puzzleType 
        GROUP BY s.id 
        ORDER BY COUNT(so.id) DESC 
        LIMIT :limit
        """, nativeQuery = true)
    List<Scramble> findMostUsedScrambles(@Param("puzzleType") String puzzleType, @Param("limit") int limit);

    /**
     * Clean up old generated scrambles (not custom ones)
     */
    @Query("DELETE FROM Scramble s WHERE s.isCustom = false AND s.generatedAt < :before")
    void deleteOldGeneratedScrambles(@Param("before") Instant before);
}
