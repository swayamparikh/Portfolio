package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.api.ChatMessage
import com.example.data.api.OutfitRecommendation
import com.example.data.db.SavedOutfitEntity
import com.example.ui.theme.*
import com.example.ui.viewmodel.StylistViewModel
import com.example.ui.viewmodel.TrendingItem
import kotlinx.coroutines.launch

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import android.net.Uri
import android.provider.MediaStore
import android.graphics.ImageDecoder
import android.graphics.Bitmap
import android.os.Build
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.layout.ContentScale

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun DashboardScreen(
    viewModel: StylistViewModel,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableStateOf("Studio") }
    val userEmail by viewModel.userEmail.collectAsState()
    
    val savedCount by viewModel.savedOutfits.collectAsState()
    val selectedSkinTone by viewModel.selectedSkinTone.collectAsState()
    val selectedFaceShape by viewModel.selectedFaceShape.collectAsState()

    Scaffold(
        modifier = modifier
            .fillMaxSize()
            .background(LuxuryDark),
        topBar = {
            StyleSyncHeader(
                userEmail = userEmail ?: "Guest Mode",
                onLogout = { viewModel.logout() },
                selectedSkinTone = selectedSkinTone,
                selectedFaceShape = selectedFaceShape
            )
        },
        bottomBar = {
            StyleSyncBottomBar(
                selectedTab = selectedTab,
                onTabSelected = { selectedTab = it },
                badgeCount = savedCount.size
            )
        },
        contentWindowInsets = WindowInsets.safeDrawing
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(LuxuryDark, LuxuryDarkAccent)
                    )
                )
        ) {
            when (selectedTab) {
                "Studio" -> StudioScreenPane(viewModel = viewModel)
                "Lookbook" -> LookbookScreenPane(viewModel = viewModel)
                "Chat" -> ChatScreenPane(viewModel = viewModel)
                "Trends" -> TrendsScreenPane(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun StyleSyncHeader(
    userEmail: String,
    onLogout: () -> Unit,
    selectedSkinTone: String = "Warm Gold",
    selectedFaceShape: String = "Oval"
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .background(LuxuryDark)
            .padding(horizontal = 20.dp, vertical = 14.dp)
            .drawBehind {
                drawLine(
                    color = Color.White.copy(alpha = 0.05f),
                    start = Offset(0f, size.height),
                    end = Offset(size.width, size.height),
                    strokeWidth = 1.dp.toPx()
                )
            },
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Rounded user avatar layout matching Design draft
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .border(BorderStroke(1.dp, LuxuryGold), CircleShape)
                    .background(LuxuryGray),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Face,
                    contentDescription = "Avatar",
                    tint = LuxuryGold,
                    modifier = Modifier.size(20.dp)
                )
            }

            Column {
                Text(
                    text = "STYLESYNC AI",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.SansSerif,
                    color = LuxuryGold,
                    letterSpacing = 2.sp
                )
                Text(
                    text = "Analysis: $selectedSkinTone • $selectedFaceShape",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.White.copy(alpha = 0.5f)
                )
            }
        }

        IconButton(
            onClick = onLogout,
            modifier = Modifier
                .size(40.dp)
                .background(LuxuryGray, RoundedCornerShape(12.dp))
                .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.1f)), RoundedCornerShape(12.dp))
                .testTag("logout_button")
        ) {
            Icon(
                imageVector = Icons.Default.Logout,
                contentDescription = "Logout Curation",
                tint = Color.White,
                modifier = Modifier.size(18.dp)
            )
        }
    }
}

