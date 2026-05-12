import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Trash2, MessageCircle, LogIn, ArrowLeft, LogOut, Mic, MicOff, Volume2, Settings, Check, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getStudentPhotoUrl } from '../utils/imageUtils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AiChatPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAuthenticated = !!user;
  const STORAGE_KEY = `pisantri_chat_history_${user?.role === 'santri' ? ((user as any).santri_id || user.id) : (user?.id || 'public')}`;
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isWakeMode, setIsWakeMode] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [voiceCountdown, setVoiceCountdown] = useState<number | null>(null);
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [isVoiceResponseEnabled, setIsVoiceResponseEnabled] = useState(false);
  const [isTypingManually, setIsTypingManually] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const lastSpeachEndRef = useRef<number>(0);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState(() => {
    const saved = localStorage.getItem('aiman_voice_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { provider: 'elevenlabs', voiceId: '5EcwHcWuVGGxY91hupUf' }; // Blasto - Young Male
      }
    }
    return { provider: 'elevenlabs', voiceId: '5EcwHcWuVGGxY91hupUf' }; // Blasto - Young Male
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const voiceTriggeredRef = useRef(false);
  const silenceTimeoutRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const currentInputRef = useRef(''); // To track input inside timeouts
  const isAiSpeakingRef = useRef(false);
  const isVoiceResponseEnabledRef = useRef(false);
  const isTypingManuallyRef = useRef(false);
  const isRecognitionActiveRef = useRef(false);

  // Sync state to refs for use in event listeners/callbacks
  useEffect(() => {
    isVoiceResponseEnabledRef.current = isVoiceResponseEnabled;
  }, [isVoiceResponseEnabled]);

  useEffect(() => {
    isTypingManuallyRef.current = isTypingManually;
  }, [isTypingManually]);

  const isSantri = user?.role === 'santri';

  // Fetch public settings for branding
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/public/settings');
        if (response.data.success) {
          setSettings(response.data.data);
        }
      } catch (e) {
        console.error('Failed to fetch public settings', e);
      }
    };
    fetchSettings();
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, STORAGE_KEY]);

  // Save voice settings to localStorage
  useEffect(() => {
    localStorage.setItem('aiman_voice_settings', JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message on mount if empty
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeContent = isSantri
        ? `Assalamu'alaikum **${user?.name || 'Dek'}**! 👋\n\nSaya Aiman - AI Manager untuk Digitalisasi Pesantren. Aiman siap membantu kamu mengecek data pribadi kamu:\n\n• **Hafalan** - "Berapa hafalan saya?"\n• **Dompet** - "Cek saldo jajan saya"\n• **Review** - "Apa review mentor terakhir?"\n• **Portfolio** - "Tampilkan portofolio saya"\n\nApa yang bisa Aiman bantu hari ini? 😊`
        : isAuthenticated
          ? `Assalamu'alaikum **${user?.name || 'Ustadz/Ibu'}**! 👋\n\nSaya Aiman - AI Manager untuk Digitalisasi Pesantren. Aiman siap membantu Anda menjawab pertanyaan tentang:\n\n• **Pesantren** - Informasi program dan kegiatan\n• **Statistik** - Data santri dan alumni\n• **Akademik** - Progress belajar santri\n\nApa yang bisa Aiman bantu hari ini? 😊`
          : `Assalamu'alaikum! 👋\n\nSaya Aiman - AI Manager untuk Digitalisasi Pesantren. Aiman dapat membantu Anda dengan informasi umum tentang pesantren, santri, dan pendaftaran.\n\n• **Info Pesantren** - Program dan fasilitas\n• **Cari Santri** - "Siapa saja santri angkatan 7?"\n• **Karya Santri** - Portofolio dan prestasi\n• **PPDB** - Info pendaftaran santri baru\n\n**Login** untuk akses data pribadi yang lebih lengkap! 😊`;

      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [user, isAuthenticated, messages.length, settings]);
  
  // Text-to-Speech (TTS) Utility - Browser TTS with API fallback
  const speak = async (text: string) => {
    // 1. SET FLAGS IMMEDIATELY (Aggressive prevention)
    isAiSpeakingRef.current = true;
    setIsAiSpeaking(true);

    // 2. STOP RECOGNITION IMMEDIATELY
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    // Clean text: remove markdown AND emojis/special symbols
    const cleanText = text
      .replace(/[*_#]/g, '') // Remove markdown
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ''); // Remove Emojis

    console.log('🔊 TTS Provider:', voiceSettings.provider);

    // Try API TTS if provider is 'elevenlabs', 'gemini' or 'google'
    if (voiceSettings.provider === 'elevenlabs' || voiceSettings.provider === 'gemini' || voiceSettings.provider === 'google') {
      try {
        console.log('🔊 Attempting API TTS...');
        // Use public endpoint if not authenticated
        const ttsEndpoint = isAuthenticated ? '/ai/tts' : '/public/ai/tts';
        const responseData = await api.post(ttsEndpoint, { text: cleanText });
        
        if (responseData.success && responseData.audio) {
          console.log('✅ API TTS audio received');
          const audioBlob = new Blob(
            [Uint8Array.from(atob(responseData.audio), c => c.charCodeAt(0))],
            { type: responseData.mimeType || 'audio/wav' }
          );
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.onplay = () => {
            console.log('🔊 API audio playing...');
            isAiSpeakingRef.current = true;
            setIsAiSpeaking(true);
            if (recognitionRef.current) {
              try { recognitionRef.current.stop(); } catch(e) {}
            }
          };
          
          audio.onended = () => {
            console.log('🔊 API audio ended');
            URL.revokeObjectURL(audioUrl);
            handleSpeechEnd();
          };

          audio.onerror = (e) => {
            console.warn('⚠️ API audio playback error:', e);
            URL.revokeObjectURL(audioUrl);
            // No browser fallback - just end gracefully
            handleSpeechEnd();
          };
          
          try {
            await audio.play();
          } catch (playError: any) {
            if (playError.name === 'NotAllowedError') {
              console.warn('🔇 Autoplay blocked. Waiting for user interaction to play greeting...');
              const startInteraction = () => {
                audio.play().catch(e => console.error('Play failed even after interaction:', e));
                window.removeEventListener('click', startInteraction);
                window.removeEventListener('touchstart', startInteraction);
              };
              window.addEventListener('click', startInteraction);
              window.addEventListener('touchstart', startInteraction);
            } else {
              console.error('Playback failed:', playError);
              // No browser fallback - just end gracefully
              handleSpeechEnd();
            }
          }
          return;
        } else {
          console.warn('⚠️ API TTS response missing audio:', responseData);
          // No browser fallback - just end gracefully
          handleSpeechEnd();
        }
      } catch (error: any) {
        console.warn('⚠️ API TTS failed with exception:', error);
        // No browser fallback - just end gracefully
        handleSpeechEnd();
      }
    } else {
      // Provider is not ElevenLabs - no voice output
      console.warn('⚠️ Voice provider not set to elevenlabs, skipping TTS');
      handleSpeechEnd();
    }
  };

  // Browser TTS - Optimized for Indonesian Male Voice
  const speakWithBrowser = (cleanText: string) => {
    if (!('speechSynthesis' in window)) {
      handleSpeechEnd();
      return;
    }
    
    // Stop any current speech
    window.speechSynthesis.cancel();

    const startSpeaking = () => {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'id-ID';
      utterance.rate = 1.05;
      utterance.pitch = 0.8; // Lower pitch for male-like sound
      
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;
      
      // Log available Indonesian voices for debugging
      const idVoices = voices.filter(v => v.lang.includes('id'));
      console.log('🎤 Available Indonesian voices:', idVoices.map(v => `${v.name} (${v.lang})`));

      // 1. Ultra-specific Male Neural voices (usually the best quality)
      selectedVoice = voices.find(v => 
        v.lang.includes('id') && 
        (v.name.toLowerCase().includes('ardi') || 
         v.name.toLowerCase().includes('david') || 
         v.name.toLowerCase().includes('kevin')) &&
        (v.name.toLowerCase().includes('neural') || v.name.toLowerCase().includes('online'))
      );
      
      // 2. Any Indonesian voice with "male", "pria", "laki", "man" or known male names
      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          v.lang.includes('id') && 
          (v.name.toLowerCase().includes('male') || 
           v.name.toLowerCase().includes('pria') || 
           v.name.toLowerCase().includes('laki') ||
           v.name.toLowerCase().includes('man') ||
           v.name.toLowerCase().includes('ardi'))
        );
      }

      // 3. Fallback: Google Indonesian (usually male if not specified as female)
      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          v.name.includes('Google') && v.lang.includes('id') && 
          !v.name.toLowerCase().includes('female') &&
          !v.name.toLowerCase().includes('gadis') &&
          !v.name.toLowerCase().includes('wanita')
        );
      }
      
      // 4. Any Indonesian voice that does NOT contain female keywords
      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          v.lang.includes('id') && 
          !v.name.toLowerCase().includes('female') &&
          !v.name.toLowerCase().includes('gadis') &&
          !v.name.toLowerCase().includes('wanita') &&
          !v.name.toLowerCase().includes('damayanti') &&
          !v.name.toLowerCase().includes('dini')
        );
      }

      // Final fallback if still nothing
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.includes('id'));
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('✅ Selected browser voice (Fixed Male Priority):', selectedVoice.name);
      }

      utterance.onstart = () => {
        console.log('🔊 Browser TTS playing...');
        isAiSpeakingRef.current = true;
        setIsAiSpeaking(true);
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch(e) {}
        }
      };

      utterance.onend = () => {
        console.log('🔊 Browser TTS ended');
        handleSpeechEnd();
      };

      utterance.onerror = () => {
        console.warn('⚠️ Browser TTS error');
        handleSpeechEnd();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (speechError: any) {
        console.warn('⚠️ SpeechSynthesis failed:', speechError);
        handleSpeechEnd();
      }
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        startSpeaking();
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      startSpeaking();
    }
  };

  // Shared speech end handler
  const handleSpeechEnd = () => {
    console.log('🔊 handleSpeechEnd called');
    
    // Record the exact time speech ended
    lastSpeachEndRef.current = Date.now();
    
    // Very short buffer before resetting flags
    setTimeout(() => {
      console.log('🔊 Resetting speaking flags...');
      isAiSpeakingRef.current = false;
      setIsAiSpeaking(false);
      
      console.log('🔊 Checking conditions (latest):', {
        isVoiceResponseEnabled: isVoiceResponseEnabledRef.current,
        isTypingManually: isTypingManuallyRef.current,
        shouldStartListening: isVoiceResponseEnabledRef.current && !isTypingManuallyRef.current
      });
      
      // Only resume if still in voice mode and NOT manually typing
      if (isVoiceResponseEnabledRef.current && !isTypingManuallyRef.current) {
        console.log('🎤 Starting mic after short 500ms cooldown...');
        // Wait 500ms before opening mic
        setTimeout(() => {
          if (!isAiSpeakingRef.current && !isTypingManuallyRef.current) {
            console.log('🎤 Playing cue and starting recognition...');
            playCue();
            startRecognition('active');
          } else {
            console.log('🎤 Conditions changed, not starting mic');
          }
        }, 500); 
      } else {
        console.log('🔊 Not starting mic - voice mode disabled or typing manually');
      }
    }, 100);
  };

  const playCue = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // High pitch "A" note
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio cue failed', e);
    }
  };

  const handleSend = async (manualInput?: string) => {
    const textToSend = manualInput || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // If user typed manually (no voice input), disable voice response
    // Voice response should only be enabled when input comes from speech recognition
    if (manualInput) {
      // This is a voice input - voice response should already be enabled from handleVoiceAutoSend
      // Keep it enabled
    } else {
      // This is a keyboard/button input - disable voice response
      setIsVoiceResponseEnabled(false);
    }

    const history = messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      const endpoint = isAuthenticated ? '/ai/chat' : '/public/ai/chat';
      const response = await api.post(endpoint, {
        message: userMessage.content,
        history: history
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message || 'Maaf, tidak ada respons dari AI.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Auto-speak if voice mode is enabled
      if (isVoiceResponseEnabled) {
        speak(assistantMessage.content);
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Maaf, terjadi kesalahan: ${error.message || 'Tidak dapat terhubung ke server AI.'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  // Sync currentInputRef with input state
  useEffect(() => {
    currentInputRef.current = input;
  }, [input]);

  const handleAutoSend = () => {
    if (currentInputRef.current.trim() && !isLoading) {
      console.log('🤖 Auto-sending message due to silence...');
      setVoiceCountdown(null);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      
      // Visual feedback: simulate button click
      setIsAutoSending(true);
      setTimeout(() => setIsAutoSending(false), 200);

      // Enable voice response for this interaction
      setIsVoiceResponseEnabled(true);

      stopRecognition();
      handleSend(currentInputRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      // After sending via keyboard, restart wake mode after a delay
      setTimeout(() => {
        if (!isAiSpeakingRef.current) {
          startRecognition('wake');
        }
      }, 1000);
    } else {
      // If user typing, exit active listening but return to wake mode (Gemini Live style)
      if (isListening || isVoiceResponseEnabled) {
        stopRecognition();
        setIsVoiceResponseEnabled(false); // Disable TTS responses
        // Cancel any ongoing speech
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        // Return to wake mode after short delay (always listening for "Aiman")
        setTimeout(() => {
          if (!isAiSpeakingRef.current) {
            console.log('🎤 Returning to wake mode (always listening)...');
            startRecognition('wake');
          }
        }, 1000);
      }
      setIsTypingManually(true);
    }
  };

  const clearChat = () => {
    if (window.confirm('Hapus semua percakapan?')) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleLogout = () => {
    // Clear current chat history
    localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
    // Perform logout
    logout();
    // Reload page to switch to public mode
    window.location.reload();
  };

  const handleBack = () => {
    navigate('/');
  };

  // Auto-greet and listen on page load (Gemini Live style)
  useEffect(() => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }
    
    // Auto-speak greeting after 1.5 seconds (allow page to settle)
    const autoGreetTimer = setTimeout(() => {
      console.log('🎤 Auto-greeting and starting voice mode...');
      
      // Enable voice response mode
      setIsVoiceResponseEnabled(true);
      setIsTypingManually(false);
      
      // Speak greeting - handleSpeechEnd will auto-start listening after speech ends
      const sapaan = isSantri ? 'Dek' : (isAuthenticated ? 'Ustadz' : '');
      const greetingText = sapaan 
        ? `Assalamualaikum ${sapaan}! Ada yang bisa Aiman bantu?`
        : `Assalamualaikum! Ada yang bisa Aiman bantu?`;
      
      speak(greetingText);
    }, 1500);
    
    return () => {
      clearTimeout(autoGreetTimer);
      stopRecognition();
    };
  }, [isSantri, isAuthenticated]);

  const startRecognition = (mode: 'wake' | 'active') => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Maaf, browser Anda tidak mendukung pengenalan suara.');
      return;
    }

    if (isRecognitionActiveRef.current) {
      console.warn('🎤 Recognition already active, skipping start');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'id-ID';

    recognitionRef.current.onstart = () => {
      console.log(`🎤 Recognition started (${mode} mode)`);
      isRecognitionActiveRef.current = true;
      if (mode === 'wake') setIsWakeMode(true);
      else setIsListening(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      // ULTRA-AGGRESSIVE ANTI-ECHO GUARD
      const now = Date.now();
      const timeSinceLastSpeech = now - lastSpeachEndRef.current;
      
      // If AI is currently speaking OR we are in the 1s "Quiet Zone", discard everything
      if (isAiSpeakingRef.current || isAiSpeaking || timeSinceLastSpeech < 1000) {
        console.warn(`🚫 Echo Blocked: AI active or in cool-down (${timeSinceLastSpeech}ms since last, need 1000ms)`);
        if (recognitionRef.current) {
           try { recognitionRef.current.stop(); } catch(e) {}
        }
        return;
      }

      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentTranscript = (finalTranscript || interimTranscript).toLowerCase();

      // Detection & Transition Logic
      if (mode === 'wake' && currentTranscript.includes('aiman')) {
        stopRecognition(); // Stop wake mode
        setTimeout(() => {
          // DON'T start recognition here - let handleSpeechEnd do it after AIMAN finishes speaking
          
          // Enable voice response
          setIsVoiceResponseEnabled(true);
          
          // Greetings (Write & Speak) - mic will auto-start after speech ends
          const sapaan = isSantri ? 'Dek' : 'Ustadz';
          const greetingText = `Ya ${sapaan}? Ada yang bisa Aiman bantu? 😊`;
          const greeting: Message = {
            id: 'voice-msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            role: 'assistant',
            content: greetingText,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, greeting]);
          speak(greetingText);
        }, 100);
        return;
      }

      // Live Writing
      if (mode === 'active') {
        // Collect ALL results so far for this session
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript;
        }
        setInput(fullTranscript);

        // Auto-send on silence (3 seconds)
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        
        setVoiceCountdown(2); // Start from 2
        
        // Start decrementing countdown
        countdownIntervalRef.current = setInterval(() => {
          setVoiceCountdown(prev => (prev !== null && prev > 1) ? prev - 1 : prev);
        }, 1000);

        silenceTimeoutRef.current = setTimeout(() => {
          handleAutoSend();
        }, 3000);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      // Ignore 'aborted' and 'no-speech' if they are intentional or benign
      if (event.error === 'aborted' || event.error === 'no-speech') {
        console.log(`🎤 Suppressed benign recognition error: ${event.error}`);
        return;
      }
      
      console.error('Speech recognition error', event.error);
      stopRecognition();
    };

    recognitionRef.current.onend = () => {
      console.log('🎤 Recognition session ended');
      isRecognitionActiveRef.current = false;
      
      // Auto-restart if in wake mode
      if (mode === 'wake' && !isTypingManuallyRef.current && !isAiSpeakingRef.current) {
        try {
          // Short delay to prevent rapid-fire restarts
          setTimeout(() => {
            if (!isRecognitionActiveRef.current && !isAiSpeakingRef.current) {
               recognitionRef.current?.start();
            }
          }, 300);
        } catch (e) {
          setIsWakeMode(false);
        }
      } else {
        // If active mode ends (e.g. browser timeout), send what we have immediately
        if (currentInputRef.current.trim() && !isLoading) {
          handleAutoSend();
        }
        setIsListening(false);
        setIsWakeMode(false);
        setVoiceCountdown(null);
      }
    };

    recognitionRef.current.start();
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
    }
    isRecognitionActiveRef.current = false;
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setIsListening(false);
    setIsWakeMode(false);
    setVoiceCountdown(null);
  };

  const toggleMic = () => {
    if (isListening || isWakeMode) {
      stopRecognition();
    } else {
      // Manual mic button press resets typing mode
      setIsTypingManually(false);
      // Start with Wake Mode by default
      startRecognition('wake');
    }
  };

  useEffect(() => {
    inputRef.current?.focus();

    // Auto-start active listening if triggered by wake word from other pages
    if (searchParams.get('voice') === 'start' && !voiceTriggeredRef.current) {
      voiceTriggeredRef.current = true;
      // Clear parameter to avoid loop
      setSearchParams({}, { replace: true });
      
      // Delay slightly to allow page to settle and other processes to finish
      setTimeout(() => {
        // DON'T start recognition here - let handleSpeechEnd do it after AIMAN finishes speaking
        
        // Add Aiman's welcoming vocal response
        const sapaan = isSantri ? 'Dek' : 'Ustadz';
        const greetingText = `Ya ${sapaan}? Ada yang bisa Aiman bantu? 😊`;
        const greeting: Message = {
          id: 'voice-greeting-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          role: 'assistant',
          content: greetingText,
          timestamp: new Date(),
        };
        setMessages(prev => {
          // Double check to prevent duplicates
          if (prev.some(m => m.id.startsWith('voice-greeting'))) return prev;
          return [...prev, greeting];
        });
        
        // Enable voice response mode and Speak - mic will auto-start after speech ends
        setIsVoiceResponseEnabled(true);
        speak(greetingText);
      }, 800);
    }
  }, [searchParams]);

  const suggestedQuestions = isSantri
    ? [
        'Berapa total hafalan saya?',
        'Cek saldo dompet jajan saya',
        'Apa review mentor terbaru untuk saya?',
        'Tampilkan portofolio karya saya',
      ]
    : [
        'Bagaimana statistik hafalan santri?',
        'Berapa jumlah santri saat ini?',
        'Tampilkan karya santri terbaru',
        'Apa saja berita terbaru?',
      ];

  const handleSuggestedClick = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title={isAuthenticated ? "Kembali ke Dashboard" : "Kembali ke Beranda"}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg overflow-hidden">
            {isSantri && user?.photo ? (
              <img src={getStudentPhotoUrl(user.photo)} alt="Profil" className="w-full h-full object-cover" />
            ) : settings?.logo ? (
              <img src={settings.logo} alt="Logo" className="w-full h-full object-cover p-1.5" />
            ) : (
              <Bot className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h1 className="font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-none">
              {isSantri ? `Aiman - Asisten ${user?.name?.split(' ')[0]}` : 'AIMAN - Digitalisasi Pesantren'}
            </h1>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-gray-500">
                {isSantri ? 'Mode Santri - Akses Data Pribadi' : (isAuthenticated ? 'Mode Terautentikasi' : 'Mode Publik - Info Umum')}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isAuthenticated && (
            <Link
              to="/login"
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <LogIn className="w-3 h-3" />
              Login
            </Link>
          )}
          <button
            onClick={() => setIsVoiceSettingsOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            title="Voice Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={clearChat}
            className="p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
            title="Bersihkan Chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>


      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                  : 'bg-white shadow-sm border border-slate-100'
              }`}
            >
              <div className={`text-sm whitespace-pre-wrap ${message.role === 'assistant' ? 'text-gray-700' : ''}`}>
                {message.content.split('\n').map((line, i) => {
                  // Enhanced regex to detect markdown links, bold text, and raw URLs
                  const parts = line.split(/(\*\*.*?\*\*|!?\[.*?\]\(.*?\)|https?:\/\/[^\s]+)/g);
                  
                  return (
                    <span key={i}>
                      {parts.map((part, j) => {
                        if (!part) return null;

                        // 1. Handle Markdown Links and Images
                        const markdownLinkMatch = part.match(/(!?)\[(.*?)\]\((.*?)\)/);
                        if (markdownLinkMatch) {
                          const [_, isImage, altText, url] = markdownLinkMatch;
                          if (isImage) {
                            return (
                              <div key={j} className="my-2 group relative inline-block">
                                <img
                                  src={url}
                                  alt={altText}
                                  className="max-w-full sm:max-w-[300px] rounded-xl border-2 border-white shadow-md transition-transform hover:scale-[1.02] cursor-pointer"
                                  onClick={() => window.open(url, '_blank')}
                                  onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl pointer-events-none">
                                  <p className="text-[10px] text-white truncate">{altText}</p>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <a key={j} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-indigo-600 transition-colors font-semibold underline decoration-blue-200 underline-offset-4 hover:decoration-indigo-400">
                              {altText}
                            </a>
                          );
                        }

                        // 2. Handle Raw URLs (including automatic image detection)
                        if (part.startsWith('http')) {
                          const isImageUrl = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(part);
                          if (isImageUrl) {
                            return (
                              <div key={j} className="my-2 group relative inline-block">
                                <img
                                  src={part}
                                  alt="Preview"
                                  className="max-w-full sm:max-w-[300px] rounded-xl border-2 border-white shadow-md transition-transform hover:scale-[1.02] cursor-pointer"
                                  onClick={() => window.open(part, '_blank')}
                                  onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                              </div>
                            );
                          }
                          return (
                            <a key={j} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-indigo-600 transition-colors font-semibold underline decoration-blue-200 underline-offset-4 hover:decoration-indigo-400">
                              {part}
                            </a>
                          );
                        }

                        // 3. Handle Bold Text (and nested links inside bold)
                        if (part.startsWith('**') && part.endsWith('**')) {
                          const innerContent = part.slice(2, -2);
                          const innerLinkMatch = innerContent.match(/\[(.*?)\]\((.*?)\)/);
                          if (innerLinkMatch) {
                            const [fullMatch, linkText, linkUrl] = innerLinkMatch;
                            const linkStartIndex = innerContent.indexOf(fullMatch);
                            const beforeLink = innerContent.substring(0, linkStartIndex);
                            const afterLink = innerContent.substring(linkStartIndex + fullMatch.length);
                            return (
                              <strong key={j}>
                                {beforeLink}
                                <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-indigo-600 transition-colors font-semibold underline decoration-blue-200 underline-offset-4 hover:decoration-indigo-400">
                                  {linkText}
                                </a>
                                {afterLink}
                              </strong>
                            );
                          }
                          return <strong key={j}>{innerContent}</strong>;
                        }

                        // 4. Default Text
                        return part;
                      })}
                      {i < message.content.split('\n').length - 1 && <br />}
                    </span>
                  );
                })}
              </div>
              <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user?.photo ? (
                  <img src={getStudentPhotoUrl(user.photo)} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white shadow-sm border border-slate-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Sedang berpikir...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">Coba tanyakan:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedClick(question)}
                className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-white/80 backdrop-blur-lg border-t border-slate-200 relative">
        {/* Voice Transcript Floating Bubble - Minimalist & Transparent */}
        {(isListening || isAiSpeaking) && !isTypingManually && (
          <div className="absolute bottom-[calc(100%+2rem)] left-0 right-0 z-50 pointer-events-none flex justify-center px-6">
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
              
              {/* Floating Status & Spectrum */}
              <div className="flex items-center gap-3 mb-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-xl">
                {isAiSpeaking ? (
                  <Volume2 className="w-4 h-4 text-orange-400 animate-pulse" />
                ) : (
                  <div className="flex items-center gap-1 h-3">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-0.5 bg-blue-400 rounded-full animate-bounce" 
                        style={{ 
                          height: '100%',
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '0.8s'
                        }}
                      ></div>
                    ))}
                  </div>
                )}
                <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isAiSpeaking ? 'text-orange-400' : 'text-blue-400'}`}>
                  {isAiSpeaking ? 'Aiman Berbicara' : (voiceCountdown ? `Auto-send: ${voiceCountdown}s` : 'Menyimak...')}
                </span>
              </div>

              {/* Large Floating Text */}
              <div className="max-w-md text-center">
                <p className="text-2xl md:text-3xl font-bold text-slate-800 drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)] leading-tight tracking-tight">
                  {isAiSpeaking ? (
                    <span className="opacity-50 italic font-medium text-xl">Aiman sedang menjawab...</span>
                  ) : (
                    input || <span className="text-slate-400/50 italic font-medium">Bicara sekarang...</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (!isTypingManually) setIsTypingManually(true);
                if (isListening || isWakeMode) stopRecognition();
              }}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Mendengarkan... silakan bicara" : (isWakeMode ? "Sebutkan 'Aiman' untuk memulai..." : "Ketik pertanyaan Anda...")}
              rows={1}
              className={`w-full px-4 py-3 pr-12 rounded-xl border focus:ring-2 outline-none resize-none transition-all text-gray-700 placeholder-gray-400 ${
                isListening 
                ? 'border-blue-400 ring-2 ring-blue-100 bg-blue-50/50' 
                : (isWakeMode ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100')
              }`}
              style={{ maxHeight: '120px' }}
              disabled={isLoading}
            />
            {isListening && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
              </div>
            )}
          </div>
          {isAuthenticated && (
            <button
              onClick={toggleMic}
              className={`p-3 rounded-xl transition-all shadow-md hover:shadow-lg ${
                isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : (isWakeMode ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-gray-500 hover:bg-slate-200')
              }`}
              title={isListening ? "Berhenti Mendengarkan" : (isWakeMode ? "Matikan Mic" : "Aktifkan Mic (Wake Word: Aiman)")}
            >
              {isAiSpeaking ? (
                <Volume2 className="w-5 h-5 animate-pulse text-white" />
              ) : isListening ? (
                <MicOff className="w-5 h-5" />
              ) : isWakeMode ? (
                <Volume2 className="w-5 h-5 animate-pulse" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          )}
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl ${
              isAutoSending ? 'scale-90 opacity-70 shadow-inner' : 'hover:scale-105 active:scale-95'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1 text-center">
          <MessageCircle className="w-3 h-3 inline mr-1" />
          AI dapat membuat kesalahan. Verifikasi informasi penting.
        </p>
      </div>
      {/* Voice Settings Modal */}
      {isVoiceSettingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsVoiceSettingsOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800">Pengaturan Suara Aiman</h3>
              </div>
              <button onClick={() => setIsVoiceSettingsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Voice Provider Toggle */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pilih Provider Suara</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setVoiceSettings({ ...voiceSettings, provider: 'gemini' })}
                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                      voiceSettings.provider === 'gemini' 
                      ? 'border-purple-600 bg-purple-50/50' 
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                    }`}
                  >
                    <div className={`p-3 rounded-xl mb-2 ${voiceSettings.provider === 'gemini' ? 'bg-purple-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <p className={`text-sm font-bold ${voiceSettings.provider === 'gemini' ? 'text-purple-900' : 'text-slate-700'}`}>Gemini AI</p>
                    <p className="text-[10px] text-slate-400">Premium Neural Voice</p>
                  </button>
                  <button
                    onClick={() => setVoiceSettings({ ...voiceSettings, provider: 'browser' })}
                    className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                      voiceSettings.provider === 'browser' 
                      ? 'border-indigo-600 bg-indigo-50/50' 
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                    }`}
                  >
                    <div className={`p-3 rounded-xl mb-2 ${voiceSettings.provider === 'browser' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <p className={`text-sm font-bold ${voiceSettings.provider === 'browser' ? 'text-indigo-900' : 'text-slate-700'}`}>Browser</p>
                    <p className="text-[10px] text-slate-400">Native System Voice</p>
                  </button>
                </div>
              </div>

              {/* Browser Voice Selection (only shown when browser is selected) */}
              {voiceSettings.provider === 'browser' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pilih Suara Browser</label>
                <div className="grid grid-cols-1 gap-2">
                  {window.speechSynthesis.getVoices()
                    .filter(v => v.lang.includes('id-ID'))
                    .map((voice, idx) => (
                    <button
                      key={idx}
                      onClick={() => setVoiceSettings({ ...voiceSettings, voiceId: voice.name })}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        voiceSettings.voiceId === voice.name 
                        ? 'border-indigo-600 bg-indigo-50/50' 
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className={`p-2 rounded-xl ${voiceSettings.voiceId === voice.name ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                          <Volume2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${voiceSettings.voiceId === voice.name ? 'text-indigo-900' : 'text-slate-700'}`}>
                            {voice.name.replace('Microsoft ', '').replace('Google ', '').replace('Indonesian Indonesia', 'Bahasa Indonesia')}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">Native Browser Voice</p>
                        </div>
                      </div>
                      {voiceSettings.voiceId === voice.name && <Check className="w-5 h-5 text-indigo-600" />}
                    </button>
                  ))}
                  
                  {window.speechSynthesis.getVoices().filter(v => v.lang.includes('id-ID')).length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <Volume2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Tidak ada suara sistem yang terdeteksi.</p>
                    </div>
                  )}
                </div>
              </div>
              )}

              {/* Premium Option Info */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-indigo-900 mb-1">Butuh suara lebih nyata?</p>
                    <p className="text-xs text-indigo-700/70 leading-relaxed">
                      ElevenLabs menyediakan suara AI paling manusiawi di dunia. Hubungkan akun Anda untuk kualitas terbaik.
                    </p>
                    <a 
                      href="https://elevenlabs.io" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer pointer-events-auto"
                    >
                      Pelajari ElevenLabs <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsVoiceSettingsOpen(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiChatPage;
