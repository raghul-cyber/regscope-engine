from typing import List
from dataclasses import dataclass
from bs4 import BeautifulSoup
import re

@dataclass
class ParsedSection:
    heading: str
    level: int
    text: str
    char_start: int
    char_end: int
    xpath: str

def get_xpath(element) -> str:
    components = []
    child = element if element.name else element.parent
    for parent in child.parents:
        siblings = parent.find_all(child.name, recursive=False)
        components.append(
            child.name if len(siblings) == 1 else '%s[%d]' % (
                child.name,
                next(i for i, s in enumerate(siblings, 1) if s is child)
            )
        )
        child = parent
    components.reverse()
    return '/%s' % '/'.join(components)

def parse_html(html_content: str) -> List[ParsedSection]:
    """
    - Parse HTML with BeautifulSoup
    - Extract heading hierarchy (h1–h6) -> build section tree
    - Identify article/section numbers from text patterns: "Article \d+", "Section \d+", "§\d+"
    - For each leaf text node: record xpath, char offsets relative to full document text
    - Produce: List[ParsedSection] with heading, level, text, char_start, char_end, xpath
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Strip script and style elements
    for script in soup(["script", "style"]):
        script.extract()
        
    full_text = soup.get_text(separator=' ')
    
    sections = []
    current_heading = "Document Root"
    current_level = 0
    
    # Simplified extraction for Phase 2
    for element in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div']):
        if element.name.startswith('h'):
            current_heading = element.get_text(strip=True)
            current_level = int(element.name[1])
        elif element.name in ['p', 'div']:
            text = element.get_text(strip=True)
            if not text:
                continue
                
            # Find offsets in full_text
            char_start = full_text.find(text)
            if char_start != -1:
                char_end = char_start + len(text)
                
                xpath = get_xpath(element)
                sections.append(ParsedSection(
                    heading=current_heading,
                    level=current_level,
                    text=text,
                    char_start=char_start,
                    char_end=char_end,
                    xpath=xpath
                ))
                
    return sections
