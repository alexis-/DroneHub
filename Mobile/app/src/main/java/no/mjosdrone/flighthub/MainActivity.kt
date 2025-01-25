package no.mjosdrone.flighthub

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import dagger.hilt.android.AndroidEntryPoint
import no.mjosdrone.flighthub.core.dji.ShizukuManager
import no.mjosdrone.flighthub.ui.theme.DroneHubTheme
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    @Inject lateinit var shizukuManager: ShizukuManager
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            DroneHubTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    WaypointFoldersList(shizukuManager)
                }
            }
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        shizukuManager.destroy()
    }
}

@Composable
fun WaypointFoldersList(shizukuManager: ShizukuManager) {
    var folders by remember { mutableStateOf(emptyArray<String>()) }
    var hasPermission by remember { mutableStateOf(shizukuManager.hasPermission()) }
    
    LaunchedEffect(hasPermission) {
        if (hasPermission) {
            folders = shizukuManager.listWaypointFolders()
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (!shizukuManager.isAvailable()) {
            Text(
                text = "Shizuku is not available. Please install and start Shizuku.",
                style = MaterialTheme.typography.bodyLarge,
                modifier = Modifier.padding(16.dp)
            )
        } else if (!hasPermission) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Shizuku permission is required",
                    style = MaterialTheme.typography.bodyLarge,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
                Button(onClick = { 
                    shizukuManager.requestPermission()
                    hasPermission = shizukuManager.hasPermission()
                }) {
                    Text("Grant Permission")
                }
            }
        } else {
            Text(
                text = "DJI Waypoint Folders",
                style = MaterialTheme.typography.headlineMedium,
                modifier = Modifier.padding(bottom = 16.dp)
            )
            
            if (folders.isEmpty()) {
                Text(
                    text = "No waypoint folders found",
                    style = MaterialTheme.typography.bodyLarge
                )
            } else {
                LazyColumn {
                    items(folders) { folder ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                        ) {
                            Text(
                                text = folder,
                                modifier = Modifier.padding(16.dp),
                                style = MaterialTheme.typography.bodyLarge
                            )
                        }
                    }
                }
            }
        }
    }
}
