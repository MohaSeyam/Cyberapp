// Automatic Text Summarization Utility
// This utility provides intelligent text summarization capabilities

/**
 * Extract key sentences from text using TF-IDF algorithm
 * @param {string} text - The input text to summarize
 * @param {number} maxSentences - Maximum number of sentences in summary
 * @returns {string} - Summarized text
 */
export const extractKeySentences = (text, maxSentences = 3) => {
  if (!text || typeof text !== 'string') return '';
  
  // Clean text and split into sentences
  const sentences = text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .split(/[.!?]+/)
    .filter(sentence => sentence.trim().length > 10); // Filter short sentences
  
  if (sentences.length <= maxSentences) return text;
  
  // Calculate word frequency
  const wordFreq = {};
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  // Calculate sentence scores based on word frequency
  const sentenceScores = sentences.map(sentence => {
    const sentenceWords = sentence.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    const score = sentenceWords.reduce((total, word) => {
      return total + (wordFreq[word] || 0);
    }, 0);
    
    return {
      sentence: sentence.trim(),
      score: score / sentenceWords.length // Average score
    };
  });
  
  // Sort by score and take top sentences
  const topSentences = sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence)); // Maintain order
  
  return topSentences.map(item => item.sentence).join('. ') + '.';
};

/**
 * Generate questions from text content
 * @param {string} text - The input text
 * @param {number} maxQuestions - Maximum number of questions to generate
 * @returns {Array} - Array of questions
 */
export const generateQuestions = (text, maxQuestions = 5) => {
  if (!text || typeof text !== 'string') return [];
  
  const questions = [];
  const sentences = text
    .replace(/<[^>]*>/g, '')
    .split(/[.!?]+/)
    .filter(sentence => sentence.trim().length > 20);
  
  // Key phrases that often indicate important concepts
  const keyPhrases = [
    'مهم', 'أساسي', 'ضروري', 'مطلوب', 'يجب', 'لازم',
    'important', 'essential', 'required', 'necessary', 'must', 'should'
  ];
  
  sentences.forEach(sentence => {
    const hasKeyPhrase = keyPhrases.some(phrase => 
      sentence.toLowerCase().includes(phrase.toLowerCase())
    );
    
    if (hasKeyPhrase && questions.length < maxQuestions) {
      // Convert statement to question
      const question = convertToQuestion(sentence);
      if (question) {
        questions.push(question);
      }
    }
  });
  
  return questions.slice(0, maxQuestions);
};

/**
 * Convert a statement to a question
 * @param {string} sentence - The statement to convert
 * @returns {string} - The question
 */
const convertToQuestion = (sentence) => {
  const trimmed = sentence.trim();
  
  // Arabic question patterns
  if (/[\u0600-\u06FF]/.test(trimmed)) {
    if (trimmed.includes('هو') || trimmed.includes('هي')) {
      return `ما هو ${trimmed.replace(/هو\s+|هي\s+/, '')}؟`;
    }
    if (trimmed.includes('يجب') || trimmed.includes('لازم')) {
      return `لماذا ${trimmed}؟`;
    }
    if (trimmed.includes('يمكن') || trimmed.includes('ممكن')) {
      return `كيف ${trimmed}؟`;
    }
    return `ما هو ${trimmed}؟`;
  }
  
  // English question patterns
  if (trimmed.includes('is') || trimmed.includes('are')) {
    return `What is ${trimmed.replace(/^(the\s+|a\s+|an\s+)/i, '')}?`;
  }
  if (trimmed.includes('should') || trimmed.includes('must')) {
    return `Why ${trimmed}?`;
  }
  if (trimmed.includes('can') || trimmed.includes('could')) {
    return `How ${trimmed}?`;
  }
  
  return `What is ${trimmed}?`;
};

/**
 * Extract key points from text
 * @param {string} text - The input text
 * @param {number} maxPoints - Maximum number of key points
 * @returns {Array} - Array of key points
 */
export const extractKeyPoints = (text, maxPoints = 5) => {
  if (!text || typeof text !== 'string') return [];
  
  const keyPoints = [];
  const sentences = text
    .replace(/<[^>]*>/g, '')
    .split(/[.!?]+/)
    .filter(sentence => sentence.trim().length > 15);
  
  // Look for sentences with key indicators
  const indicators = [
    'أولاً', 'ثانياً', 'ثالثاً', 'أخيراً', 'بالإضافة', 'علاوة على',
    'first', 'second', 'third', 'finally', 'additionally', 'moreover',
    '•', '-', '*', '1.', '2.', '3.'
  ];
  
  sentences.forEach(sentence => {
    const hasIndicator = indicators.some(indicator => 
      sentence.includes(indicator)
    );
    
    if (hasIndicator && keyPoints.length < maxPoints) {
      keyPoints.push(sentence.trim());
    }
  });
  
  // If no indicators found, use high-frequency words
  if (keyPoints.length === 0) {
    const wordFreq = {};
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    const importantWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxPoints)
      .map(([word]) => word);
    
    importantWords.forEach(word => {
      const sentence = sentences.find(s => 
        s.toLowerCase().includes(word)
      );
      if (sentence && keyPoints.length < maxPoints) {
        keyPoints.push(sentence.trim());
      }
    });
  }
  
  return keyPoints.slice(0, maxPoints);
};

/**
 * Generate a comprehensive summary with multiple formats
 * @param {string} text - The input text
 * @returns {Object} - Summary object with different formats
 */
export const generateComprehensiveSummary = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      summary: '',
      keyPoints: [],
      questions: [],
      wordCount: 0,
      readingTime: 0
    };
  }
  
  const cleanText = text.replace(/<[^>]*>/g, '').trim();
  const wordCount = cleanText.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed
  
  return {
    summary: extractKeySentences(cleanText, 3),
    keyPoints: extractKeyPoints(cleanText, 5),
    questions: generateQuestions(cleanText, 5),
    wordCount,
    readingTime
  };
};

/**
 * Smart text truncation with ellipsis
 * @param {string} text - The input text
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const smartTruncate = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};

/**
 * Extract tags from text content
 * @param {string} text - The input text
 * @param {number} maxTags - Maximum number of tags
 * @returns {Array} - Array of tags
 */
export const extractTags = (text, maxTags = 8) => {
  if (!text || typeof text !== 'string') return [];
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const wordFreq = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  return Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxTags)
    .map(([word]) => word);
};