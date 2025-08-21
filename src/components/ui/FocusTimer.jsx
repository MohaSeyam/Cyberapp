import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { useSimpleLocalization } from '../../context/SimpleLocalizationContext';

const FocusTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);
  
  // Safe access to useSimpleLocalization
  let localizationData;
  try {
    localizationData = useSimpleLocalization();
  } catch (error) {
    console.error('Error accessing useSimpleLocalization:', error);
    localizationData = {
      language: 'ar',
      direction: 'rtl',
      isRTL: true,
      toggleLanguage: () => {}
    };
  }
  const { language } = localizationData;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished
            clearInterval(intervalRef.current);
            setIsRunning(false);
            
            if (!isBreak) {
              // Work session finished, start break
              setTimeLeft(5 * 60); // 5 minute break
              setIsBreak(true);
              setSessions(prev => prev + 1);
              // Play notification sound or show notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(
                  language === 'ar' ? 'انتهت جلسة العمل!' : 'Work session finished!',
                  {
                    body: language === 'ar' ? 'حان وقت الراحة' : 'Time for a break',
                    icon: '/favicon.ico'
                  }
                );
              }
            } else {
              // Break finished, start work session
              setTimeLeft(25 * 60); // 25 minute work session
              setIsBreak(false);
              // Play notification sound or show notification
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(
                  language === 'ar' ? 'انتهت الراحة!' : 'Break finished!',
                  {
                    body: language === 'ar' ? 'حان وقت العمل' : 'Time to work',
                    icon: '/favicon.ico'
                  }
                );
              }
            }
            return prev;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const pauseTimer = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(25 * 60);
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  useEffect(() => {
    // Request notification permission on mount
    requestNotificationPermission();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="focus-timer">
      <div className="flex items-center gap-2 mb-2">
        <Timer className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isBreak 
            ? (language === 'ar' ? 'راحة' : 'Break')
            : (language === 'ar' ? 'عمل' : 'Work')
          }
        </span>
      </div>
      
      <div className="timer-display">
        {formatTime(timeLeft)}
      </div>
      
      <div className="timer-controls">
        {!isRunning ? (
          <button 
            className="start"
            onClick={startTimer}
            title={language === 'ar' ? 'ابدأ' : 'Start'}
          >
            <Play className="w-3 h-3" />
          </button>
        ) : (
          <button 
            className="pause"
            onClick={pauseTimer}
            title={language === 'ar' ? 'إيقاف مؤقت' : 'Pause'}
          >
            <Pause className="w-3 h-3" />
          </button>
        )}
        
        <button 
          className="reset"
          onClick={resetTimer}
          title={language === 'ar' ? 'إعادة تعيين' : 'Reset'}
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
      
      {sessions > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          {language === 'ar' ? `الجلسات المكتملة: ${sessions}` : `Sessions: ${sessions}`}
        </div>
      )}
    </div>
  );
};

export default FocusTimer;