import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class GeminiKeyManager:
    def __init__(self):
        self.keys = self._load_keys()
        self.current_index = 0
        
    def _load_keys(self) -> List[str]:
        keys = []
        
        for i in range(1, 11):
            key = os.getenv(f'GEMINI_API_KEY_{i}')
            if key:
                keys.append(key)
        
        base_key = os.getenv('GEMINI_API_KEY')
        if base_key:
            keys.append(base_key)
        
        unique_keys = list(set(keys))
        return unique_keys
    
    def get_next_key(self) -> str:
        if not self.keys:
            self.keys = self._load_keys()
            
        if not self.keys:
            raise ValueError("No GEMINI_API_KEY found in environment")
        
        key = self.keys[self.current_index]
        self.current_index = (self.current_index + 1) % len(self.keys)
        return key
    
    def execute_with_retry(self, func, *args, **kwargs):
        last_error = None
        
        if not self.keys:
            self.keys = self._load_keys()
            
        if not self.keys:
            raise Exception("Cannot execute: No Gemini API keys available in environment.")
        
        for _ in range(len(self.keys)):
            key = self.get_next_key()
            
            try:
                return func(key, *args, **kwargs)
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    last_error = e
                    continue
                else:
                    raise e
        
        raise Exception(f"All API keys exhausted. Last error: {str(last_error)}")

key_manager = GeminiKeyManager()
