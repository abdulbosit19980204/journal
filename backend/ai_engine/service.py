from .models import AIConfiguration

class AIService:
    @staticmethod
    def get_config():
        config, created = AIConfiguration.objects.get_or_create(id=1)
        return config

    @classmethod
    def analyze_text(cls, text):
        config = cls.get_config()
        if not config.is_active or not config.api_key:
            return {"error": "AI not configured or inactive"}
        
        # MOCK IMPLEMENTATION
        # In real world, call OpenAI/Anthropic API here
        return {
            "summary": f"This text is about... (Analyzed by {config.provider})",
            "keywords": ["research", "science", "innovation"],
            "grammar_score": 85,
            "suggestions": "Consider revising the abstract for clarity."
        }
