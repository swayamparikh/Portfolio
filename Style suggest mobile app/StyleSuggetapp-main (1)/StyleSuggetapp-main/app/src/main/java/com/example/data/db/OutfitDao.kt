package com.example.data.db

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface OutfitDao {
    @Query("SELECT * FROM saved_outfits ORDER BY savedAt DESC")
    fun getAllSavedOutfits(): Flow<List<SavedOutfitEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOutfit(outfit: SavedOutfitEntity)

    @Query("DELETE FROM saved_outfits WHERE id = :id")
    suspend fun deleteOutfitById(id: Int)

    @Query("SELECT COUNT(*) FROM saved_outfits")
    suspend fun getSavedCount(): Int
}
