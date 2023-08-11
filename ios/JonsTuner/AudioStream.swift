import AVFoundation
import React

@objc(AudioStream)
class AudioStream: RCTEventEmitter {
  var engine: AVAudioEngine?
  var bufferSize: UInt32 = 4096
  var sampleRate: UInt32 = 44100
  
  override init() {
      super.init()
      engine = AVAudioEngine()
  }
  
  override func startObserving() {
      // Set up any upstream listeners or background tasks as necessary
  }
  
  override func stopObserving() {
      // Set up any upstream listeners or background tasks as necessary
  }
  
  override func supportedEvents() -> [String]! {
      return ["onAudio"]
  }
  
  @objc
  func setup(_ options: NSDictionary?) {
    bufferSize = options?["bufferSize"] as? UInt32 ?? bufferSize
    sampleRate = options?["sampleRate"] as? UInt32 ?? sampleRate
    
    let status = AVCaptureDevice.authorizationStatus(for: .audio)
    if status == .notDetermined {
      AVCaptureDevice.requestAccess(for: .audio, completionHandler: { result in
        return
      })
    }
    
  }

  @objc
  func start() {
    if let engine = engine {
      let session = AVAudioSession.sharedInstance()
      try? session.setPreferredSampleRate(Double(sampleRate))
      try? session.setPreferredIOBufferDuration(Double(sampleRate / bufferSize))
      try? session.setCategory(.record)
      try? session.setActive(true)
      
      let hardwareSampleRate = engine.inputNode.inputFormat(forBus: 0).sampleRate
      let inputFormat = AVAudioFormat(standardFormatWithSampleRate: hardwareSampleRate, channels: 1)
      
      engine.inputNode.installTap(
        onBus: 0,
        bufferSize: bufferSize,
        format: inputFormat
      ) { (buffer, time) in
        buffer.frameLength = self.bufferSize
        let output = Array(UnsafeBufferPointer(
          start: buffer.floatChannelData![0],
          count: Int(buffer.frameLength)
        ))
        self.sendEvent(withName: "onAudio", body: output)
        return
      }
      
      engine.prepare()
      try? engine.start()
    }
  }

  @objc
  func stop() {
    engine?.inputNode.removeTap(onBus: 0)
    engine?.stop()
  }
  
  @objc
  func getBufferSize() -> UInt32 {
    return bufferSize
  }
  
  @objc
  func getSampleRate() -> UInt32 {
    return sampleRate
  }
}
