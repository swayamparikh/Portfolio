package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.WelcomeScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.StylistViewModel

class MainActivity : ComponentActivity() {
  private val viewModel: StylistViewModel by viewModels()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme {
        val isLoggedIn by viewModel.isLoggedIn.collectAsState()

        if (!isLoggedIn) {
          WelcomeScreen(
            onLoginSuccess = { email ->
              viewModel.loginSimulated("Email", email)
            },
            modifier = Modifier.fillMaxSize()
          )
        } else {
          DashboardScreen(
            viewModel = viewModel,
            modifier = Modifier.fillMaxSize()
          )
        }
      }
    }
  }
}

