import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Content, ContentType, Profile as User } from '../../../types';
import { 
    sendLaunchedStatement, 
    sendCompletedStatement,
    sendPausedStatement,
    sendResumedStatement,
    sendExitedStatement
} from '../../../lib/xapi';
import Modal from '../../../components/common/Modal';
import QuizRunner from './QuizRunner';
import CyberSecurityTrainingPlayer from './CyberSecurityTrainingPlayer';

interface ContentPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: Content | null;
    user: User;
    onProgressUpdate: (contentId: number, score?: number) => void;
}

const ContentPlayerModal: React.FC<ContentPlayerModalProps> = ({ isOpen, onClose, content, user, onProgressUpdate }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const sessionStartTimeRef = useRef<number>(0);
    const lastPausedTimeRef = useRef<number>(0);

    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (isOpen && content) {
            sendLaunchedStatement(user, content);
            sessionStartTimeRef.current = Date.now();
            supabase.from('analytics').insert({ user_id: user.id, content_id: content.id, event_type: 'start', details: {} }).then();
        }

        const handleVisibilityChange = () => {
            if (document.hidden && content && sessionStartTimeRef.current) {
                const duration = `PT${Math.round((Date.now() - sessionStartTimeRef.current) / 1000)}S`;
                sendExitedStatement(user, content, duration);
                sessionStartTimeRef.current = 0; // Reset
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (content && sessionStartTimeRef.current) {
                const duration = `PT${Math.round((Date.now() - sessionStartTimeRef.current) / 1000)}S`;
                sendExitedStatement(user, content, duration);
                sessionStartTimeRef.current = 0;
            }
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        };
    }, [isOpen, content, user]);

    const handleVideoPlay = () => {
        setIsPlaying(true);
        if (content && lastPausedTimeRef.current > 0) {
            sendResumedStatement(user, content, videoRef.current?.currentTime || 0);
            lastPausedTimeRef.current = 0;
        }
    };

    const handleVideoPause = () => {
        setIsPlaying(false);
        const video = videoRef.current;
        if (content && video && !video.ended && video.duration > 0) {
            lastPausedTimeRef.current = video.currentTime;
            sendPausedStatement(user, content, video.currentTime);
        }
    };

    const handleQuizComplete = (score: number) => {
        if (content) {
            onProgressUpdate(content.id, score);
            sendCompletedStatement(user, content, { score: { scaled: score / 100, raw: score, min: 0, max: 100 }});
            supabase.from('analytics').insert({ user_id: user.id, content_id: content.id, event_type: 'quiz_attempt', details: { score } }).then();
        }
    };

    const handleVideoComplete = () => {
        if(content && (content.type === ContentType.VIDEO)) {
             onProgressUpdate(content.id);
             sendCompletedStatement(user, content, { duration: `PT${Math.round(videoRef.current?.duration || 0)}S` });
             supabase.from('analytics').insert({ user_id: user.id, content_id: content.id, event_type: 'complete', details: { watchTime: videoRef.current?.duration } }).then();
        }
    }
    
    const handleCyberTrainingComplete = (score: number) => {
        if (content) {
            onProgressUpdate(content.id, score);
            const videoDuration = videoRef.current?.duration || 0;
            sendCompletedStatement(user, content, { score: { scaled: score / 100, raw: score }, duration: `PT${Math.round(videoDuration)}S` });
            supabase.from('analytics').insert({ user_id: user.id, content_id: content.id, event_type: 'complete', details: { score, watchTime: videoDuration } }).then();
            supabase.from('cyber_training_analytics').insert({
                user_id: user.id,
                user_name: user.name,
                user_company: user.company || 'N/A',
                content_id: content.id,
                score: score,
                video_watch_time: videoDuration,
                attempt: 1
            }).then();
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
    

    if (!isOpen || !content) {
        return null;
    }

    const renderContent = () => {
        const key = `${content.id}-${content.type}`;
        
        switch (content.type) {
            case ContentType.CYBER_SECURITY_TRAINING:
                const quizData = typeof content.quiz_data === 'string' && content.quiz_data ? JSON.parse(content.quiz_data) : [];
                return <CyberSecurityTrainingPlayer key={key} videoUrl={content.content_url} quizData={quizData} onComplete={handleCyberTrainingComplete} onRetake={() => { /* re-send launch statement? */ }} user={user} content={content} />;
            
            case ContentType.VIDEO:
            case ContentType.VIDEO_QUIZ:
                 return (
                    <div className="flex flex-col lg:flex-row h-full">
                        <div className="relative flex-1 bg-black flex items-center justify-center group" onMouseMove={handleMouseMove}>
                            <video 
                                key={content.content_url} 
                                ref={videoRef} 
                                src={content.content_url} 
                                onEnded={handleVideoComplete} 
                                onPlay={handleVideoPlay} 
                                onPause={handleVideoPause}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onClick={togglePlayPause}
                                autoPlay 
                                className="w-full h-full object-contain cursor-pointer" 
                            />
                            {/* Custom Controls Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                                {/* Progress Bar */}
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/20">
                                    <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }}></div>
                                </div>

                                {/* Main Controls */}
                                <div className="absolute inset-0 flex items-center justify-between px-10">
                                    {/* Play/Pause Button */}
                                    <button onClick={togglePlayPause} className="text-white bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors pointer-events-auto">
                                        {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
                                    </button>
                                    
                                    {/* Countdown Timer */}
                                    <div className="text-white text-lg font-mono bg-black/50 px-3 py-1 rounded">
                                        -{formatTime(duration - currentTime)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {content.type === ContentType.VIDEO_QUIZ && (
                            <div className="w-full lg:w-96 lg:flex-shrink-0">
                                <QuizRunner questions={content.questions || []} onComplete={handleQuizComplete} user={user} content={content}/>
                            </div>
                        )}
                    </div>
                );
            
            case ContentType.PDF:
            case ContentType.HTML5:
            case ContentType.SCORM:
            case ContentType.REACT_SANDBOX:
                return ( <iframe key={content.embed_url} src={content.embed_url} title={content.title} className="w-full h-full border-none" sandbox="allow-scripts allow-same-origin" /> );
            
            case ContentType.HTML:
                return ( <div className="p-6 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content.html_content || '' }} /> );
            
            case ContentType.QUIZ:
                 return <QuizRunner questions={content.questions || []} onComplete={handleQuizComplete} user={user} content={content}/>;
            
            default:
                return <div className="p-8 text-center"><p>Content type not supported yet.</p></div>;
        }
    };
    
    const isCyberTraining = content.type === ContentType.CYBER_SECURITY_TRAINING;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={content.title} size={isCyberTraining ? "2xl" : "xl"} disableContentPadding >
            <div className={`aspect-video w-full ${isCyberTraining ? 'bg-background-dark' : 'bg-sidebar'}`}>
                {renderContent()}
            </div>
        </Modal>
    );
};

export default ContentPlayerModal;
