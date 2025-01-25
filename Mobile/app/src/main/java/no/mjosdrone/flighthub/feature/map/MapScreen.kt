package no.mjosdrone.flighthub.feature.map

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.mapbox.mapboxsdk.Mapbox
import com.mapbox.mapboxsdk.maps.MapView

@Composable
fun MapScreen() {
    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { context ->
            MapView(context).apply {
                // Initialize MapLibre map here
                // This is a placeholder - we'll implement the full map configuration later
            }
        },
        update = { mapView ->
            // Update map when composition updates
        }
    )
}
