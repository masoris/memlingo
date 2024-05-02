import os, sys, fcntl, sendmail, json

#모든 사용자의 홈 디렉토리를 가져온다
def get_all_users_home_dir():
    all_emails = []
    dirs = get_subdirectories("./users")
    for dir in dirs:
        emails = get_subdirectories(dir)
        all_emails.extend(emails)
    return all_emails

#하위 디렉토리의 전체 경로를 리턴한다.
def get_subdirectories(directory):
    subdirectories = []
    for entry in os.listdir(directory):
        full_path = os.path.join(directory, entry)
        if os.path.isdir(full_path):
            subdirectories.append(full_path)
    return subdirectories

#하위 경로의 폴더명만 리턴한다.
def get_subdirs(directory):
    subdirs = []
    for entry in os.listdir(directory):
        full_path = os.path.join(directory, entry)
        if os.path.isdir(full_path):
            subdirs.append(entry)
    return subdirs

def get_emails_lang(lang):
    all_homes = get_all_users_home_dir()
    emails = []
    for home in all_homes:
        
        userinfo_json = home + "/userinfo.json"
        user_info = {}
        with open(userinfo_json, "r", encoding='utf-8') as f:
            user_info_json = f.read()    
            user_info = json.loads(user_info_json)
        if "unsubscribe" in user_info and user_info['unsubscribe'] == "YES":
            print("UNSUBSCRIBE " + home)
            continue

        row = home.split("/")
        if os.path.exists(home + "/courses/" + lang):
            # 해당 언어의 A코스를 한 번이라도 공부한 사람만 해당 언어 사용자라고 간주한다.
            if os.path.exists(home + "/courses/" + lang + "/A/myprogress.tsv"):
                has_studied = False
                fp = open(home + "/courses/" + lang + "/A/myprogress.tsv", "r")
                for line in fp:
                    colums = line.strip().split('\t')
                    if colums[-1] != "0000-00-00 00:00:00":
                        has_studied = True
                        break
                    break
                fp.close()
                if has_studied: #A코스를 한 번이라고 공부 하였으면, 해당 언어 사용자로 추가.
                    emails.append(row[-1])
                else:
                    print("SKIP " + row[-1])
            else:
                pass
            # emails.append(row[-1])
            # print(home + '\t' + row[-1])
    return emails

def read_invalid_mails():
    fp = open("invalid_mails.txt", "r")
    mails = []
    for line in fp:
        if line.find("@") < 0:
            continue
        mails.append(line.strip())
    fp.close()

    return mails

invalid_mails = read_invalid_mails()

if __name__=="__main__":
    if len(sys.argv) < 4:
        print("USAGE: %s lang=ko-kr ./sendmail.txt ./pages/sendmail.html" % (sys.argv[0]))
        sys.exit()
    lang = sys.argv[1].replace('lang=','')    
    sendmail_txt = sys.argv[2]
    sendmail_html = sys.argv[3]
    emails = get_emails_lang(lang)
    for email in emails:
        if email in invalid_mails:
            print("%s is invalid mail" % email)
        else:
            print(email)
            sendmail.sendmail(email, sendmail_txt, sendmail_html)

