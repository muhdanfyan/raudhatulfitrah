import re
import os
from urllib.parse import urlparse, parse_qs

def normalize_url(url):
    parsed = urlparse(url)
    if 'youtube.com' in parsed.netloc:
        qs = parse_qs(parsed.query)
        v = qs.get('v')
        if v:
            return f"https://www.youtube.com/watch?v={v[0]}"
    return url

def clean_file(filepath):
    if not os.path.exists(filepath):
        # print(f"File not found: {filepath}")
        return

    if not filepath.endswith('.txt'):
        return

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return

    url_pattern = re.compile(r'https://www\.youtube\.com/watch\?v=[^ \t\n]+')
    
    garbage_keywords = [
        "sedang diputar", "opening", "intro", "clip", "part", "sesi", 
        "by", "oleh", "hi guys", "highlights", "pembuka", "penutup", 
        "undefined", "basa-basi", "lorem ipsum", "untitled video",
        "halo semua", "kaka", "bang", "cuy", "mas", "guys", " ▶", "▶",
        "console was cleared", "vm344", "vm3011", "videos:"
    ]

    url_to_titles = {}

    for line in lines:
        line = line.strip()
        match = url_pattern.search(line)
        if match:
            url = match.group(0)
            norm_url = normalize_url(url)
            
            parts = line.split('\t')
            title = ""
            if len(parts) > 1:
                title = parts[0].strip()
            else:
                title = line.replace(url, '').strip()
            
            # Clean title
            # Remove leading "VM344:1" style noise
            title = re.sub(r'^VM\d+:\d+\s*', '', title, flags=re.IGNORECASE)
            # Remove leading numbers/dots
            title = re.sub(r'^\d+[\.\s\-]+', '', title)
            # Remove timestamps
            title = re.sub(r'\d{1,2}[:\.]\d{2}([:\.]\d{2})?', '', title).strip()
            
            if norm_url not in url_to_titles:
                url_to_titles[norm_url] = set()
            
            if title:
                # Filter out pure numbers or very short strings
                if not re.match(r'^\d+$', title) and len(title) > 2:
                    url_to_titles[norm_url].add(title)

    cleaned_data = []
    for url, titles in sorted(url_to_titles.items()):
        filtered_titles = [t for t in titles if not any(g in t.lower() for g in garbage_keywords)]
        
        best_title = ""
        if filtered_titles:
            best_title = max(filtered_titles, key=len)
            cleaned_data.append(f"{best_title}\t{url}")
    
    if cleaned_data:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(cleaned_data) + '\n')
        print(f"Cleaned {filepath}: {len(cleaned_data)} high-quality items.")

def process_dir(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            clean_file(os.path.join(root, file))

base_dir = '/Users/pondokit/Herd/pisantriv2/list-course'
process_dir(os.path.join(base_dir, 'youtuber'))
process_dir(os.path.join(base_dir, 'list-mapel'))
clean_file(os.path.join(base_dir, 'copy-video-channel-youtube.txt'))
