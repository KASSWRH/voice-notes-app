"""
Simple natural language processing to extract tasks from voice notes
This is a basic implementation that could be enhanced with more advanced NLP
"""
import re

def extract_tasks(text: str) -> list:
    if not text:
        return []
    
    tasks = []
    
    # Split text into sentences
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    # Task indicator phrases
    task_indicators = [
        'need to',
        'have to',
        'should',
        'must',
        'todo',
        'to do',
        'to-do',
        'task:',
        'tasks:',
        'remember to',
        "don't forget to",
        'make sure to',
        'remind me to'
    ]
    
    # Time-related phrases that might indicate tasks
    time_indicators = [
        'today',
        'tomorrow',
        'next week',
        'on monday',
        'on tuesday',
        'on wednesday',
        'on thursday',
        'on friday',
        'on saturday',
        'on sunday'
    ]
    
    # Check each sentence for task indicators
    for sentence in sentences:
        lower_sentence = sentence.lower().strip()
        
        # Check if the sentence contains task indicators
        has_task_indicator = any(indicator in lower_sentence for indicator in task_indicators)
        
        # Check if the sentence contains time indicators
        has_time_indicator = any(indicator in lower_sentence for indicator in time_indicators)
        
        # Check if the sentence is imperative (starts with a verb)
        is_imperative = bool(re.match(r'^[A-Z]?[a-z]+\s', sentence.strip()))
        
        # Add sentence as a task if it matches criteria
        if has_task_indicator or (has_time_indicator and is_imperative):
            # Clean up the task text
            task_text = sentence.strip()
            
            # Remove task indicators from the beginning of the task
            for indicator in task_indicators:
                pattern = re.compile(fr'^\s*{indicator}\s+', re.IGNORECASE)
                task_text = pattern.sub('', task_text)
            
            # Ensure first letter is capitalized
            if task_text:
                task_text = task_text[0].upper() + task_text[1:]
                tasks.append(task_text)
    
    return tasks