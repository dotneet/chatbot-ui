import { useEffect, useRef } from 'react';

const AudioPlayer = ({ audioBuffer }: { audioBuffer?: AudioBuffer }) => {
  const audioRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (audioBuffer) {
      // Create a new AudioContext
      const audioContext = new window.AudioContext();

      // Create a new AudioBufferSourceNode
      const sourceNode = audioContext.createBufferSource();

      // Set the audioBuffer as the source for the AudioBufferSourceNode
      sourceNode.buffer = audioBuffer;

      // Connect the AudioBufferSourceNode to the audioContext destination
      sourceNode.connect(audioContext.destination);

      // Start playing the audio
      sourceNode.start();

      // Store the AudioBufferSourceNode in the audioRef for later control (e.g., pausing)
      audioRef.current = sourceNode;
    }

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.stop();
        audioRef.current.disconnect();
      }
    };
  }, [audioBuffer]);

  return <></>;
};

export default AudioPlayer;
