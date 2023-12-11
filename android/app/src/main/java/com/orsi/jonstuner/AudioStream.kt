package com.orsi.jonstuner
import android.Manifest
import android.content.pm.PackageManager
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.util.Log
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlin.concurrent.thread

class AudioStream(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "AudioStream"

    private var audioRecord: AudioRecord? = null
    private var recordingThread: Thread? = null
    private var isRecordingAudio: Boolean = false
    private var sampleRateInHz: Int = 44100
    private var bufferSize: Int = 8192

    @ReactMethod fun start() {
        val recordAudioPermission = ActivityCompat.checkSelfPermission(reactApplicationContext, Manifest.permission.RECORD_AUDIO)
        val isPermissionGranted = recordAudioPermission == PackageManager.PERMISSION_GRANTED;
        if (!isPermissionGranted) {
            // can't really do anything here since we ask for permissions
            // in react-native before even starting
            return;
        }

        val channelConfig = AudioFormat.CHANNEL_IN_MONO
        val audioFormat = AudioFormat.ENCODING_PCM_16BIT
        audioRecord = AudioRecord(MediaRecorder.AudioSource.MIC, sampleRateInHz, channelConfig, audioFormat, bufferSize)

        if (audioRecord!!.state != AudioRecord.STATE_INITIALIZED) {
            // can't do anything here if it never initialized
            return
        }

        isRecordingAudio = true
        audioRecord?.startRecording()

        // start recording thread to poll for audio data
        recordingThread = thread(true) {
            val shorts = ShortArray(bufferSize / 2)
            while (isRecordingAudio) {
                audioRecord!!.read(shorts, 0, shorts.size)
                val floats = shorts.map{ it.toFloat() }.toFloatArray()
                val args = Arguments.fromArray(floats)
                sendEvent(this.reactApplicationContext, "onAudio", args)
            }
        }
    }
    @ReactMethod fun stop() {
        if (audioRecord != null) {
            isRecordingAudio = false
            audioRecord?.stop()
            audioRecord?.release()
            audioRecord = null
            recordingThread = null
        }
    }

    private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableArray?) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
    }
    private var listenerCount = 0

    @ReactMethod
    fun addListener(eventName: String) {
        if (listenerCount == 0) {
            // Set up any upstream listeners or background tasks as necessary
        }

        listenerCount += 1
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        listenerCount -= count
        if (listenerCount == 0) {
            // Remove upstream listeners, stop unnecessary background tasks
        }
    }
}