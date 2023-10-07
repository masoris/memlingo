import random
import os
import esp_stems

endings = [
  'i', 'as', 'is', 'os', 'us', 'u',
  'a', 'an', 'aj', 'ajn', 
  'uj',
  'o', 'oj', 'on', 'ojn', 
  'e', 'en', 'es',
]

suffixes = [
  'at', 'it', 'ot', 'ant', 'int', 'ont',
  'ig', 'iĝ', 
#   'er', 'ec', 'aĉ', 'ist', 
#   'uj', 'ej', 'ar', 'ad', 'in', 
]

def get_ending(word):
    for e in endings:
        if word.endswith(e):
            return [word[0:-len(e)], e]
    return [word, '']

def get_suffix(word):
    for s in suffixes:
        if word.endswith(s):
            return [word[0:-len(s)], s]
    return [word, '']

def get_stem(word):
    [w, e] = get_ending(word)
    if e == '': return [w]
    [w, s] = get_suffix(w)
    if s == '': return [w, e]
    # [w, t] = get_suffix(w)
    # if t == '': return [w, s, e]
    return [w, s, e]

seed = random.randint(0, 1)
def randint(a,b):
    global seed
    seed = random.randint(0,1)
    # seed = (seed+1) % 2
    # print (seed)
    return seed

consonants = "cĉjĵklzvbnmrtsfgĝhĥp" 
vowels = "aeiou"

def rand_char(group, c):
    group = group.replace(c, '')
    c2 = group[random.randint(0, len(group)-1)]
    # print("rand_char:"+ c +","+ c2)
    return c2
    
def change_chars(group: str, s: str) -> str:
    s1 = s
    # print(group+":"+s)
    r = False
    if randint(0,1) == 0:
        s1 = s[::-1] # reverse
        r = True
    s2 = ""
    changed = False
    for i, c in enumerate(s1):
        if not changed and c in group:
            s2 += rand_char(group, c)
            changed = True
        else:
            s2 += c
    s1 = s2
    if r == True:
        s1 = s1[::-1] # reverse
    if s1 == s:
        return None
    # print(s1)
    return s1

def get_fake_word(word: str) -> str: #가짜 에스페란토 단어 만들기
    global consonants
    global vowels
    w = get_stem(word) 
    if len(w[0]) <= 1:
        return None
    while True:
        if randint(0,1) == 0:
            w0 = change_chars(consonants, w[0])
        else:
            w0 = change_chars(vowels, w[0])
        if w0 == None:
            continue
        # print(w[0]+","+w0)
        if not w0 in esp_stems.esp_stems:
            break
    w[0] = w0
    return "".join(w)
 
def remove_specials(s: str) -> str:
    sp = "'\",.?!-()=[]{}#*+~1234567890"
    for c in sp:
        s = s.replace(c, ' ')
    return s
    
def get_stems(lines: list, stems: dict):
    for line in lines:
        row = line.split('\t')
        ws = remove_specials(row[1]).split(" ")
        for w in ws:
            if len(w) == 0: continue
            stem_tail = get_stem(w)
            if stem_tail[0].lower() == stem_tail[0]:
                stems[stem_tail[0]] = get_fake_word(w)
                print(w + " " + str(stems[stem_tail[0]]))



courses = "../memlingo/courses"

def find_pattern_files(directory, pattern):
    out_files = []
    
    # 디렉토리 안의 모든 항목에 대해 반복
    for root, dirs, files in os.walk(directory):
        for file in files:
            # 파일이 .mp3 확장자를 가지고 있는지 확인
            if file.endswith(pattern):
                # *.mp3 파일을 찾았으므로 경로를 mp3_files 리스트에 추가
                out_files.append(os.path.join(root, file))
    return out_files

stems = {}
tsvs = find_pattern_files(courses, '.tsv')
for tsv_file in tsvs:
    lines=[]
    fp = open(tsv_file, "r")
    for line in fp:
        lines.append(line)
    fp.close()
    get_stems(lines,stems)

for stem in stems:
    print(stem + "," + stems[stem])