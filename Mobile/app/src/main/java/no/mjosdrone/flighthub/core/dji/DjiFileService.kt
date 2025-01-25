package no.mjosdrone.flighthub.core.dji

import android.os.IBinder
import android.os.IInterface
import android.os.Parcel
import java.io.File

class DjiFileService : IDjiFileService.Stub() {
    override fun listWaypointFolders(): Array<String> {
        val djiPath = "/storage/emulated/0/Android/data/dji.go.v5/files/waypoint"
        return try {
            val folder = File(djiPath)
            if (folder.exists() && folder.isDirectory) {
                folder.listFiles()
                    ?.filter { it.isDirectory }
                    ?.map { it.name }
                    ?.toTypedArray()
                    ?: emptyArray()
            } else {
                emptyArray()
            }
        } catch (e: Exception) {
            emptyArray()
        }
    }
}

interface IDjiFileService : IInterface {
    fun listWaypointFolders(): Array<String>

    abstract class Stub : android.os.Binder(), IDjiFileService {
        companion object {
            const val DESCRIPTOR = "no.mjosdrone.flighthub.core.dji.IDjiFileService"
            const val TRANSACTION_listWaypointFolders = android.os.IBinder.FIRST_CALL_TRANSACTION
        }

        init {
            this.attachInterface(this, DESCRIPTOR)
        }

        override fun asBinder(): IBinder = this

        override fun onTransact(code: Int, data: Parcel, reply: Parcel?, flags: Int): Boolean {
            when (code) {
                TRANSACTION_listWaypointFolders -> {
                    data.enforceInterface(DESCRIPTOR)
                    val result = this.listWaypointFolders()
                    reply?.let {
                        it.writeNoException()
                        it.writeStringArray(result)
                    }
                    return true
                }
            }
            return super.onTransact(code, data, reply, flags)
        }

        private class Proxy(private val mRemote: IBinder) : IDjiFileService {
            override fun asBinder(): IBinder = mRemote

            override fun listWaypointFolders(): Array<String> {
                val data = Parcel.obtain()
                val reply = Parcel.obtain()
                try {
                    data.writeInterfaceToken(DESCRIPTOR)
                    mRemote.transact(TRANSACTION_listWaypointFolders, data, reply, 0)
                    reply.readException()
                    return reply.createStringArray() ?: emptyArray()
                } finally {
                    reply.recycle()
                    data.recycle()
                }
            }
        }
    }
}
