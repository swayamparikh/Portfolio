package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.LuxuryDark
import com.example.ui.theme.LuxuryDarkAccent
import com.example.ui.theme.LuxuryGold
import com.example.ui.theme.LuxuryGray
import com.example.ui.theme.LuxuryLightGray

@Composable
fun WelcomeScreen(
    onLoginSuccess: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var emailInput by remember { mutableStateOf("") }
    var showEmailForm by remember { mutableStateOf(false) }
    var passwordInput by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf("") }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(LuxuryDark, LuxuryDarkAccent, LuxuryGray)
                )
            )
            .padding(24.dp)
    ) {
        // Absolute background decorative visual overlay representing haute-couture coordinates
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Elegant Header
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 48.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "S T Y L E S Y N C   A I",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.ExtraBold,
                    fontFamily = FontFamily.Serif,
                    color = LuxuryGold,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(bottom = 8.dp)
                )

                Text(
                    text = "P E R S O N A L  F A S H I O N  C O N C I E R G E",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium,
                    fontFamily = FontFamily.Monospace,
                    color = Color.LightGray.copy(alpha = 0.8f),
                    textAlign = TextAlign.Center
                )
            }

            // Interactive Auth UI Box
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 36.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                AnimatedVisibility(
                    visible = !showEmailForm,
                    enter = fadeIn(),
                    exit = fadeOut()
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Step into personal luxury style curation. Let state-of-the-art vision models analyze your appearance and draft high-end wardrobing.",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Light,
                            color = Color.White.copy(alpha = 0.85f),
                            textAlign = TextAlign.Center,
                            lineHeight = 22.sp,
                            modifier = Modifier.padding(start = 16.dp, end = 16.dp, bottom = 32.dp)
                        )

                        // Google Authentication Button Simulation
                        Button(
                            onClick = { onLoginSuccess("custom.google@stylesync.ai") },
                            colors = ButtonDefaults.buttonColors(containerColor = LuxuryGray),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp)
                                .border(0.5.dp, Color.White.copy(alpha = 0.12f), RoundedCornerShape(16.dp))
                                .testTag("login_google_button")
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Security,
                                    contentDescription = "Google Icon",
                                    tint = LuxuryGold,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = "Continue with Google",
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Apple Auth Button Simulation
                        Button(
                            onClick = { onLoginSuccess("custom.apple@stylesync.ai") },
                            colors = ButtonDefaults.buttonColors(containerColor = LuxuryGray),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp)
                                .border(0.5.dp, Color.White.copy(alpha = 0.12f), RoundedCornerShape(16.dp))
                                .testTag("login_apple_button")
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Fingerprint,
                                    contentDescription = "Apple Icon",
                                    tint = LuxuryGold,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = "Continue with Apple",
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Email Login Transition
                        Button(
                            onClick = { showEmailForm = true },
                            colors = ButtonDefaults.buttonColors(containerColor = LuxuryGray),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp)
                                .border(0.5.dp, Color.White.copy(alpha = 0.12f), RoundedCornerShape(16.dp))
                                .testTag("login_email_trigger")
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Email,
                                    contentDescription = "Email Icon",
                                    tint = LuxuryGold,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Text(
                                    text = "Log In with Email",
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        // Guest mode quick entrance
                        Text(
                            text = "Enter as Anonymous Guest",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = LuxuryGold,
                            modifier = Modifier
                                .clickable { onLoginSuccess("guest.couture@stylesync.ai") }
                                .padding(8.dp)
                                .testTag("login_guest_button")
                        )
                    }
                }

                AnimatedVisibility(
                    visible = showEmailForm,
                    enter = fadeIn(),
                    exit = fadeOut()
                ) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
                        shape = RoundedCornerShape(24.dp),
                        modifier = Modifier
                             .fillMaxWidth()
                             .background(
                                 brush = Brush.verticalGradient(
                                     colors = listOf(LuxuryGray, Color(0xFF0F0F0F))
                                 ),
                                 shape = RoundedCornerShape(24.dp)
                             )
                             .border(0.5.dp, Color.White.copy(alpha = 0.12f), RoundedCornerShape(24.dp))
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "EMAIL AUTHENTICATION",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace,
                                color = LuxuryGold,
                                modifier = Modifier.padding(bottom = 16.dp)
                            )

                            OutlinedTextField(
                                value = emailInput,
                                onValueChange = { emailInput = it },
                                label = { Text("Enter StyleSync Email") },
                                leadingIcon = { Icon(Icons.Default.Email, "Email", tint = LuxuryGold) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("auth_email_input"),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = LuxuryGold,
                                    unfocusedBorderColor = Color.Gray,
                                    focusedLabelColor = LuxuryGold,
                                    unfocusedLabelColor = Color.LightGray,
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White
                                ),
                                shape = RoundedCornerShape(12.dp)
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            OutlinedTextField(
                                value = passwordInput,
                                onValueChange = { passwordInput = it },
                                label = { Text("Passcode") },
                                leadingIcon = { Icon(Icons.Default.Lock, "Passcode", tint = LuxuryGold) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .testTag("auth_password_input"),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = LuxuryGold,
                                    unfocusedBorderColor = Color.Gray,
                                    focusedLabelColor = LuxuryGold,
                                    unfocusedLabelColor = Color.LightGray,
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White
                                ),
                                shape = RoundedCornerShape(12.dp)
                            )

                            if (errorMessage.isNotEmpty()) {
                                Text(
                                    text = errorMessage,
                                    color = Color.Red,
                                    fontSize = 12.sp,
                                    modifier = Modifier.padding(top = 8.dp)
                                )
                            }

                            Spacer(modifier = Modifier.height(20.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "Cancel",
                                    color = Color.White.copy(alpha = 0.6f),
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier
                                        .clickable { showEmailForm = false }
                                        .padding(12.dp)
                                )

                                Button(
                                    onClick = {
                                        if (emailInput.contains("@") && emailInput.contains(".")) {
                                            onLoginSuccess(emailInput)
                                        } else {
                                            errorMessage = "Please enter structural email parameters"
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = LuxuryGold),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier.testTag("auth_submit_button")
                                ) {
                                    Text("Authenticate", color = LuxuryDark, fontWeight = FontWeight.Black)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
