import os, re, json, datetime, random, time, sys, fcntl

#모든 사용자의 홈 디렉토리를 가져온다
def get_all_users_home_dir():
    all_emails = []
    dirs = get_subdirectories("./users")
    for dir in dirs:
        emails = get_subdirectories(dir)
        all_emails.extend(emails)
    return all_emails

def get_subdirectories(directory):
    subdirectories = []
    for entry in os.listdir(directory):
        full_path = os.path.join(directory, entry)
        if os.path.isdir(full_path):
            subdirectories.append(full_path)
    return subdirectories

def get_all_myprogress_tsvs(email_dir):
    myprogress_tsvs = []
    courses_dir = email_dir + "/courses"
    if not os.path.exists(courses_dir):
        print("Error: Courses directory not found: %s:" % courses_dir)
        return myprogress_tsvs
    langs = get_subdirectories(courses_dir)
    for lang in langs:
        courses = get_subdirectories(lang)
        for course in courses:
            myprogress_tsv = course + "/myprogress.tsv"
            if not os.path.exists(myprogress_tsv):
                print("Error: %s not found" % myprogress_tsv)
                continue
            myprogress_tsvs.append(myprogress_tsv)
    return myprogress_tsvs

def update_contents(email_dir):
    print(email_dir)
    myprogress_tsvs = get_all_myprogress_tsvs(email_dir)
    for myprogress_tsv in myprogress_tsvs:
        print(myprogress_tsv)
        # progress_tsv 파일에 상응하는 마스터 content.tsv를 찾아서 해당 파일과 비교해서 업데이트 해준다
        idx = myprogress_tsv.find("@")
        content_tsv = myprogress_tsv[idx:]
        idx = content_tsv.find("/")
        content_tsv = content_tsv[idx+1:]
        content_tsv = "./" + content_tsv.replace("myprogress", "content") 
        print(content_tsv)
        # content_tsv 마스터 파일이고, myprogress_tsv 개인 파일임
        # 마스터 파일과 개인 파일을 비교해서 마스터 파일에 있고 개인 파일에 없는 것은 개인 파일에 추가를 해주고
        # ,개인 파일에 있고 마스터 파일에는 없는 것은 개인 파일에서 지워준다
        content_lines = []
        content_esps = {}
        fp = open(content_tsv, "r", encoding='utf-8')
        for line in fp:
            #[0]level1	[1]esp1	[2]kor1	[3]eng1	[4]group1	[5]alternative1	[6]prononcation1
            row = line.split('\t')
            if not row[1] in content_esps:
                content_esps[row[1]] = line
                content_lines.append(line)
        fp.close()
        
        myprogress_lines = []
        myprogress_esps = {}
        fp = open(myprogress_tsv, "r", encoding='utf-8')
        for line in fp:
            #[0]level1	[1]esp1	[2]kor1	[3]eng1	[4]group1	[5]alternative1	[6]prononcation1
            row = line.split('\t')
            if not row[1] in myprogress_esps:
                myprogress_esps[row[1]] = 1
                myprogress_lines.append(line)
        fp.close()

        only_in_content_lines = {}
        for line in content_lines:
            row = line.split('\t')
            if not row[1] in myprogress_esps:
                only_in_content_lines[line] = 1

        only_in_myprogress_lines = {}
        for line in myprogress_lines:
            row = line.split('\t')
            if not row[1] in content_esps:
                only_in_myprogress_lines[line] = 1

        fp = open(myprogress_tsv, "w", encoding='utf-8')
        fcntl.flock(fp, fcntl.LOCK_EX)
        for line in myprogress_lines:
            if not line in only_in_myprogress_lines:
                # fp.write(line.strip() + "\n")
                row = line.split('\t')
                content_line = content_esps[row[1]]
                content_row = content_line.split('\t')
                row[2] = content_row[2]
                row[3] = content_row[3]
                fp.write("\t".join(row))
        
        for line in content_lines:
            if line in only_in_content_lines:
                #[0]level1	[1]esp1	[2]kor1	[3]eng1	[4]group1	[5]alternative1	[6]prononcation1
                row = line.strip().split('\t')
                if len(row) <5:
                    continue
                row = row[0:5]
                row.append('0    ')
                row.append('0000-00-00 00:00:00')
                fp.write('\t'.join(row)+'\n')
        fcntl.flock(fp, fcntl.LOCK_UN)
        fp.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: %s run" % (sys.argv[0]))
        sys.exit(0)
    all_emails = get_all_users_home_dir()
    for email in all_emails:
        update_contents(email)
