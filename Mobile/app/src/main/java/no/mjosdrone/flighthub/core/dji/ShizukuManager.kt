package no.mjosdrone.flighthub.core.dji

import android.content.ComponentName
import android.content.Context
import android.content.ServiceConnection
import android.content.pm.PackageManager
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import dagger.hilt.android.qualifiers.ApplicationContext
import rikka.shizuku.Shizuku
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ShizukuManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private var isShizukuAvailable = false
    private val mainHandler = Handler(Looper.getMainLooper())
    private var djiFileService: IDjiFileService? = null

    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            djiFileService = IDjiFileService.Stub.asInterface(service)
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            djiFileService = null
        }
    }

    private val binderReceivedListener = Shizuku.OnBinderReceivedListener {
        isShizukuAvailable = true
        checkPermission()
    }

    private val binderDeadListener = Shizuku.OnBinderDeadListener {
        isShizukuAvailable = false
        djiFileService = null
    }

    private val permissionResultListener = Shizuku.OnRequestPermissionResultListener { requestCode, grantResult ->
        val granted = grantResult == PackageManager.PERMISSION_GRANTED
        onPermissionResult(granted)
    }

    init {
        // Register listeners
        Shizuku.addBinderReceivedListener(binderReceivedListener)
        Shizuku.addBinderDeadListener(binderDeadListener)
        Shizuku.addRequestPermissionResultListener(permissionResultListener)

        // Check if Shizuku is already available
        if (Shizuku.pingBinder()) {
            isShizukuAvailable = true
            checkPermission()
        }
    }

    fun destroy() {
        Shizuku.removeBinderReceivedListener(binderReceivedListener)
        Shizuku.removeBinderDeadListener(binderDeadListener)
        Shizuku.removeRequestPermissionResultListener(permissionResultListener)
        try {
            Shizuku.unbindUserService(serviceArgs, serviceConnection, true)
        } catch (e: Exception) {
            Log.e(TAG, "Error unbinding service", e)
        }
    }

    private fun checkPermission() {
        if (Shizuku.isPreV11()) {
            // Pre-v11 is unsupported
            return
        }

        try {
            when {
                Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED -> {
                    onPermissionResult(true)
                }
                Shizuku.shouldShowRequestPermissionRationale() -> {
                    // User denied permission and selected "Don't ask again"
                    onPermissionResult(false)
                }
                else -> {
                    // Request permission
                    Shizuku.requestPermission(PERMISSION_REQUEST_CODE)
                }
            }
        } catch (e: Exception) {
            // Handle any exceptions that might occur during permission check
            onPermissionResult(false)
        }
    }

    private fun onPermissionResult(granted: Boolean) {
        if (granted) {
            // Permission granted, initialize Shizuku operations
            initializeShizuku()
        } else {
            // Permission denied, handle accordingly
            Log.w(TAG, "Shizuku permission denied")
        }
    }

    private val serviceArgs = Shizuku.UserServiceArgs(DjiFileService::class.java)
        .daemon(false)
        .processNameSuffix("dji_service")
        .version(1)

    private fun initializeShizuku() {
        try {
            Shizuku.bindUserService(serviceArgs, serviceConnection)
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing Shizuku service", e)
        }
    }

    fun isAvailable(): Boolean = isShizukuAvailable && 
        Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED

    fun requestPermission() {
        if (!isShizukuAvailable) return
        checkPermission()
    }

    fun hasPermission(): Boolean {
        return try {
            if (!isShizukuAvailable) return false
            if (Shizuku.isPreV11()) return false
            
            Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED
        } catch (e: Exception) {
            false
        }
    }

    fun listWaypointFolders(): Array<String> {
        return try {
            djiFileService?.listWaypointFolders() ?: emptyArray()
        } catch (e: Exception) {
            Log.e(TAG, "Error listing waypoint folders", e)
            emptyArray()
        }
    }

    companion object {
        private const val TAG = "ShizukuManager"
        private const val PERMISSION_REQUEST_CODE = 1001
    }
}
