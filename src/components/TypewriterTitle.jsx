import { useEffect, useRef, useState } from 'react';

const TypewriterTitle = ({
  texts,
  className = '',
  speed = 70,
  deleteSpeed = 38,
  pause = 1200,
  soundEnabled = false,
  soundVolume = 0.02
}) => {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const audioRef = useRef(null);
  const prevCharIndexRef = useRef(0);

  const ensureAudioContext = () => {
    if (audioRef.current || typeof window === 'undefined') return audioRef.current;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audioRef.current = new AudioContext();
    return audioRef.current;
  };

  const playKeySound = () => {
    if (!soundEnabled) return;
    const context = ensureAudioContext();
    if (!context || context.state !== 'running') return;

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = 'square';
    oscillator.frequency.value = 680 + Math.random() * 60;
    gainNode.gain.value = 0.0001;

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    const now = context.currentTime;
    gainNode.gain.exponentialRampToValueAtTime(soundVolume, now + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    oscillator.start(now);
    oscillator.stop(now + 0.05);
  };

  useEffect(() => {
    if (!texts?.length) return;

    const current = texts[textIndex];
    let timeout;

    if (!isDeleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex(charIndex + 1), speed);
    } else if (!isDeleting && charIndex === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), pause);
    } else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex(charIndex - 1), deleteSpeed);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % texts.length);
    }

    return () => clearTimeout(timeout);
  }, [texts, textIndex, charIndex, isDeleting, speed, deleteSpeed, pause]);

  useEffect(() => {
    if (!soundEnabled) return undefined;

    const resumeAudio = () => {
      const context = ensureAudioContext();
      if (context && context.state === 'suspended') {
        context.resume();
      }
    };

    window.addEventListener('pointerdown', resumeAudio, { once: true });
    return () => window.removeEventListener('pointerdown', resumeAudio);
  }, [soundEnabled]);

  useEffect(() => {
    const prev = prevCharIndexRef.current;
    if (!isDeleting && charIndex > prev) {
      playKeySound();
    }
    prevCharIndexRef.current = charIndex;
  }, [charIndex, isDeleting]);

  if (!texts?.length) return null;

  const current = texts[textIndex];
  const visible = current.slice(0, charIndex);
  const highlightIndex = !isDeleting && charIndex > 0 ? charIndex - 1 : -1;

  return (
    <h1 className={`hero__title typewriter-title ${className}`.trim()}>
      {visible.split('').map((char, index) => (
        <span
          key={`${char}-${index}`}
          className={index === highlightIndex ? 'typewriter-char typewriter-char--active' : 'typewriter-char'}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
      <span className="typewriter-cursor" aria-hidden="true" />
    </h1>
  );
};

export default TypewriterTitle;
