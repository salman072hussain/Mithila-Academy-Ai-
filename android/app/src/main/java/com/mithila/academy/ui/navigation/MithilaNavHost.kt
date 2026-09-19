package com.mithila.academy.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.mithila.academy.ui.search.SearchScreen
import com.mithila.academy.ui.search.SearchViewModel

/**
 * Native Jetpack Compose Navigation Graph for Mithila Academy AI.
 * 100% Native Kotlin + Jetpack Compose. Zero WebView.
 */
@Composable
fun MithilaNavHost(
    navController: NavHostController = rememberNavController(),
    searchViewModel: SearchViewModel = viewModel(),
    onOpenNativeCamera: () -> Unit = {},
    onOpenNativeGallery: () -> Unit = {}
) {
    NavHost(
        navController = navController,
        startDestination = "home"
    ) {
        composable("home") {
            HomeScreen(
                searchViewModel = searchViewModel,
                onOpenSearch = { navController.navigate("search") },
                onOpenSettings = { navController.navigate("settings") },
                onOpenNativeCamera = onOpenNativeCamera,
                onOpenNativeGallery = onOpenNativeGallery
            )
        }

        composable("search") {
            SearchScreen(
                viewModel = searchViewModel,
                onBack = { navController.popBackStack() }
            )
        }

        composable("settings") {
            SettingsScreen(
                onOpenSearch = { navController.navigate("search") },
                onBack = { navController.popBackStack() }
            )
        }
    }
}

/**
 * 1. GOOGLE-STYLE SEARCH BAR ON HOME FEED
 * - Large, clean, rounded search bar directly on the Home Feed.
 * - Placeholder: "Ask Mithila Academy AI..."
 * - Allows typing and submitting immediately.
 * - Microphone icon for voice questions.
 * - Camera icon to take photo of question.
 * - Gallery icon to select photo from phone gallery.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    searchViewModel: SearchViewModel,
    onOpenSearch: () -> Unit,
    onOpenSettings: () -> Unit,
    onOpenNativeCamera: () -> Unit,
    onOpenNativeGallery: () -> Unit
) {
    var menuExpanded by remember { mutableStateOf(false) }
    var homeQuery by remember { mutableStateOf("") }
    val focusManager = LocalFocusManager.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Mithila Academy AI",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                    }
                },
                actions = {
                    // Top-Right 3-Dot Overflow Menu
                    Box {
                        IconButton(onClick = { menuExpanded = true }) {
                            Icon(Icons.Default.MoreVert, contentDescription = "More options")
                        }
                        DropdownMenu(
                            expanded = menuExpanded,
                            onDismissRequest = { menuExpanded = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("Search") },
                                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                                onClick = {
                                    menuExpanded = false
                                    onOpenSearch()
                                }
                            )
                            DropdownMenuItem(
                                text = { Text("Settings") },
                                leadingIcon = { Icon(Icons.Default.Settings, contentDescription = null) },
                                onClick = {
                                    menuExpanded = false
                                    onOpenSettings()
                                }
                            )
                        }
                    }
                }
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item {
                Spacer(modifier = Modifier.height(16.dp))

                // Academy Banner Badge
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFFF59E0B).copy(alpha = 0.15f),
                    modifier = Modifier.padding(bottom = 12.dp)
                ) {
                    Text(
                        text = "Surendra Sir's Academic AI Assistant",
                        color = Color(0xFFD97706),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    )
                }

                Text(
                    text = "What would you like to learn?",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold,
                    modifier = Modifier.padding(bottom = 20.dp)
                )

                // GOOGLE-STYLE LARGE ROUNDED SEARCH BAR ON HOME FEED
                Surface(
                    shape = CircleShape,
                    shadowElevation = 6.dp,
                    color = MaterialTheme.colorScheme.surface,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Left Search Icon
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = Color(0xFFF59E0B),
                            modifier = Modifier.size(24.dp)
                        )

                        // Center Input Field
                        TextField(
                            value = homeQuery,
                            onValueChange = { homeQuery = it },
                            placeholder = {
                                Text(
                                    text = "Ask Mithila Academy AI...",
                                    fontSize = 14.sp,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                )
                            },
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color.Transparent,
                                unfocusedContainerColor = Color.Transparent,
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent
                            ),
                            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                            keyboardActions = KeyboardActions(
                                onSearch = {
                                    if (homeQuery.isNotBlank()) {
                                        focusManager.clearFocus()
                                        searchViewModel.submitQuestion(homeQuery)
                                        onOpenSearch()
                                    }
                                }
                            ),
                            singleLine = true,
                            modifier = Modifier.weight(1f)
                        )

                        // Action Shortcuts: Gallery, Camera, Microphone
                        IconButton(
                            onClick = onOpenNativeGallery,
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Image,
                                contentDescription = "Gallery photo picker",
                                tint = Color(0xFF818CF8)
                            )
                        }

                        IconButton(
                            onClick = onOpenNativeCamera,
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.PhotoCamera,
                                contentDescription = "Camera question capture",
                                tint = Color(0xFFF59E0B)
                            )
                        }

                        IconButton(
                            onClick = {
                                searchViewModel.startVoiceRecognition()
                                onOpenSearch()
                            },
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Mic,
                                contentDescription = "Voice search",
                                tint = Color(0xFFF59E0B)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Location Quick Query Card
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            searchViewModel.submitQuestion("Mithila Academy kaha sthit hai?")
                            onOpenSearch()
                        }
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = "Location",
                            tint = Color(0xFFF59E0B)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Mithila Academy Location",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                            Text(
                                text = "Kauriyahi Village mein sthit hai (Tap to ask)",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Icon(
                            imageVector = Icons.Default.ChevronRight,
                            contentDescription = null
                        )
                    }
                }
            }
        }
    }
}

/**
 * Pure Jetpack Compose Native Settings Screen with Search option & Offline mode.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onOpenSearch: () -> Unit,
    onBack: () -> Unit
) {
    var autoSpeak by remember { mutableStateOf(true) }
    var offlineMode by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                }
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Search Option inside Settings
            item {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFFF59E0B).copy(alpha = 0.12f),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onOpenSearch() }
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = Color(0xFFF59E0B)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Search",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                            Text(
                                text = "Open dedicated search screen",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Icon(Icons.Default.ChevronRight, contentDescription = null)
                    }
                }
            }

            // Offline Mode Setting
            item {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.WifiOff,
                            contentDescription = "Offline Mode",
                            tint = Color(0xFF10B981)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Offline Mode",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            Text(
                                text = "Use cached syllabus and local answers",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Switch(
                            checked = offlineMode,
                            onCheckedChange = { offlineMode = it }
                        )
                    }
                }
            }

            // Auto-Read Aloud Answers
            item {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.VolumeUp,
                            contentDescription = "Voice read-aloud",
                            tint = Color(0xFFF59E0B)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Auto-Read Aloud Answers",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp
                            )
                            Text(
                                text = "Surendra Sir voice readout",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Switch(
                            checked = autoSpeak,
                            onCheckedChange = { autoSpeak = it }
                        )
                    }
                }
            }
        }
    }
}
