const audioResample = (buffer: AudioBuffer, sampleRate: number): Promise<AudioBuffer> => {
    const offlineCtx = new OfflineAudioContext(2, (buffer.length / buffer.sampleRate) * sampleRate, sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineCtx.destination);
    source.start();
    return offlineCtx.startRendering();
};

const audioReduceChannels = (buffer: AudioBuffer, targetChannelOpt: 'both' | 'left' | 'right' | 'mix'): AudioBuffer => {
    if(targetChannelOpt === 'both' || buffer.numberOfChannels < 2) return buffer;
    const outBuffer = new AudioBuffer({
        sampleRate: buffer.sampleRate, 
        length: buffer.length, 
        numberOfChannels: 1
    });

    const data = [buffer.getChannelData(0), buffer.getChannelData(1)];
    const newData = new Float32Array(buffer.length);
    for(let i = 0; i < buffer.length; ++i)
        newData[i] = 
            targetChannelOpt === 'left'? data[0][i] :
            targetChannelOpt === 'right'? data[1][i] :
            (data[0][i] + data[1][i]) / 2 ;
    outBuffer.copyToChannel(newData, 0);
    return outBuffer;
};

const audioNormalize = (buffer: AudioBuffer): AudioBuffer => {
    const data = Array.from(Array(buffer.numberOfChannels)).map((_, idx) => buffer.getChannelData(idx));
    const maxAmplitude = Math.max(...data.map(chan => chan.reduce((acc, cur) => Math.max(acc, Math.abs(cur)), 0)));
    if(maxAmplitude >= 1.0) return buffer;
    const coeff = 1.0 / maxAmplitude;
    data.forEach(chan => {
        chan.forEach((v, idx) => chan[idx] = v*coeff);
        buffer.copyToChannel(chan, 0);
    });
    return buffer;
};

export const processAudioFile = async (
    audioBufferIn: AudioBuffer, 
    targetChannelOpt: 'both' | 'left' | 'right' | 'mix', 
    targetSampleRate: number
  ): Promise<AudioBuffer> => {
    const resampled = await audioResample(audioBufferIn, targetSampleRate);
    const reduced = audioReduceChannels(resampled, targetChannelOpt);
    const normalized = audioNormalize(reduced);
    return normalized;
  }
  
  export const audioToRawWave = (
    audioChannels: Float32Array[], 
    bytesPerSample: 1 | 2, 
    mixChannels = false
  ): Uint8Array => {
    const bufferLength = audioChannels[0].length;
    const numberOfChannels = audioChannels.length === 1? 1 : 2;
    const reducedData = new Uint8Array(bufferLength * numberOfChannels * bytesPerSample);
    for (let i = 0; i < bufferLength; ++i) {
        for (let channel = 0; channel < (mixChannels? 1 : numberOfChannels); ++channel) {
            const outputIndex = (i*numberOfChannels + channel) * bytesPerSample;
            let sample: number;
            if(!mixChannels) sample = audioChannels[channel][i];
            else sample = audioChannels.reduce((prv, cur) => prv + cur[i], 0) / numberOfChannels;
            sample = sample > 1? 1 : sample < -1? -1 : sample; //check for clipping
            //bit reduce and convert to Uint8
            switch(bytesPerSample) {
                case 2:
                    sample = sample * 32767;
                    reducedData[outputIndex] = sample;
                    reducedData[outputIndex + 1] = sample >> 8;
                    break;
                case 1:
                    reducedData[outputIndex] = (sample + 1) * 127;
                    break;
                default: 
                    throw "Only 8, 16 bits per sample are supported";
            }
        }
    }
    return reducedData;
};
  
  export const makeWav = (
    data: Uint8Array, 
    channels: 1 | 2, 
    sampleRate: number, 
    bytesPerSample: 1 | 2
  ): Blob => {
    const headerLength = 44;
    var wav = new Uint8Array(headerLength + data.length);
    var view = new DataView(wav.buffer);
  
    view.setUint32( 0, 1380533830, false ); // RIFF identifier 'RIFF'
    view.setUint32( 4, 36 + data.length, true ); // file length minus RIFF identifier length and file description length
    view.setUint32( 8, 1463899717, false ); // RIFF type 'WAVE'
    view.setUint32( 12, 1718449184, false ); // format chunk identifier 'fmt '
    view.setUint32( 16, 16, true ); // format chunk length
    view.setUint16( 20, 1, true ); // sample format (raw)
    view.setUint16( 22, channels, true ); // channel count
    view.setUint32( 24, sampleRate, true ); // sample rate
    view.setUint32( 28, sampleRate * bytesPerSample * channels, true ); // byte rate (sample rate * block align)
    view.setUint16( 32, bytesPerSample * channels, true ); // block align (channel count * bytes per sample)
    view.setUint16( 34, bytesPerSample * 8, true ); // bits per sample
    view.setUint32( 36, 1684108385, false); // data chunk identifier 'data'
    view.setUint32( 40, data.length, true ); // data chunk length
  
    wav.set(data, headerLength);
  
    return new Blob([wav.buffer], {type:"audio/wav"});
};