@Composable
fun StyleSyncBottomBar(
    selectedTab: String,
    onTabSelected: (String) -> Unit,
    badgeCount: Int
) {
    NavigationBar(
        containerColor = LuxuryDark,
        tonalElevation = 8.dp,
        modifier = Modifier
            .navigationBarsPadding()
            .drawBehind {
                drawLine(
                    color = GlassWhiteBorder,
                    start = Offset(0f, 0f),
                    end = Offset(size.width, 0f),
                    strokeWidth = 0.5.dp.toPx()
                )
            }
    ) {
        val tabs = listOf(
            Triple("Studio", Icons.Default.Palette, "Studio"),
            Triple("Lookbook", Icons.Default.AutoAwesome, "Lookbook"),
            Triple("Chat", Icons.AutoMirrored.Default.Chat, "Chat"),
            Triple("Trends", Icons.Default.TrendingUp, "Trends")
        )

        tabs.forEach { (route, icon, label) ->
            val isSelected = selectedTab == route
            NavigationBarItem(
                selected = isSelected,
                onClick = { onTabSelected(route) },
                icon = {
                    Box {
                        Icon(
                            imageVector = icon,
                            contentDescription = label,
                            tint = if (isSelected) LuxuryDark else Color.Gray,
                            modifier = Modifier.size(24.dp)
                        )
                        if (route == "Lookbook" && badgeCount > 0) {
                            Box(
                                modifier = Modifier
                                    .align(Alignment.TopEnd)
                                    .offset(x = 6.dp, y = (-4).dp)
                                    .background(LuxuryGold, CircleShape)
                                    .size(16.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = badgeCount.toString(),
                                    color = LuxuryDark,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                },
                label = {
                    Text(
                        text = label,
                        color = if (isSelected) LuxuryGold else Color.Gray,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                        fontSize = 11.sp
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    indicatorColor = LuxuryGold
                ),
                modifier = Modifier.testTag("nav_item_${route.lowercase()}")
            )
        }
    }
}

// ------------------------------------
// 1. STUDIO TAB PANE
// ------------------------------------
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun StudioScreenPane(viewModel: StylistViewModel) {
    val selectedGender by viewModel.selectedGender.collectAsState()
    val selectedSkinTone by viewModel.selectedSkinTone.collectAsState()
    val selectedFaceShape by viewModel.selectedFaceShape.collectAsState()
    val selectedHairColor by viewModel.selectedHairColor.collectAsState()
    val selectedBodyType by viewModel.selectedBodyType.collectAsState()
    val selectedStyleType by viewModel.selectedStyleType.collectAsState()
    val selectedOccasion by viewModel.selectedOccasion.collectAsState()
    val selectedColors by viewModel.selectedColors.collectAsState()
    
    val selectedPresetName by viewModel.selectedPhotoPresetName.collectAsState()
    val isScanning by viewModel.isScanning.collectAsState()
    val analyzedResult by viewModel.analyzedResult.collectAsState()
    
    val isGenerating by viewModel.isGeneratingRecommendations.collectAsState()
    val recommendations by viewModel.recommendations.collectAsState()

    val selectedPhotoBitmap by viewModel.selectedPhotoBitmap.collectAsState()
    val context = LocalContext.current

    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            try {
                @Suppress("DEPRECATION")
                val bitmap = if (Build.VERSION.SDK_INT < 28) {
                    MediaStore.Images.Media.getBitmap(context.contentResolver, it)
                } else {
                    val source = ImageDecoder.createSource(context.contentResolver, it)
                    ImageDecoder.decodeBitmap(source) { decoder, _, _ ->
                        decoder.allocator = ImageDecoder.ALLOCATOR_SOFTWARE
                    }
                }
                viewModel.uploadCustomPhoto(bitmap)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap: Bitmap? ->
        bitmap?.let {
            viewModel.uploadCustomPhoto(it)
        }
    }

    val coroutineScope = rememberCoroutineScope()

    var showAdvancedProfile by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .testTag("studio_pane_scroll"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Welcome Tip
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = LuxuryLightGray),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(BorderStroke(0.5.dp, LuxuryGold.copy(alpha = 0.3f)), RoundedCornerShape(16.dp))
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .background(LuxuryGold.copy(alpha = 0.1f), CircleShape)
                            .size(44.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = "Sparks Logo",
                            tint = LuxuryGold,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Haute Couture Canvas",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = Color.White
                        )
                        Text(
                            text = "Upload profile, tap colors & occasion, and let the luxury stylist construct top sets.",
                            fontSize = 11.sp,
                            color = Color.LightGray,
                            lineHeight = 16.sp
                        )
                    }
                }
            }
        }

        // Section I: Upload Silhouette/Photo & AI Analyzer
        item {
            Text(
                text = "I. PHOTO & SILHOUETTE ANALYZER",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                color = LuxuryGold,
                modifier = Modifier.padding(bottom = 4.dp)
            )

            Card(
                colors = CardDefaults.cardColors(containerColor = LuxuryDarkAccent),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier
                    .fillParentMaxWidth()
                    .border(BorderStroke(1.dp, GlassWhiteBorder), RoundedCornerShape(20.dp))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    // Profile Preset selectors
                    Text(
                        text = "Match design avatar profile:",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White.copy(alpha = 0.8f),
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        val presets = listOf(
                            Pair("model_vibe_gold", "Gold Elegance"),
                            Pair("model_vibe_classic", "Tailored Suit"),
                            Pair("model_vibe_street", "Urban Street")
                        )

                        presets.forEach { (presetId, label) ->
                            val isChosen = selectedPresetName == presetId
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isChosen) LuxuryGold else LuxuryLightGray)
                                    .clickable { viewModel.setPhotoPreset(presetId, presetId) }
                                    .padding(vertical = 10.dp, horizontal = 6.dp)
                                    .testTag("preset_select_$presetId"),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = label,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isChosen) LuxuryDark else Color.White,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Or scan your own custom look/selfie:",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White.copy(alpha = 0.8f),
                        modifier = Modifier.padding(bottom = 6.dp)
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { cameraLauncher.launch(null) },
                            colors = ButtonDefaults.buttonColors(containerColor = LuxuryGray),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .weight(1f)
                                .height(40.dp)
                                .border(BorderStroke(0.5.dp, LuxuryGold.copy(alpha = 0.4f)), RoundedCornerShape(12.dp))
                                .testTag("take_selfie_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.PhotoCamera,
                                contentDescription = "Camera",
                                tint = LuxuryGold,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("TAKE PHOTO", fontSize = 10.sp, color = Color.White, fontWeight = FontWeight.Bold)
                        }

                        Button(
                            onClick = { galleryLauncher.launch("image/*") },
                            colors = ButtonDefaults.buttonColors(containerColor = LuxuryGray),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .weight(1f)
                                .height(40.dp)
                                .border(BorderStroke(0.5.dp, LuxuryGold.copy(alpha = 0.4f)), RoundedCornerShape(12.dp))
                                .testTag("upload_gallery_button")
                        ) {
                            Icon(
                                imageVector = Icons.Default.CloudUpload,
                                contentDescription = "Upload",
                                tint = LuxuryGold,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("CHOOSE FILE", fontSize = 10.sp, color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Scanner visual container
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(160.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(LuxuryLightGray)
                            .border(1.dp, GlassWhiteBorder, RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        // Display the custom uploaded photo if present, with a luxurious stylized overlay
                        selectedPhotoBitmap?.let { bmp ->
                            androidx.compose.foundation.Image(
                                bitmap = bmp.asImageBitmap(),
                                contentDescription = "Scanned Custom Picture",
                                contentScale = ContentScale.Crop,
                                modifier = Modifier
                                    .fillMaxSize()
                                    .alpha(0.6f)
                            )
                        }

                        // Drawing custom vector-blocked model outline on canvas or simulating scans
                        val infiniteTransition = rememberInfiniteTransition(label = "scanner")
                        val scanOffset by infiniteTransition.animateFloat(
                            initialValue = 0f,
                            targetValue = 1f,
                            animationSpec = infiniteRepeatable(
                                animation = twinSequence(),
                                repeatMode = RepeatMode.Reverse
                            ),
                            label = "line"
                        )

                        Canvas(modifier = Modifier.fillMaxSize()) {
                            val w = size.width
                            val h = size.height

                            // Draw structural concentric stylish circles
                            drawCircle(
                                color = LuxuryGold.copy(alpha = 0.08f),
                                radius = w * 0.3f,
                                center = Offset(w / 2, h / 2)
                            )
                            drawCircle(
                                color = LuxuryGold.copy(alpha = 0.04f),
                                radius = w * 0.45f,
                                center = Offset(w / 2, h / 2)
                            )

                            // Simulated high-end fashion hanger / hanger hook design vector
                            val hookCenterY = h * 0.3f
                            val shoulderLineY = h * 0.45f
                            val waistLineY = h * 0.75f

                            // Draw hanger hook
                            drawCircle(
                                color = LuxuryGold.copy(alpha = 0.3f),
                                radius = 10.dp.toPx(),
                                center = Offset(w / 2, hookCenterY),
                                style = androidx.compose.ui.graphics.drawscope.Stroke(width = 2.dp.toPx())
                            )
                            // Draw shoulders hanger
                            drawLine(
                                color = LuxuryGold.copy(alpha = 0.35f),
                                start = Offset(w / 2 - 50.dp.toPx(), shoulderLineY),
                                end = Offset(w / 2 + 50.dp.toPx(), shoulderLineY),
                                strokeWidth = 3.dp.toPx()
                            )
                            // Draw outfit frame outline lines
                            drawLine(
                                color = LuxuryGold.copy(alpha = 0.2f),
                                start = Offset(w / 2 - 35.dp.toPx(), shoulderLineY),
                                end = Offset(w / 2 - 25.dp.toPx(), waistLineY),
                                strokeWidth = 2.dp.toPx()
                            )
                            drawLine(
                                color = LuxuryGold.copy(alpha = 0.2f),
                                start = Offset(w / 2 + 35.dp.toPx(), shoulderLineY),
                                end = Offset(w / 2 + 25.dp.toPx(), waistLineY),
                                strokeWidth = 2.dp.toPx()
                            )

                            // If scanning, draw golden scanning laser row line
                            if (isScanning) {
                                val lineY = h * scanOffset
                                drawLine(
                                    color = LuxuryGold,
                                    start = Offset(0f, lineY),
                                    end = Offset(w, lineY),
                                    strokeWidth = 3.dp.toPx()
                                )
                            }
                        }

                        if (isScanning) {
                            Box(
                                modifier = Modifier
                                    .background(LuxuryDark.copy(alpha = 0.85f), RoundedCornerShape(8.dp))
                                    .padding(horizontal = 14.dp, vertical = 8.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    CircularProgressIndicator(
                                        color = LuxuryGold,
                                        modifier = Modifier.size(16.dp),
                                        strokeWidth = 2.dp
                                    )
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Text(
                                        text = "AI OPTOMETRY SCAN...",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace,
                                        color = LuxuryGold
                                    )
                                }
                            }
                        } else if (analyzedResult != null) {
                            // Beautiful glassmorphic overlays inside card
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(Color.Black.copy(alpha = 0.5f))
                                    .padding(12.dp)
                            ) {
                                Column(
                                    verticalArrangement = Arrangement.SpaceBetween,
                                    modifier = Modifier.fillMaxSize()
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "SCAN SUCCESSFUL • 98% MATCH",
                                            fontSize = 9.sp,
                                            fontFamily = FontFamily.Monospace,
                                            fontWeight = FontWeight.Bold,
                                            color = LuxuryGold
                                        )
                                        Icon(
                                            imageVector = Icons.Default.CheckCircle,
                                            contentDescription = "Success",
                                            tint = LuxuryGold,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }

                                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                        analyzedResult!!.second.forEach { (k, v) ->
                                            Row(modifier = Modifier.fillMaxWidth()) {
                                                Text(
                                                    text = "$k: ",
                                                    fontSize = 11.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    color = Color.LightGray,
                                                    modifier = Modifier.width(110.dp)
                                                )
                                                Text(
                                                    text = v,
                                                    fontSize = 11.sp,
                                                    fontWeight = FontWeight.Normal,
                                                    color = Color.White
                                                )
                                            }
                                        }
                                    }

                                    // Retake text link
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clickable { viewModel.setPhotoPreset(selectedPresetName, selectedPresetName) },
                                        horizontalArrangement = Arrangement.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Refresh,
                                            contentDescription = "Rescan",
                                            tint = LuxuryGold,
                                            modifier = Modifier.size(14.dp)
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = "RE-TRIGGER STYLING AUDIT",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = LuxuryGold
                                        )
                                    }
                                }
                            }
                        } else {
                            // Default upload prompts
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center,
                                modifier = Modifier
                                    .fillMaxSize()
                                    .clickable {
                                        viewModel.setPhotoPreset(
                                            selectedPresetName,
                                            selectedPresetName
                                        )
                                    }
                                    .padding(24.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.PhotoCamera,
                                    contentDescription = "Camera Upload",
                                    tint = LuxuryGold,
                                    modifier = Modifier.size(36.dp)
                                )
                                Spacer(modifier = Modifier.height(10.dp))
                                Text(
                                    text = "TAP TO RUN STYLE ENGINE ANALYSIS",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace,
                                    color = Color.White,
                                    textAlign = TextAlign.Center
                                )
                                Text(
                                    text = "Extract skin tone, face shape, and hair parameters using Gemini Vision.",
                                    fontSize = 9.sp,
                                    color = Color.LightGray,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.padding(top = 4.dp)
                                )
                            }
                        }
                    }
                }
            }
        }

        // Section II: Core Parameters Control Sliders (Collapsible setup)
        item {
            Row(
                modifier = Modifier
                    .fillParentMaxWidth()
                    .clickable { showAdvancedProfile = !showAdvancedProfile },
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "II. ADVANCED FASHION PARAMETERS",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    color = LuxuryGold
                )
                Icon(
                    imageVector = if (showAdvancedProfile) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = "Toggle Parameters",
                    tint = LuxuryGold
                )
            }

            AnimatedVisibility(visible = showAdvancedProfile) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = LuxuryLightGray),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Gender Option Row
                        StylistSelectionRow(
                            label = "Gender",
                            options = viewModel.genders,
                            currentSelection = selectedGender,
                            onOptionSelected = { viewModel.setGender(it) }
                        )

                        // Skin Tone Row
                        StylistSelectionRow(
                            label = "Skin Tone",
                            options = viewModel.skinTones,
                            currentSelection = selectedSkinTone,
                            onOptionSelected = { viewModel.setSkinTone(it) }
                        )

                        // Face Shape Row
                        StylistSelectionRow(
                            label = "Face Shape",
                            options = viewModel.faceShapes,
                            currentSelection = selectedFaceShape,
                            onOptionSelected = { viewModel.setFaceShape(it) }
                        )

                        // Hair Color Row
                        StylistSelectionRow(
                            label = "Hair Color",
                            options = viewModel.hairColors,
                            currentSelection = selectedHairColor,
                            onOptionSelected = { viewModel.setHairColor(it) }
                        )

                        // Body Structure Row
                        StylistSelectionRow(
                            label = "Body Structure",
                            options = viewModel.bodyTypes,
                            currentSelection = selectedBodyType,
                            onOptionSelected = { viewModel.setBodyType(it) }
                        )

                        // Personality Flow style
                        StylistSelectionRow(
                            label = "Personality",
                            options = viewModel.styleTypes,
                            currentSelection = selectedStyleType,
                            onOptionSelected = { viewModel.setStyleType(it) }
                        )
                    }
                }
            }
        }

        // Section III: Select Preferred Fabrics/Colors
        item {
            Text(
                text = "III. SELECT PREFERRED THEMES & COLORS",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                color = LuxuryGold,
                modifier = Modifier.padding(bottom = 6.dp)
            )

            FlowRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                viewModel.colorChips.forEach { colorName ->
                    val isSelected = selectedColors.contains(colorName)
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(30.dp))
                            .background(if (isSelected) LuxuryGold else LuxuryLightGray)
                            .border(
                                BorderStroke(1.dp, if (isSelected) GlowGold else Color.Gray.copy(alpha = 0.5f)),
                                RoundedCornerShape(30.dp)
                            )
                            .clickable { viewModel.toggleColor(colorName) }
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                            .testTag("color_chip_$colorName"),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .background(getClothingColorHex(colorName), CircleShape)
                                    .border(BorderStroke(0.5.dp, Color.White), CircleShape)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = colorName,
                                fontSize = 11.sp,
                                color = if (isSelected) LuxuryDark else Color.White,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    }
                }
            }
        }

        // Section IV: Occasions Selection Group
        item {
            Text(
                text = "IV. SPECIFY THE OCCASION",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                color = LuxuryGold,
                modifier = Modifier.padding(bottom = 6.dp)
            )

            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(viewModel.occasions) { occasionName ->
                    val isSelected = selectedOccasion == occasionName
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (isSelected) LuxuryGold else LuxuryLightGray)
                            .border(
                                BorderStroke(1.dp, if (isSelected) GlowGold else Color.Transparent),
                                RoundedCornerShape(12.dp)
                            )
                            .clickable { viewModel.setOccasion(occasionName) }
                            .padding(horizontal = 20.dp, vertical = 12.dp)
                            .testTag("occasion_chip_$occasionName"),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = occasionName,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isSelected) LuxuryDark else Color.White
                        )
                    }
                }
            }
        }

        // Curate action trigger Button
        item {
            Button(
                onClick = { viewModel.generateRecommendations() },
                enabled = !isGenerating,
                colors = ButtonDefaults.buttonColors(
                    containerColor = LuxuryGold,
                    disabledContainerColor = LuxuryLightGray
                ),
                shape = RoundedCornerShape(14.dp),
                modifier = Modifier
                    .fillParentMaxWidth()
                    .height(60.dp)
                    .padding(vertical = 4.dp)
                    .testTag("trigger_curation_button")
            ) {
                if (isGenerating) {
                    CircularProgressIndicator(color = LuxuryDark, modifier = Modifier.size(20.dp), strokeWidth = 3.dp)
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "GENERATING LUXURY SELECTIONS...",
                        color = LuxuryDark,
                        fontWeight = FontWeight.Black,
                        fontSize = 13.sp,
                        fontFamily = FontFamily.Monospace
                    )
                } else {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.AutoAwesome, "Sparkle", tint = LuxuryDark, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "C R E A T E    S T Y L E    C U R A T I O N",
                            color = LuxuryDark,
                            fontWeight = FontWeight.Black,
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }

        // Recommendations List carousel
        item {
            if (recommendations.isNotEmpty()) {
                Text(
                    text = "V. AI STYLING SUITE RECOMMENDATIONS",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    color = LuxuryGold,
                    modifier = Modifier.padding(top = 12.dp, bottom = 4.dp)
                )
            }
        }

        if (recommendations.isNotEmpty()) {
            item {
                LazyRow(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(490.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    contentPadding = PaddingValues(horizontal = 4.dp)
                ) {
                    items(recommendations) { outfit ->
                        RecommendationOutfitCard(
                            outfit = outfit,
                            occasion = selectedOccasion,
                            onSaveToggle = { viewModel.toggleSaveLook(outfit) },
                            onMarkSlot = { slot -> viewModel.setComparisonSet(slot, outfit) },
                            savedList = viewModel.savedOutfits.collectAsState().value
                        )
                    }
                }
            }

            // Quick comparison section representation
            item {
                OutfitComparisonSection(viewModel = viewModel)
            }
        } else if (!isGenerating && recommendations.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(LuxuryLightGray, RoundedCornerShape(12.dp))
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "Wardrobe Suite Empty",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Tap 'Create Style Curation' above to run models and display customized look cards.",
                            color = Color.LightGray,
                            fontSize = 11.sp,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }
        }
    }
}

