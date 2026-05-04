from langchain_openai import ChatOpenAI
from config import settings

def get_llm(temperature: float = 0.0) -> ChatOpenAI:
    """
    Returns a configured instance of the LLM based on centralized settings.
    """
    return ChatOpenAI(
        model=settings.OPENROUTER_MODEL, 
        temperature=temperature, 
        openai_api_key=settings.OPENROUTER_API_KEY,
        openai_api_base=settings.OPENROUTER_BASE_URL
    )
