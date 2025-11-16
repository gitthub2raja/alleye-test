import React, { useState, useEffect, useRef } from 'react';
import { Profile as User, Content } from '../../../types';
import { 
    sendLaunchedStatement, 
    sendResumedStatement,
    sendPausedStatement,
    sendAnsweredStatement
} from '../../../lib/xapi';

const GlitchTitle = ({ text }: { text: string }) => (
    <h2 className="text-4xl font-orbitron text-primary-green" data-text={text}>{text}</h2>
);

const Countdown = ({ onComplete }: { onComplete: () => void }) => {
    const [count, setCount] = useState(3);
    const countdownAudioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        countdownAudioRef.current = new Audio('https://ryzfriykqluohxvulezu.supabase.co/storage/v1/object/sign/sounds/Count%20Down%201.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNzkxNDFjNy1hZTc1LTQ2ZmQtYmZjOS1iNGE2OGNhZDExNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb3VuZHMvQ291bnQgRG93biAxLm1wMyIsImlhdCI6MTc1ODYyMDEzNywiZXhwIjoxNzkwMTU2MTM3fQ.W4hNo-vv_d3dfURtiCqlBC5oYMYkp5wn_sPkCxdRJTY');
        countdownAudioRef.current.volume = 0.7;
    }, []);

    useEffect(() => {
        if (count > 0) {
            countdownAudioRef.current?.play().catch(e => console.error("Audio play failed:", e));
            const timer = setTimeout(() => setCount(count - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            onComplete();
        }
    }, [count, onComplete]);

    const getCountdownColor = () => {
        if (count <= 1) return 'border-red-500 text-red-500 shadow-red-500/50';
        if (count <= 2) return 'border-yellow-500 text-yellow-500 shadow-yellow-500/50';
        return 'border-primary-green text-primary-green shadow-primary-green/50';
    };

    return (
        <div className="fixed inset-0 bg-background-dark/95 flex flex-col justify-center items-center z-50 animate-fadeIn">
            <div className="text-center">
                <p className="font-orbitron text-primary-green text-2xl mb-4" data-text="Your assessment starts in">Your assessment starts in</p>
                <div className={`font-tech-mono text-7xl p-4 border-2 rounded-lg shadow-lg animate-pulseCountdown ${getCountdownColor()}`}>{count}</div>
            </div>
        </div>
    );
};

const Quiz = ({ onComplete, questions, user, content }: { onComplete: (answers: any) => void, questions: any[], user: User, content: Content }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
    const [timeLeft, setTimeLeft] = useState(20);

    const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
    const buttonClickAudioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        backgroundAudioRef.current = new Audio('https://ryzfriykqluohxvulezu.supabase.co/storage/v1/object/sign/sounds/bgm.mp3?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNzkxNDFjNy1hZTc1LTQ2ZmQtYmZjOS1iNGE2OGNhZDExNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb3VuZHMvYmdtLm1wMyIsImlhdCI6MTc1ODYxOTU2MiwiZXhwIjoxNzkwMTU1NTYyfQ.BQciqDvQYpBsSij1I9CpOYzMks01nhHr-chjnLXdXQI');
        backgroundAudioRef.current.loop = true;
        backgroundAudioRef.current.volume = 0.5;
        backgroundAudioRef.current.play().catch(e => console.error("BGM play failed:", e));

        buttonClickAudioRef.current = new Audio('https://ryzfriykqluohxvulezu.supabase.co/storage/v1/object/sign/sounds/Pop%20Move%20Open.wav?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNzkxNDFjNy1hZTc1LTQ2ZmQtYmZjOS1iNGE2OGNhZDExNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb3VuZHMvUG9wIE1vdmUgT3Blbi53YXYiLCJpYXQiOjE3NTg2MTk2NjcsImV4cCI6MTc5MDE1NTY2N30.9gHhSqLBty5IiWrN9sS_ZhIdrFDQB6ICt4Eau75Qumg');
        buttonClickAudioRef.current.volume = 0.6;
        
        return () => {
            backgroundAudioRef.current?.pause();
            if(timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startTimer = () => {
        if(timerRef.current) clearInterval(timerRef.current);
        setTimeLeft(20);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        startTimer();
    }, [currentQuestionIndex]);

    const handleTimeUp = () => {
        if(timerRef.current) clearInterval(timerRef.current);
        if (currentQuestionIndex === questions.length - 1) {
            handleSubmit();
        } else {
            goToNextQuestion();
        }
    };
    
    const playClickSound = () => {
        buttonClickAudioRef.current?.play().catch(e => console.error("Click sound failed:", e));
    };

    const handleAnswerSelect = (option: string) => {
        playClickSound();
        const currentQuestion = questions[currentQuestionIndex];
        const correctAnswerIndex = parseInt(String(currentQuestion.correctAnswer), 10);
        const isCorrect = !isNaN(correctAnswerIndex) && option === currentQuestion.options[correctAnswerIndex];
        sendAnsweredStatement(user, content, currentQuestion, option, isCorrect);
        setUserAnswers({ ...userAnswers, [currentQuestionIndex]: option });
    };

    const goToNextQuestion = () => {
        playClickSound();
        setCurrentQuestionIndex(prev => prev + 1);
    };
    
    const handleSubmit = () => {
        playClickSound();
        if(timerRef.current) clearInterval(timerRef.current);
        backgroundAudioRef.current?.pause();
        onComplete(userAnswers);
    };

    const currentQuestion = questions[currentQuestionIndex];
    const getTimerColor = () => {
        if (timeLeft <= 5) return 'border-red-500 text-red-500 shadow-red-500/50 animate-pulseDanger';
        if (timeLeft <= 10) return 'border-yellow-500 text-yellow-500 shadow-yellow-500/50 animate-pulseWarning';
        return 'border-primary-green text-primary-green shadow-primary-green/50 animate-pulseTimer';
    };

    return (
        <div className="w-full animate-fadeIn">
            <GlitchTitle text="SECURITY ASSESSMENT" />
            <div className="absolute top-5 right-5 flex items-center gap-3">
                <span className="font-orbitron text-cyber-blue uppercase">Time Remaining:</span>
                <div className={`font-tech-mono text-2xl p-2 border-2 rounded-lg shadow-lg transition-all duration-300 ${getTimerColor()}`}>{timeLeft}</div>
            </div>
            <div className="mt-8 text-left">
                <div className="bg-background-dark border border-cyber-blue p-6 rounded-lg shadow-lg shadow-cyber-blue/30 animate-slideIn">
                    <h3 className="font-orbitron text-primary-green text-xl mb-4">{currentQuestionIndex + 1}. {currentQuestion.question}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option: string, index: number) => {
                            const isSelected = userAnswers[currentQuestionIndex] === option;
                            return (
                                <button key={index} onClick={() => handleAnswerSelect(option)} className={`option-button font-tech-mono text-left p-3 border rounded-md transition-all duration-200 hover:bg-cyber-blue/20 hover:border-primary-green hover:-translate-y-1 hover:shadow-lg hover:shadow-cyber-blue/50 ${isSelected ? 'bg-primary-green/30 border-primary-green shadow-lg shadow-primary-green/40' : 'bg-background-light border-cyber-blue'}`}>
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="mt-8 flex justify-end">
                {currentQuestionIndex < questions.length - 1 ? <button onClick={goToNextQuestion} className="nav-button">Next</button> : <button onClick={handleSubmit} className="nav-button">Submit Assessment</button>}
            </div>
        </div>
    );
};

const Results = ({ userAnswers, onRetake, questions }: { userAnswers: any, onRetake: () => void, questions: any[] }) => {
    const playClickSound = () => {
        const audio = new Audio('https://ryzfriykqluohxvulezu.supabase.co/storage/v1/object/sign/sounds/Pop%20Move%20Open.wav?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jNzkxNDFjNy1hZTc1LTQ2ZmQtYmZjOS1iNGE2OGNhZDExNTgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJzb3VuZHMvUG9wIE1vdmUgT3Blbi53YXYiLCJpYXQiOjE3NTg2MTk2NjcsImV4cCI6MTc5MDE1NTY2N30.9gHhSqLBty5IiWrN9sS_ZhIdrFDQB6ICt4Eau75Qumg');
        audio.volume = 0.6;
        audio.play().catch(e => console.error("Click sound failed:", e));
    };
    
    const handleRetake = () => { playClickSound(); onRetake(); }
    
    let score = 0;
    questions.forEach((q, index) => {
        const correctAnswerIndex = parseInt(String(q.correctAnswer), 10);
        if (!isNaN(correctAnswerIndex) && userAnswers[index] === q.options[correctAnswerIndex]) {
            score++;
        }
    });

    return (
        <div className="w-full animate-fadeIn">
            <GlitchTitle text="ASSESSMENT REPORT" />
            <p className="font-orbitron text-5xl text-primary-green my-6" style={{ textShadow: '0 0 10px #00ff00' }}>{score} / {questions.length}</p>
            <div className="text-left max-h-[40vh] overflow-y-auto pr-4 border-t-2 border-dashed border-primary-green pt-6 custom-scrollbar">
                {questions.map((q, index) => {
                    const userAnswer = userAnswers[index] || "Time's up - No answer";
                    const correctAnswerIndex = parseInt(String(q.correctAnswer), 10);
                    const correctAnswerText = !isNaN(correctAnswerIndex) && q.options[correctAnswerIndex]
                        ? q.options[correctAnswerIndex]
                        : 'Invalid correct answer';
                    const isCorrect = userAnswer === correctAnswerText;
                    return (
                        <div key={index} className="mb-6 pb-4 border-b border-cyber-blue/20">
                            <p className="font-bold text-lg mb-2">{index + 1}. {q.question}</p>
                            <p className="text-primary-green">Correct Answer: {correctAnswerText}</p>
                            <p className={`${isCorrect ? 'text-cyber-blue' : 'text-red-500'}`}>Your Answer: {userAnswer}</p>
                            {!isCorrect && <p className="text-red-400 italic mt-1">Incorrect. Review your knowledge.</p>}
                        </div>
                    );
                })}
            </div>
            <button onClick={handleRetake} className="nav-button mt-8 mx-auto block">Retake Assessment</button>
        </div>
    );
};

const CyberSecurityTrainingPlayer = ({ videoUrl, quizData, onComplete, onRetake: onRetakeProp, user, content }: {videoUrl?: string, quizData: any[], onComplete: (score: number) => void, onRetake: () => void, user: User, content: Content}) => {
    const [gameState, setGameState] = useState('video');
    const [userAnswers, setUserAnswers] = useState({});
    const videoRef = useRef<HTMLVideoElement>(null);

    // --- NEW STATE AND REFS FOR CUSTOM VIDEO CONTROLS ---
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastPausedTimeRef = useRef<number>(0);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);


    const handleVideoEnd = () => setGameState('countdown');
    const handleCountdownComplete = () => setGameState('quiz');
    const handleQuizComplete = (answers: any) => {
        setUserAnswers(answers);
        setGameState('results');
        let score = 0;
        quizData.forEach((q, index) => {
            const correctAnswerIndex = parseInt(String(q.correctAnswer), 10);
            if (!isNaN(correctAnswerIndex) && answers[index] === q.options[correctAnswerIndex]) {
                 score++;
            }
        });
        const finalScore = quizData.length > 0 ? Math.round((score / quizData.length) * 100) : 0;
        onComplete(finalScore);
    };
    const handleRetake = () => {
        onRetakeProp();
        sendLaunchedStatement(user, content);
        setUserAnswers({});
        setGameState('video');
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
        }
    };
    
    useEffect(() => {
        if (gameState === 'video' && videoRef.current) {
            videoRef.current.play().catch(e => console.warn("Autoplay prevented."));
        }

        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);

        const keysPressed: { [key: string]: boolean } = {};
        const handleKeyDown = (event: KeyboardEvent) => {
            keysPressed[event.key.toLowerCase()] = true;
            if (gameState === 'video' && videoRef.current) {
                if (keysPressed['2'] && (keysPressed['x'] || keysPressed['X'])) {
                    videoRef.current.playbackRate = 2;
                } else if (keysPressed['4'] && (keysPressed['x'] || keysPressed['X'])) {
                    videoRef.current.playbackRate = 4;
                }
            }
        };
        const handleKeyUp = (event: KeyboardEvent) => {
            delete keysPressed[event.key.toLowerCase()];
            if (gameState === 'video' && videoRef.current) {
                const is2x = keysPressed['2'] && (keysPressed['x'] || keysPressed['X']);
                const is4x = keysPressed['4'] && (keysPressed['x'] || keysPressed['X']);
                if (!is2x && !is4x) {
                    videoRef.current.playbackRate = 1;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        return () => {
             if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (videoRef.current) {
                videoRef.current.playbackRate = 1;
            }
        }
    }, [gameState]);

    // --- NEW HANDLERS AND HELPERS FOR CUSTOM VIDEO CONTROLS ---

    const handleVideoPlay = () => {
        setIsPlaying(true);
        if (lastPausedTimeRef.current > 0) {
            sendResumedStatement(user, content, videoRef.current?.currentTime || 0);
            lastPausedTimeRef.current = 0;
        }
    };

    const handleVideoPause = () => {
        setIsPlaying(false);
        const video = videoRef.current;
        if (video && !video.ended && video.duration > 0) {
            lastPausedTimeRef.current = video.currentTime;
            sendPausedStatement(user, content, video.currentTime);
        }
    };
    
    const togglePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const durationVal = videoRef.current.duration;
            setCurrentTime(current);
            setDuration(durationVal);
            if (durationVal > 0) {
                setProgress((current / durationVal) * 100);
            }
        }
    };
    
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };
    
    const formatTime = (time: number) => {
        if (isNaN(time) || time < 0) return '00:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    };

    const handleFullscreen = () => {
        const elem = videoContainerRef.current;
        if (!elem) return;

        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M8 5v14l11-7z" />
        </svg>
    );

    const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
    );

    const FullscreenIcon = (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
    );

    const ExitFullscreenIcon = (props: React.SVGProps<SVGSVGElement>) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
        </svg>
    );

    const renderGameState = () => {
        switch (gameState) {
            case 'video':
                return (
                    <div ref={videoContainerRef} className="relative w-full max-w-4xl h-full flex items-center justify-center group" onMouseMove={handleMouseMove}>
                        <video 
                            key={videoUrl} 
                            ref={videoRef} 
                            src={videoUrl} 
                            onEnded={handleVideoEnd} 
                            onPlay={handleVideoPlay} 
                            onPause={handleVideoPause}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onClick={togglePlayPause}
                            autoPlay 
                            className="w-full h-full object-contain cursor-pointer"
                            onContextMenu={(e) => e.preventDefault()} 
                            controlsList="nodownload noremoteplayback"
                        />
                        {/* Custom Controls Overlay */}
                        <div 
                            className={`absolute bottom-0 left-0 right-0 p-3 flex items-center gap-4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}
                        >
                            {/* Play/Pause Button */}
                            <button onClick={togglePlayPause} className="text-white pointer-events-auto p-1 flex-shrink-0 hover:scale-110 transition-transform">
                                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                            </button>
                            
                            {/* Progress Bar */}
                            <div className="flex-grow h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary-green rounded-full" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            
                            {/* Countdown Timer */}
                            <div className="text-white text-sm font-tech-mono w-16 text-center flex-shrink-0">
                                -{formatTime(duration - currentTime)}
                            </div>

                             {/* Fullscreen Button */}
                            <button onClick={handleFullscreen} className="text-white pointer-events-auto p-1 flex-shrink-0 hover:scale-110 transition-transform">
                                {isFullscreen ? <ExitFullscreenIcon className="w-6 h-6" /> : <FullscreenIcon className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                );
            case 'countdown':
                return <Countdown onComplete={handleCountdownComplete} />;
            case 'quiz':
                return <Quiz onComplete={handleQuizComplete} questions={quizData} user={user} content={content} />;
            case 'results':
                return <Results userAnswers={userAnswers} onRetake={handleRetake} questions={quizData} />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full h-full text-center flex items-center justify-center bg-background-light p-6 md:p-8 relative">
           <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Share+Tech+Mono&display=swap');
                .font-orbitron { font-family: 'Orbitron', sans-serif; }
                .font-tech-mono { font-family: 'Share Tech Mono', monospace; }
                .text-primary-green { color: #00ff00; }
                .border-primary-green { border-color: #00ff00; }
                .bg-primary-green { background-color: #00ff00; }
                .shadow-primary-green\\/50 { box-shadow: 0 0 15px rgba(0, 255, 0, 0.4); }
                .text-cyber-blue { color: #00aaff; }
                .border-cyber-blue { border-color: #00aaff; }
                .shadow-cyber-blue\\/30 { box-shadow: 0 0 10px rgba(0, 170, 255, 0.3); }
                .shadow-cyber-blue\\/50 { box-shadow: 0 0 10px rgba(0, 170, 255, 0.5); }
                .bg-background-dark { background-color: #1a1a2e; }
                .bg-background-light { background-color: #16213e; }
                .nav-button { background-color: #00aaff; color: #1a1a2e; border: none; padding: 12px 25px; border-radius: 5px; cursor: pointer; font-family: 'Orbitron', sans-serif; font-size: 1em; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 0 10px rgba(0, 170, 255, 0.5); transition: all 0.3s ease; }
                .nav-button:hover { background-color: #00ff00; box-shadow: 0 0 15px #00ff00; transform: translateY(-2px) scale(1.02); }
                .option-button { position: relative; overflow: hidden; }
                .option-button::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent); transition: 0.5s; }
                .option-button:hover::before { left: 100%; }
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1a1a2e; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #00ff00; border-radius: 4px; box-shadow: 0 0 5px rgba(0, 255, 0, 0.7); }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #00aaff; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } .animate-fadeIn { animation: fadeIn 0.7s ease-out; }
                @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-slideIn { animation: slideIn 0.5s ease-out forwards; }
                @keyframes pulseTimer { 50% { box-shadow: 0 0 25px rgba(0, 255, 0, 0.6), 0 0 35px rgba(0, 255, 0, 0.2); } } .animate-pulseTimer { animation: pulseTimer 2s infinite; }
                @keyframes pulseCountdown { 50% { transform: scale(1.05); } } .animate-pulseCountdown { animation: pulseCountdown 1s infinite; }
                @keyframes pulseWarning { 50% { box-shadow: 0 0 25px rgba(255, 170, 0, 0.8); } } .animate-pulseWarning { animation: pulseWarning 1s infinite; }
                @keyframes pulseDanger { 50% { box-shadow: 0 0 25px rgba(255, 0, 0, 0.8); } } .animate-pulseDanger { animation: pulseDanger 0.5s infinite; }
            `}</style>
            {renderGameState()}
        </div>
    );
};

export default CyberSecurityTrainingPlayer;