// ------------------------------------
// OUTFIT CAPSULE CARD WITH VECTOR COLOR DRAWS
// ------------------------------------
@Composable
fun RecommendationOutfitCard(
    outfit: OutfitRecommendation,
    occasion: String,
    onSaveToggle: () -> Unit,
    onMarkSlot: (String) -> Unit,
    savedList: List<SavedOutfitEntity>
) {
    val isSaved = savedList.any { it.name == outfit.outfitName && it.occasion == occasion }

    Card(
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        shape = RoundedCornerShape(24.dp),
        modifier = Modifier
            .width(320.dp)
            .fillMaxHeight()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(LuxuryGray, Color(0xFF0F0F0F))
                ),
                shape = RoundedCornerShape(24.dp)
            )
            .border(BorderStroke(0.5.dp, Color.White.copy(alpha = 0.08f)), RoundedCornerShape(24.dp))
            .testTag("outfit_card_${outfit.outfitName.replace(" ", "_")}")
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Card Title Row with Option Pill and Circular Score Ring
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    // Option Tag matching Professional Polish standard
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(100.dp))
                            .background(LuxuryGold)
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "AI SELECTION",
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.Black,
                            letterSpacing = 1.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = outfit.outfitName,
                        fontSize = 16.sp,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                // Modern Circular match score gauge
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                    modifier = Modifier.padding(end = 2.dp)
                ) {
                    Box(
                        modifier = Modifier.size(38.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(
                            progress = { outfit.confidenceScore.toFloat() / 100f },
                            color = LuxuryGold,
                            trackColor = Color.White.copy(alpha = 0.08f),
                            strokeWidth = 3.dp,
                            modifier = Modifier.fillMaxSize()
                        )
                        Text(
                            text = "${outfit.confidenceScore}%",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "SCORE",
                        fontSize = 7.sp,
                        fontWeight = FontWeight.Bold,
                        color = LuxuryGold,
                        letterSpacing = 0.5.sp
                    )
                }
            }

            // Visual Outfit Block / Canvas Block representation
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .border(BorderStroke(0.5.dp, Color.White.copy(alpha = 0.08f)), RoundedCornerShape(16.dp))
            ) {
                val cTop = getClothingColorHex(outfit.shirt)
                val cBottom = getClothingColorHex(outfit.pants)

                Canvas(modifier = Modifier.fillMaxSize()) {
                    val w = size.width
                    val h = size.height

                    // Draw elegant split diagonally
                    val pathLeft = androidx.compose.ui.graphics.Path().apply {
                        moveTo(0f, 0f)
                        lineTo(w * 0.45f, 0f)
                        lineTo(w * 0.35f, h)
                        lineTo(0f, h)
                        close()
                    }
                    val pathRight = androidx.compose.ui.graphics.Path().apply {
                        moveTo(w * 0.45f, 0f)
                        lineTo(w, 0f)
                        lineTo(w, h)
                        lineTo(w * 0.35f, h)
                        close()
                    }

                    drawPath(path = pathLeft, color = cTop)
                    drawPath(path = pathRight, color = cBottom)

                    // Draw elegant radiant center glow
                    drawCircle(
                        color = LuxuryGold.copy(alpha = 0.15f),
                        radius = h * 0.35f,
                        center = Offset(w / 2f, h / 2f)
                    )

                    // Elegant mannequin hanger silhouette drawn on top
                    val hangerWidth = w * 0.3f
                    val centerX = w / 2f
                    val hangerY = h * 0.4f

                    // Hook
                    drawCircle(
                        color = LuxuryGold,
                        radius = 6.dp.toPx(),
                        center = Offset(centerX, hangerY - 12.dp.toPx()),
                        style = androidx.compose.ui.graphics.drawscope.Stroke(width = 1.5.dp.toPx())
                    )
                    // Stand shoulder wire
                    drawLine(
                        color = LuxuryGold,
                        start = Offset(centerX - hangerWidth / 2, hangerY),
                        end = Offset(centerX + hangerWidth / 2, hangerY),
                        strokeWidth = 2.dp.toPx()
                    )
                }

                // Subtitle overlays
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.BottomCenter)
                        .background(Color.Black.copy(alpha = 0.65f))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "Contrast: ${outfit.shirt} × ${outfit.pants}",
                        fontSize = 9.sp,
                        fontFamily = FontFamily.Monospace,
                        color = Color.White,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            // Specs Item Grid
            Column(
                modifier = Modifier.padding(vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                OutfitSpecLine(icon = Icons.Default.Checkroom, label = "Top Wear", value = outfit.shirt)
                OutfitSpecLine(icon = Icons.Default.AirlineSeatLegroomExtra, label = "Bottom Wear", value = outfit.pants)
                OutfitSpecLine(icon = Icons.Default.Hiking, label = "Footwear", value = outfit.shoes)
                OutfitSpecLine(icon = Icons.Default.Watch, label = "Timepiece", value = outfit.watch)
                OutfitSpecLine(icon = Icons.Default.FilterList, label = "Sunglasses", value = outfit.sunglasses)
            }

            // Styling Insider Tip Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.Black.copy(alpha = 0.4f), RoundedCornerShape(12.dp))
                    .border(BorderStroke(0.5.dp, Color.White.copy(alpha = 0.08f)), RoundedCornerShape(12.dp))
                    .padding(10.dp)
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Verified, "Tips", tint = LuxuryGold, modifier = Modifier.size(12.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "STYLING INSIDER SECRETS",
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            color = LuxuryGold
                        )
                    }
                    Text(
                        text = outfit.stylingTips,
                        fontSize = 10.sp,
                        color = Color.White.copy(alpha = 0.7f),
                        lineHeight = 14.sp,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }

            // Comp selection tools and Favorite Button row matching the look and feel
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Save Look button matching the solid Gold / Black style of HTML
                Button(
                    onClick = onSaveToggle,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isSaved) Color.Transparent else LuxuryGold,
                        contentColor = if (isSaved) Color.White else Color.Black
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .weight(1.5f)
                        .height(38.dp)
                        .border(
                            BorderStroke(
                                1.dp,
                                if (isSaved) Color.White.copy(alpha = 0.2f) else Color.Transparent
                            ),
                            RoundedCornerShape(12.dp)
                        )
                        .testTag("save_outfit_button_${outfit.outfitName}"),
                    contentPadding = PaddingValues(horizontal = 4.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = if (isSaved) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = "Save Look",
                            tint = if (isSaved) Color.Red else Color.Black,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (isSaved) "FAVORITED" else "SAVE LOOK",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.5.sp
                        )
                    }
                }

                // Slot A Comparison Button
                Button(
                    onClick = { onMarkSlot("A") },
                    colors = ButtonDefaults.buttonColors(containerColor = LuxuryGray),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(38.dp)
                        .border(BorderStroke(0.5.dp, Color.White.copy(alpha = 0.15f)), RoundedCornerShape(12.dp))
                ) {
                    Text("Slot A ⚖️", fontSize = 9.sp, color = Color.White, fontWeight = FontWeight.Bold)
                }

                // Slot B Comparison Button
                Button(
                    onClick = { onMarkSlot("B") },
                    colors = ButtonDefaults.buttonColors(containerColor = LuxuryGray),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .weight(1f)
                        .height(38.dp)
                        .border(BorderStroke(0.5.dp, Color.White.copy(alpha = 0.15f)), RoundedCornerShape(12.dp))
                ) {
                    Text("Slot B ⚖️", fontSize = 9.sp, color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun OutfitSpecLine(
    icon: Any,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(24.dp)
                .background(LuxuryDark, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            when (icon) {
                is ImageVector -> Icon(icon, label, tint = LuxuryGold, modifier = Modifier.size(12.dp))
                else -> Text("•", color = LuxuryGold, fontWeight = FontWeight.Bold)
            }
        }
        Spacer(modifier = Modifier.width(10.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = "$label: ",
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                color = LuxuryGold.copy(alpha = 0.8f)
            )
            Text(
                text = value,
                fontSize = 11.sp,
                color = Color.White,
                fontWeight = FontWeight.Normal,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

// Custom Helper: convert string descriptors to physical hex colors roughly
fun getClothingColorHex(text: String): Color {
    val low = text.lowercase()
    return when {
        low.contains("black") -> Color(0xFF141414)
        low.contains("white") -> Color(0xFFFcfcfc)
        low.contains("navy") || low.contains("blue") -> Color(0xFF1B2A4A)
        low.contains("beige") || low.contains("tan") || low.contains("sand") || low.contains("khaki") || low.contains("cream") -> Color(0xFFDCD0B4)
        low.contains("grey") || low.contains("slate") || low.contains("charcoal") -> Color(0xFF5A5A5A)
        low.contains("olive") || low.contains("green") -> Color(0xFF3F4D3C)
        low.contains("brown") || low.contains("cocoa") || low.contains("espresso") -> Color(0xFF4A3423)
        low.contains("maroon") || low.contains("burgundy") || low.contains("red") -> Color(0xFF6B1D2F)
        low.contains("sky") -> Color(0xFFB0CFE3)
        low.contains("gold") -> Color(0xFFD4AF37)
        low.contains("ivory") -> Color(0xFFFFFFF0)
        else -> LuxuryGold // Standard gold
    }
}

// ------------------------------------
// OUTFIT COMPARISON MODULE (COMPLEMENTING GOAL #9)
// ------------------------------------
@Composable
fun OutfitComparisonSection(viewModel: StylistViewModel) {
    val compA by viewModel.compareA.collectAsState()
    val compB by viewModel.compareB.collectAsState()

    if (compA != null || compB != null) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp)
        ) {
            Text(
                text = "⚖️ STYLE COMPARISON HUB",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                color = LuxuryGold,
                modifier = Modifier.padding(bottom = 6.dp)
            )

            Card(
                colors = CardDefaults.cardColors(containerColor = LuxuryDarkAccent),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(BorderStroke(0.5.dp, GlassWhiteBorder), RoundedCornerShape(16.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Compare the silhouettes placed in Slot A and B side-by-side:",
                        fontSize = 11.sp,
                        color = Color.LightGray,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )

                    // Slots Titles
                    Row(modifier = Modifier.fillMaxWidth()) {
                        Box(modifier = Modifier.weight(0.3f))
                        Box(modifier = Modifier.weight(0.35f), contentAlignment = Alignment.Center) {
                            Text(
                                text = "Slot A: ${compA?.outfitName ?: "Empty"}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = LuxuryGold,
                                textAlign = TextAlign.Center,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                        Box(modifier = Modifier.weight(0.35f), contentAlignment = Alignment.Center) {
                            Text(
                                text = "Slot B: ${compB?.outfitName ?: "Empty"}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = LuxuryGold,
                                textAlign = TextAlign.Center,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    HorizontalDivider(color = GlassWhiteBorder, thickness = 0.5.dp)
                    Spacer(modifier = Modifier.height(8.dp))

                    // Comparison Metrics
                    ComparisonRowLine(metric = "Formality", scaleA = compA?.formalityScore ?: 7, scaleB = compB?.formalityScore ?: 7)
                    ComparisonRowLine(metric = "Trendiness", scaleA = compA?.trendinessScore ?: 9, scaleB = compB?.trendinessScore ?: 9)
                    ComparisonRowLine(metric = "Color Match", scaleA = compA?.colorMatchScore ?: 10, scaleB = compB?.colorMatchScore ?: 10)
                    ComparisonRowLine(metric = "Confidence", scaleA = (compA?.confidenceScore ?: 90) / 10, scaleB = (compB?.confidenceScore ?: 90) / 10)

                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Compare materials: [A: ${compA?.shirt?.take(22) ?: "---"}...] vs [B: ${compB?.shirt?.take(22) ?: "---"}...]",
                        fontSize = 10.sp,
                        color = Color.Gray,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
    }
}

@Composable
fun ComparisonRowLine(metric: String, scaleA: Int, scaleB: Int) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Metric Label
        Text(
            text = metric,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.weight(0.3f)
        )

        // Slot A Scale
        Row(
            modifier = Modifier.weight(0.35f),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "$scaleA / 10",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = if (scaleA >= scaleB) LuxuryGold else Color.LightGray
            )
        }

        // Slot B Scale
        Row(
            modifier = Modifier.weight(0.35f),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "$scaleB / 10",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = if (scaleB >= scaleA) LuxuryGold else Color.LightGray
            )
        }
    }
}

// ------------------------------------
// 2. LOOKBOOK SAVED COLLECTION TAB
// ------------------------------------
@Composable
fun LookbookScreenPane(viewModel: StylistViewModel) {
    val savedOutfits by viewModel.savedOutfits.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .testTag("lookbook_pane")
    ) {
        Text(
            text = "MY LOOKBOOK & SAVED LOOKS",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace,
            color = LuxuryGold,
            modifier = Modifier.padding(bottom = 2.dp)
        )
        Text(
            text = "Your private, offline cabinet of curated wardrobes stored locally.",
            fontSize = 11.sp,
            color = Color.LightGray,
            modifier = Modifier.padding(bottom = 12.dp)
        )

        if (savedOutfits.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .background(LuxuryLightGray, RoundedCornerShape(16.dp))
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.FavoriteBorder,
                        contentDescription = "Empty Favorites",
                        tint = LuxuryGold,
                        modifier = Modifier.size(44.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Lookbook Cabinet Empty",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                    Text(
                        text = "Navigate to Studio tab, run curation, and tap ❤️ on cards to save outfits securely.",
                        color = Color.LightGray,
                        fontSize = 11.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(start = 12.dp, end = 12.dp, top = 4.dp)
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(savedOutfits) { item ->
                    SavedOutfitCabinetCard(
                        item = item,
                        onUnsave = { viewModel.unsaveRoomOutfit(item.id) }
                    )
                }
            }
        }
    }
}

@Composable
fun SavedOutfitCabinetCard(
    item: SavedOutfitEntity,
    onUnsave: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = LuxuryLightGray),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(BorderStroke(0.5.dp, GlassWhiteBorder), RoundedCornerShape(16.dp))
            .testTag("saved_outfit_${item.id}")
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = item.name,
                        fontSize = 16.sp,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.ExtraBold,
                        color = LuxuryGold
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .background(LuxuryGold, RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = item.occasion.uppercase(),
                                fontSize = 8.sp,
                                fontWeight = FontWeight.Bold,
                                color = LuxuryDark
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Matching Confidence: ${item.confidenceScore}%",
                            fontSize = 10.sp,
                            color = Color.LightGray
                        )
                    }
                }

                IconButton(
                    onClick = onUnsave,
                    modifier = Modifier
                        .size(36.dp)
                        .background(LuxuryDark, CircleShape)
                        .testTag("unsave_button_${item.id}")
                ) {
                    Icon(
                        imageVector = Icons.Default.DeleteOutline,
                        contentDescription = "Delete outfit",
                        tint = Color.Red.copy(alpha = 0.8f),
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
            HorizontalDivider(color = GlassWhiteBorder, thickness = 0.5.dp)
            Spacer(modifier = Modifier.height(12.dp))

            // Spec grid
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                SavedSpecRow(label = "Top Fabric", value = item.shirt)
                SavedSpecRow(label = "Bottom Cut", value = item.pants)
                SavedSpecRow(label = "Accouterment", value = item.accessories)
                SavedSpecRow(label = "Timepiece Match", value = item.watch)
            }

            Spacer(modifier = Modifier.height(10.dp))
            
            // Tips Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(LuxuryDarkAccent, RoundedCornerShape(8.dp))
                    .padding(10.dp)
            ) {
                Text(
                    text = "Stylist Tip: ${item.stylingTips}",
                    fontSize = 10.sp,
                    color = Color.LightGray,
                    lineHeight = 14.sp
                )
            }
        }
    }
}

