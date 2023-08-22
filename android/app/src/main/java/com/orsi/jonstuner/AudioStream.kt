package com.orsi.jonstuner
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.facebook.react.modules.core.DeviceEventManagerModule

class AudioStream(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "AudioStream"
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
    @ReactMethod fun setup(options: ReadableMap?) {
        Log.d("AudioStream","setup");
    }
    @ReactMethod fun start() {
        Log.d("AudioStream","start");
        val data = Arguments.fromArray(floatArrayOf(1.2f, 5.1f, 6.3f))
        sendEvent(this.reactApplicationContext, "onAudio", data)
    }
    @ReactMethod fun stop() {
        Log.d("AudioStream","stop");
    }
    @ReactMethod fun getBufferSize() {
        Log.d("AudioStream","getBufferSize");
    }
    @ReactMethod fun getSampleRate() {
        Log.d("AudioStream","getSampleRate");
    }
}