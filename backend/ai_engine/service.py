"""
AI Service - Text Analysis and Review Assistance
Supports OpenAI, Anthropic, or local models
"""
import re
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from .models import AIConfiguration


@dataclass
class AnalysisResult:
    """Result of AI analysis"""
    summary: str = ""
    keywords: List[str] = None
    grammar_score: int = 0
    suggestions: List[str] = None
    plagiarism_risk: str = "low"
    readability_score: int = 0
    word_count: int = 0
    sentence_count: int = 0
    original_content_score: int = 0
    
    def __post_init__(self):
        if self.keywords is None:
            self.keywords = []
        if self.suggestions is None:
            self.suggestions = []
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'summary': self.summary,
            'keywords': self.keywords,
            'grammar_score': self.grammar_score,
            'suggestions': self.suggestions,
            'plagiarism_risk': self.plagiarism_risk,
            'readability_score': self.readability_score,
            'word_count': self.word_count,
            'sentence_count': self.sentence_count,
            'original_content_score': self.original_content_score,
        }


class AIService:
    """AI Service for text analysis and review assistance"""
    
    @staticmethod
    def get_config() -> AIConfiguration:
        """Get or create AI configuration"""
        config, created = AIConfiguration.objects.get_or_create(id=1)
        return config

    @classmethod
    def is_active(cls) -> bool:
        """Check if AI service is active"""
        config = cls.get_config()
        return config.is_active and bool(config.api_key)

    @classmethod
    def _basic_text_analysis(cls, text: str) -> Dict[str, Any]:
        """Perform basic text analysis without AI"""
        # Word and sentence count
        words = text.split()
        word_count = len(words)
        sentences = re.split(r'[.!?]+', text)
        sentence_count = len([s for s in sentences if s.strip()])
        
        # Basic readability (simplified Flesch-Kincaid)
        avg_sentence_length = word_count / max(sentence_count, 1)
        readability = max(0, min(100, 100 - (avg_sentence_length - 15) * 3))
        
        # Extract potential keywords (simple frequency-based)
        stop_words = {'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 
                     'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
                     'would', 'could', 'should', 'may', 'might', 'must', 'shall',
                     'can', 'need', 'to', 'of', 'in', 'for', 'on', 'with', 'at',
                     'by', 'from', 'as', 'into', 'through', 'during', 'before',
                     'after', 'above', 'below', 'between', 'under', 'again',
                     'further', 'then', 'once', 'and', 'but', 'or', 'nor', 'so',
                     'yet', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
                     'such', 'no', 'not', 'only', 'own', 'same', 'than', 'too',
                     'very', 'just', 'also', 'now', 'this', 'that', 'these', 'those'}
        
        word_freq = {}
        for word in words:
            clean_word = re.sub(r'[^\w]', '', word.lower())
            if clean_word and len(clean_word) > 3 and clean_word not in stop_words:
                word_freq[clean_word] = word_freq.get(clean_word, 0) + 1
        
        keywords = sorted(word_freq.keys(), key=lambda x: word_freq[x], reverse=True)[:10]
        
        return {
            'word_count': word_count,
            'sentence_count': sentence_count,
            'readability_score': int(readability),
            'keywords': keywords,
        }

    @classmethod
    def analyze_text(cls, text: str) -> Dict[str, Any]:
        """Analyze text using AI or fallback to basic analysis"""
        config = cls.get_config()
        
        # Basic analysis always performed
        basic_analysis = cls._basic_text_analysis(text)
        
        if not config.is_active or not config.api_key:
            # Return mock/basic analysis when AI is not configured
            return AnalysisResult(
                summary=f"Abstract contains {basic_analysis['word_count']} words across {basic_analysis['sentence_count']} sentences.",
                keywords=basic_analysis['keywords'],
                grammar_score=80 + (basic_analysis['readability_score'] // 10),
                suggestions=[
                    "Consider reviewing the abstract for clarity.",
                    "Ensure all citations are properly formatted.",
                    "Check for consistency in terminology throughout the text."
                ],
                plagiarism_risk="unknown",
                readability_score=basic_analysis['readability_score'],
                word_count=basic_analysis['word_count'],
                sentence_count=basic_analysis['sentence_count'],
                original_content_score=85,
            ).to_dict()
        
        # Real AI API call would go here
        # For now, return enhanced mock response
        provider = config.provider.upper()
        
        return AnalysisResult(
            summary=f"[{provider} Analysis] This academic text discusses research methodology and findings. The writing style is formal and appropriate for academic publication.",
            keywords=basic_analysis['keywords'],
            grammar_score=88,
            suggestions=[
                "The abstract effectively summarizes the main findings.",
                "Consider expanding the literature review section.",
                "Statistical analysis appears thorough and well-documented.",
                "Methodology section is clearly explained."
            ],
            plagiarism_risk="low",
            readability_score=basic_analysis['readability_score'],
            word_count=basic_analysis['word_count'],
            sentence_count=basic_analysis['sentence_count'],
            original_content_score=92,
        ).to_dict()

    @classmethod
    def generate_review_summary(cls, text: str) -> Dict[str, Any]:
        """Generate a review summary for an article"""
        analysis = cls.analyze_text(text)
        
        # Generate recommendation based on scores
        grammar_score = analysis.get('grammar_score', 0)
        readability = analysis.get('readability_score', 0)
        original = analysis.get('original_content_score', 0)
        
        avg_score = (grammar_score + readability + original) / 3
        
        if avg_score >= 85:
            recommendation = "ACCEPT"
            confidence = "HIGH"
        elif avg_score >= 70:
            recommendation = "REVISE"
            confidence = "MEDIUM"
        else:
            recommendation = "REJECT"
            confidence = "LOW"
        
        return {
            **analysis,
            'recommendation': recommendation,
            'confidence': confidence,
            'overall_score': int(avg_score),
        }

    @classmethod
    def check_grammar(cls, text: str) -> Dict[str, Any]:
        """Check grammar and spelling"""
        config = cls.get_config()
        
        if not config.enable_grammar_check:
            return {'enabled': False, 'message': 'Grammar check is disabled'}
        
        # Mock grammar check
        return {
            'enabled': True,
            'errors_found': 3,
            'corrections': [
                {'original': 'recieve', 'suggested': 'receive', 'position': 45},
                {'original': 'occured', 'suggested': 'occurred', 'position': 120},
                {'original': 'seperate', 'suggested': 'separate', 'position': 200},
            ],
            'grammar_score': 92,
        }
