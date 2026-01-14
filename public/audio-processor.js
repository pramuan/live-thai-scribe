class PCMProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 2048;
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || !input[0]) return true;

        const inputChannel = input[0];

        // Fill the buffer
        for (let i = 0; i < inputChannel.length; i++) {
            this.buffer[this.bufferIndex++] = inputChannel[i];

            // When buffer is full, process and flush
            if (this.bufferIndex >= this.bufferSize) {
                this.flush();
            }
        }

        return true;
    }

    flush() {
        // Convert Float32 to Int16
        const pcmData = new Int16Array(this.bufferSize);
        for (let i = 0; i < this.bufferSize; i++) {
            // Clamp between -1 and 1, then scale to Int16 range
            const s = Math.max(-1, Math.min(1, this.buffer[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Send to main thread
        this.port.postMessage(pcmData.buffer, [pcmData.buffer]);

        // Reset buffer index
        this.bufferIndex = 0;
    }
}

registerProcessor('pcm-processor', PCMProcessor);
