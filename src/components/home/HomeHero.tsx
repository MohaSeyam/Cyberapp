import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, BarChart3, Lightbulb } from 'lucide-react';
import Button from '../ui/Button';
import geminiLogo from '../../assets/Gemini_Generated_Image_26mado26mado26ma.png';

interface HomeHeroProps {
  language: string;
  t: (key: string) => string;
  navigate: (path: string) => void;
}

const HomeHero = React.memo(({ language, t, navigate }: HomeHeroProps) => {
  return (
    <motion.div
      className="mb-12 text-center"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex justify-center mb-8">
        <motion.div 
          className="relative w-40 h-40 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
          <img 
            src={geminiLogo} 
            alt="Gemini Logo" 
            className="relative w-40 h-40 object-contain opacity-90"
            style={{ backgroundColor: 'transparent' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<svg class="w-40 h-40 text-blue-600 dark:text-blue-400 opacity-90" fill="currentColor" viewBox="0 0 24 24" style="background-color: transparent;"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>';
              }
            }}
          />
        </motion.div>
      </div>
      
      <motion.h1 
        className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4"
        style={{ 
          fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'inherit',
          lineHeight: language === 'ar' ? '1.4' : '1.2'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        CyberPlan
      </motion.h1>
      
      <motion.p 
        className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto"
        style={{ 
          fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'inherit',
          lineHeight: language === 'ar' ? '1.8' : '1.6'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {t('cyberSecurityLearning')}
      </motion.p>

      <motion.div
        className="flex flex-wrap justify-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/phases')}
          className="text-lg px-8 py-4"
        >
          {language === 'ar' ? (
            <>
              {t('startLearning')}
              <Rocket className="w-5 h-5 mr-2" />
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5 ml-2" />
              {t('startLearning')}
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/progress')}
          className="text-lg px-8 py-4"
        >
          {language === 'ar' ? (
            <>
              {t('viewProgress')}
              <BarChart3 className="w-5 h-5 mr-2" />
            </>
          ) : (
            <>
              <BarChart3 className="w-5 h-5 ml-2" />
              {t('viewProgress')}
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/features')}
          className="text-lg px-8 py-4"
        >
          {language === 'ar' ? (
            <>
              {language === 'ar' ? 'المميزات الجديدة' : 'New Features'}
              <Lightbulb className="w-5 h-5 mr-2" />
            </>
          ) : (
            <>
              <Lightbulb className="w-5 h-5 ml-2" />
              {language === 'ar' ? 'المميزات الجديدة' : 'New Features'}
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
});

export default HomeHero;