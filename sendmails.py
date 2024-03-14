import os, sys, fcntl, sendmail

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
        row = home.split("/")
        if os.path.exists(home + "/courses/" + lang):
            emails.append(row[-1])
            print(home + '\t' + row[-1])
    return emails

if __name__=="__main__":
    if len(sys.argv) < 4:
        print("USAGE: %s lang=ko-kr ./sendmail.txt ./pages/sendmail.html" % (sys.argv[0]))
        sys.exit()
    lang = sys.argv[1].replace('lang=','')    
    sendmail_txt = sys.argv[2]
    sendmail_html = sys.argv[3]
    emails = get_emails_lang(lang)
    for email in emails:
        pass
        # sendmail.sendmail(email, sendmail_txt, sendmail_html)

