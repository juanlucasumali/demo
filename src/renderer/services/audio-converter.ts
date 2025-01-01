import lamejs from 'lamejs';

export class AudioConverterService {
  private static async getAudioBuffer(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    const audioContext = new AudioContext();
    return await audioContext.decodeAudioData(arrayBuffer);
  }

  static async wavToMp3(wavArrayBuffer: ArrayBuffer, options = { kbps: 192 }): Promise<ArrayBuffer> {
    console.log('🎵 Starting WAV to MP3 conversion...');
    try {
      const audioBuffer = await this.getAudioBuffer(wavArrayBuffer);
      const channels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      
      console.log('📊 Audio details:', {
        channels,
        sampleRate,
        duration: audioBuffer.duration,
        kbps: options.kbps
      });

      const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, options.kbps);
      const mp3Data: Int8Array[] = [];
      
      // Process audio in chunks
      const sampleBlockSize = 1152;
      const samples = new Int16Array(sampleBlockSize * channels);
      
      for (let i = 0; i < audioBuffer.length; i += sampleBlockSize) {
        // Get samples for all channels
        for (let channel = 0; channel < channels; channel++) {
          const channelData = audioBuffer.getChannelData(channel);
          const offset = channel * sampleBlockSize;
          
          // Convert Float32 to Int16
          for (let j = 0; j < sampleBlockSize && (i + j) < audioBuffer.length; j++) {
            const index = offset + j;
            const sample = channelData[i + j];
            samples[index] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
          }
        }

        // Encode chunk
        let mp3buf: Int8Array;
        if (channels === 1) {
          mp3buf = mp3encoder.encodeBuffer(samples);
        } else {
          const left = samples.subarray(0, sampleBlockSize);
          const right = samples.subarray(sampleBlockSize);
          mp3buf = mp3encoder.encodeBuffer(left, right);
        }

        if (mp3buf.length > 0) {
          mp3Data.push(mp3buf);
        }
      }

      // Get the last buffer
      const mp3buf = mp3encoder.flush();
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }

      // Combine all chunks
      const totalLength = mp3Data.reduce((acc, buf) => acc + buf.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const buf of mp3Data) {
        result.set(buf, offset);
        offset += buf.length;
      }

      console.log('✅ WAV to MP3 conversion complete');
      return result.buffer;
    } catch (error) {
      console.error('❌ WAV to MP3 conversion failed:', error);
      throw error;
    }
  }

  static async mp3ToWav(mp3ArrayBuffer: ArrayBuffer): Promise<ArrayBuffer> {
    console.log('🎵 Starting MP3 to WAV conversion...');
    try {
      const audioBuffer = await this.getAudioBuffer(mp3ArrayBuffer);
      
      console.log('📊 Audio details:', {
        channels: audioBuffer.numberOfChannels,
        sampleRate: audioBuffer.sampleRate,
        duration: audioBuffer.duration
      });

      // WAV header size is 44 bytes
      const wavHeader = new ArrayBuffer(44);
      const view = new DataView(wavHeader);
      
      // "RIFF" chunk descriptor
      view.setUint8(0, "R".charCodeAt(0));
      view.setUint8(1, "I".charCodeAt(0));
      view.setUint8(2, "F".charCodeAt(0));
      view.setUint8(3, "F".charCodeAt(0));
      
      const channels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const bitsPerSample = 16;
      const byteRate = sampleRate * channels * (bitsPerSample / 8);
      const blockAlign = channels * (bitsPerSample / 8);
      const samples = audioBuffer.length;
      const dataSize = samples * blockAlign;
      const fileSize = 36 + dataSize;
      
      // File size
      view.setUint32(4, fileSize, true);
      
      // "WAVE" format
      view.setUint8(8, "W".charCodeAt(0));
      view.setUint8(9, "A".charCodeAt(0));
      view.setUint8(10, "V".charCodeAt(0));
      view.setUint8(11, "E".charCodeAt(0));
      
      // "fmt " subchunk
      view.setUint8(12, "f".charCodeAt(0));
      view.setUint8(13, "m".charCodeAt(0));
      view.setUint8(14, "t".charCodeAt(0));
      view.setUint8(15, " ".charCodeAt(0));
      view.setUint32(16, 16, true); // Subchunk1Size
      view.setUint16(20, 1, true); // AudioFormat (PCM)
      view.setUint16(22, channels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitsPerSample, true);
      
      // "data" subchunk
      view.setUint8(36, "d".charCodeAt(0));
      view.setUint8(37, "a".charCodeAt(0));
      view.setUint8(38, "t".charCodeAt(0));
      view.setUint8(39, "a".charCodeAt(0));
      view.setUint32(40, dataSize, true);
      
      // Convert audio data to Int16
      const wavData = new Int16Array(samples * channels);
      for (let channel = 0; channel < channels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < samples; i++) {
          const index = i * channels + channel;
          const sample = channelData[i];
          wavData[index] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        }
      }
      
      // Combine header and data
      const result = new Uint8Array(wavHeader.byteLength + wavData.buffer.byteLength);
      result.set(new Uint8Array(wavHeader), 0);
      result.set(new Uint8Array(wavData.buffer), wavHeader.byteLength);
      
      console.log('✅ MP3 to WAV conversion complete');
      return result.buffer;
    } catch (error) {
      console.error('❌ MP3 to WAV conversion failed:', error);
      throw error;
    }
  }
} 