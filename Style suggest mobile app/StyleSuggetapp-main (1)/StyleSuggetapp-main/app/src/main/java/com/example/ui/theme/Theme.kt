package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme =
  darkColorScheme(
    primary = LuxuryGold,
    secondary = LuxuryGoldLight,
    tertiary = GlowGold,
    background = LuxuryDark,
    surface = LuxuryGray,
    onPrimary = LuxuryDark,
    onSecondary = LuxuryDark,
    onTertiary = LuxuryDark,
    onBackground = Color.White,
    onSurface = Color.White,
    surfaceVariant = LuxuryLightGray,
    onSurfaceVariant = Color.White
  )

private val LightColorScheme = DarkColorScheme // Standardize on Luxury Dark theme!

@Composable
fun MyApplicationTheme(
  darkTheme: Boolean = true, // Force Dark theme by default for Luxury Fashion AI feel
  dynamicColor: Boolean = false, // Disable dynamic content-aware coloring so the custom Gold/Black theme remains dominant
  content: @Composable () -> Unit,
) {
  val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

  MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}
