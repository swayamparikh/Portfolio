package com.example.data.db

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "saved_outfits")
data class SavedOutfitEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val name: String,
    val shirt: String,
    val pants: String,
    val shoes: String,
    val watch: String,
    val sunglasses: String,
    val accessories: String,
    val confidenceScore: Int,
    val stylingTips: String,
    val occasion: String,
    val colors: String, // Comma-separated list of selected colors
    val savedAt: Long = System.currentTimeMillis()
)