@Composable
fun SavedSpecRow(label: String, value: String) {
    Row(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = "$label: ",
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = LuxuryGold,
            modifier = Modifier.width(90.dp)
        )
        Text(
            text = value,
            fontSize = 11.sp,
            color = Color.White,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f)
        )
    }
}

// ------------------------------------
// 3. PERSONAL FASHION ASSISTANT CHAT TAB
// ------------------------------------
@Composable
fun ChatScreenPane(viewModel: StylistViewModel) {
    val messages by viewModel.chatMessages.collectAsState()
    val isLoading by viewModel.chatLoading.collectAsState()
    
    var questionInput by remember { mutableStateOf("") }
    val focusManager = LocalFocusManager.current

    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    // Auto-scroll to end when messages load
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            coroutineScope.launch {
                listState.animateScrollToItem(messages.size - 1)
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .testTag("chat_pane")
    ) {
        Text(
            text = "AI FASHION DIRECT ASSISTANT",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace,
            color = LuxuryGold,
            modifier = Modifier.padding(bottom = 2.dp)
        )
        Text(
            text = "Powered by Google Gemini models. Request pairing secrets and matching logs.",
            fontSize = 11.sp,
            color = Color.LightGray,
            modifier = Modifier.padding(bottom = 12.dp)
        )

        // Chat list area
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .background(LuxuryDarkAccent, RoundedCornerShape(16.dp))
                .border(BorderStroke(0.5.dp, GlassWhiteBorder), RoundedCornerShape(16.dp))
                .padding(8.dp)
        ) {
            LazyColumn(
                state = listState,
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = 8.dp)
            ) {
                items(messages) { msg ->
                    ChatBubble(message = msg)
                }

                if (isLoading) {
                    item {
                        Row(
                            horizontalArrangement = Arrangement.Start,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(8.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .background(LuxuryLightGray, RoundedCornerShape(12.dp))
                                    .padding(horizontal = 14.dp, vertical = 10.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    CircularProgressIndicator(
                                        color = LuxuryGold,
                                        modifier = Modifier.size(14.dp),
                                        strokeWidth = 2.dp
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Curating response...",
                                        fontSize = 11.sp,
                                        color = Color.LightGray,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Quick suggestion chips
        Text(
            text = "Suggested Questions:",
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = LuxuryGold,
            modifier = Modifier.padding(top = 10.dp, bottom = 4.dp)
        )

        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            val suggestions = listOf(
                "What look should I wear to Date Night?",
                "Suggest watch to match Sand Linen Pants.",
                "How do I match charcoal leather sliploas?",
                "Which colors suit my warm wheatish skin?"
            )
            items(suggestions) { keyword ->
                Box(
                    modifier = Modifier
                        .background(LuxuryLightGray, RoundedCornerShape(20.dp))
                        .border(BorderStroke(0.5.dp, Color.Gray.copy(alpha = 0.5f)), RoundedCornerShape(20.dp))
                        .clickable { viewModel.sendChatMessage(keyword) }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(text = keyword, fontSize = 10.sp, color = Color.White)
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Input Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = questionInput,
                onValueChange = { questionInput = it },
                placeholder = { Text("Ask StyleSync styling secret...", color = Color.Gray, fontSize = 12.sp) },
                modifier = Modifier
                    .weight(1f)
                    .testTag("chat_input_text"),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = LuxuryGold,
                    unfocusedBorderColor = Color.Gray,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                ),
                shape = RoundedCornerShape(12.dp),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                keyboardActions = KeyboardActions(onSend = {
                    if (questionInput.isNotBlank()) {
                        viewModel.sendChatMessage(questionInput)
                        questionInput = ""
                        focusManager.clearFocus()
                    }
                })
            )

            Spacer(modifier = Modifier.width(8.dp))

            IconButton(
                onClick = {
                    if (questionInput.isNotBlank()) {
                        viewModel.sendChatMessage(questionInput)
                        questionInput = ""
                        focusManager.clearFocus()
                    }
                },
                modifier = Modifier
                    .size(48.dp)
                    .background(LuxuryGold, CircleShape)
                    .testTag("chat_send_button")
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Default.Send,
                    contentDescription = "Send",
                    tint = LuxuryDark,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}

@Composable
fun ChatBubble(message: ChatMessage) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = if (message.isUser) Arrangement.End else Arrangement.Start
    ) {
        Box(
            modifier = Modifier
                .background(
                    color = if (message.isUser) LuxuryGold else LuxuryLightGray,
                    shape = RoundedCornerShape(
                        topStart = 16.dp,
                        topEnd = 16.dp,
                        bottomStart = if (message.isUser) 16.dp else 0.dp,
                        bottomEnd = if (message.isUser) 0.dp else 16.dp
                    )
                )
                .padding(horizontal = 14.dp, vertical = 10.dp)
                .widthIn(max = 260.dp)
        ) {
            Text(
                text = message.text,
                fontSize = 12.sp,
                color = if (message.isUser) LuxuryDark else Color.White,
                lineHeight = 18.sp,
                fontWeight = if (message.isUser) FontWeight.Bold else FontWeight.Normal
            )
        }
    }
}

// ------------------------------------
// 4. GLOBAL TRENDS & NEWS ALERTS PANEL
// ------------------------------------
@Composable
fun TrendsScreenPane(viewModel: StylistViewModel) {
    val trends by viewModel.trendsList.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .testTag("trends_pane")
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "AI GLOBAL FASHION TRENDS",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    color = LuxuryGold
                )
                Text(
                    text = "Curated luxury insights matching celebrity wardrobes.",
                    fontSize = 11.sp,
                    color = Color.LightGray
                )
            }

            IconButton(
                onClick = { viewModel.refreshTrendsFromAI() },
                modifier = Modifier
                    .background(LuxuryLightGray, CircleShape)
                    .size(36.dp)
            ) {
                Icon(Icons.Default.Refresh, "Refresh Trends", tint = LuxuryGold)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(16.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(trends) { item ->
                TrendingFashionItemCard(item = item)
            }
        }
    }
}

@Composable
fun TrendingFashionItemCard(item: TrendingItem) {
    Card(
        colors = CardDefaults.cardColors(containerColor = LuxuryLightGray),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier
            .fillMaxWidth()
            .border(BorderStroke(0.5.dp, GlassWhiteBorder), RoundedCornerShape(16.dp))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .background(LuxuryGold.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = item.category.uppercase(),
                        color = LuxuryGold,
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }

                Text(
                    text = item.celebrity,
                    color = Color.LightGray,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Light
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = item.title,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Serif,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = item.description,
                fontSize = 11.sp,
                color = Color.LightGray,
                lineHeight = 16.sp
            )
        }
    }
}

// ------------------------------------
// DYNAMIC COMPONENT: PREFER SINGLE OPTION SELECTION ROW
// ------------------------------------
@Composable
fun StylistSelectionRow(
    label: String,
    options: List<String>,
    currentSelection: String,
    onOptionSelected: (String) -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = label + ":",
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = LuxuryGold
        )
        Spacer(modifier = Modifier.height(6.dp))

        // Horizontal selections
        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            items(options) { opt ->
                val isSelected = opt == currentSelection
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) LuxuryGold else LuxuryDark)
                        .border(
                            BorderStroke(0.5.dp, if (isSelected) GlowGold else Color.Gray.copy(alpha = 0.4f)),
                            RoundedCornerShape(8.dp)
                        )
                        .clickable { onOptionSelected(opt) }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = opt,
                        fontSize = 10.sp,
                        color = if (isSelected) LuxuryDark else Color.White,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                    )
                }
            }
        }
    }
}

// Double helper for layout: twin scanning line animation
private fun twinSequence() = KeyframesSpec(
    KeyframesSpec.KeyframesSpecConfig<Float>().apply {
        durationMillis = 2000
        0f at 0
        1f at 2000
    }
)
