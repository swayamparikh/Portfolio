package com.example.data.api

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class GeminiPart(
    @Json(name = "text") val text: String? = null,
    @Json(name = "inlineData") val inlineData: InlineData? = null
)

@JsonClass(generateAdapter = true)
data class InlineData(
    @Json(name = "mimeType") val mimeType: String,
    @Json(name = "data") val data: String
)

@JsonClass(generateAdapter = true)
data class GeminiContent(
    @Json(name = "parts") val parts: List<GeminiPart>
)

@JsonClass(generateAdapter = true)
data class GenerationConfig(
    @Json(name = "responseMimeType") val responseMimeType: String? = null,
    @Json(name = "temperature") val temperature: Float? = null
)

@JsonClass(generateAdapter = true)
data class GeminiRequest(
    @Json(name = "contents") val contents: List<GeminiContent>,
    @Json(name = "systemInstruction") val systemInstruction: GeminiContent? = null,
    @Json(name = "generationConfig") val generationConfig: GenerationConfig? = null
)

@JsonClass(generateAdapter = true)
data class GeminiCandidate(
    @Json(name = "content") val content: GeminiContent
)

@JsonClass(generateAdapter = true)
data class GeminiResponse(
    @Json(name = "candidates") val candidates: List<GeminiCandidate>? = null
)

// Inner response structure for styling options returned by Gemini in JSON format
@JsonClass(generateAdapter = true)
data class OutfitRecommendation(
    @Json(name = "outfitName") val outfitName: String,
    @Json(name = "shirt") val shirt: String,
    @Json(name = "pants") val pants: String,
    @Json(name = "shoes") val shoes: String,
    @Json(name = "watch") val watch: String,
    @Json(name = "sunglasses") val sunglasses: String,
    @Json(name = "accessories") val accessories: String,
    @Json(name = "confidenceScore") val confidenceScore: Int,
    @Json(name = "stylingTips") val stylingTips: String,
    @Json(name = "formality") val formalityScore: Int? = 8, // 1-10
    @Json(name = "trendiness") val trendinessScore: Int? = 8, // 1-10
    @Json(name = "colorMatch") val colorMatchScore: Int? = 9  // 1-10
)

@JsonClass(generateAdapter = true)
data class OutfitRecommendationsWrap(
    @Json(name = "outfits") val outfits: List<OutfitRecommendation>
)

// Analyze Photo Output shape
@JsonClass(generateAdapter = true)
data class PhotoAnalysisResult(
    @Json(name = "skinTone") val skinTone: String,
    @Json(name = "faceShape") val faceShape: String,
    @Json(name = "hairColor") val hairColor: String,
    @Json(name = "styleType") val styleType: String,
    @Json(name = "confidenceScore") val confidenceScore: Int
)

// Chat message format
data class ChatMessage(
    val text: String,
    val isUser: Boolean,
    val timestamp: Long = System.currentTimeMillis()
)
