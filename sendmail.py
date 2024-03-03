# pip install google-auth-oauthlib
# pip3 install googleapiclient
from __future__ import print_function
import base64, sys
import os.path
from email.mime.text import MIMEText
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://mail.google.com/']

creds = None
if os.path.exists('token.json'):
    creds = Credentials.from_authorized_user_file('token.json', SCOPES)
# If there are no (valid) credentials available, let the user log in.
if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
        creds = flow.run_local_server(port=0)
    # Save the credentials for the next run
    with open('token.json', 'w') as token:
        token.write(creds.to_json())


service = build('gmail', 'v1', credentials=creds)


def create_message(sender, to, subject, message_text):
    message = MIMEText(message_text, 'html')
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject
    # message['Content-Type'] = 'text/html'
    return {'raw': base64.urlsafe_b64encode(message.as_string().encode()).decode()}


def send_message(service, user_id, message):
    try:
        message = (service.users().messages().send(userId=user_id, body=message)
                   .execute())
        print('Message Id: %s' % message['id'])
        return message
    except Exception as error:
        print(error)

def sendmail(toemail, sendmail_txt, sendmail_html):
    fp = open(sendmail_txt, "r")
    mail_lines = []
    subject = ""
    for line in fp:
        if (line.find("SUBJECT:") == 0):
            subject = line[9:]
            continue
        mail_lines.append(line)
    fp.close()

    mail_txt = "<br>".join(mail_lines)

    fp = open(sendmail_html, "r")
    sendmail_html = []
    for line in fp:
        if (line.find("$EMAILCONTENTS$") >= 0):
            line = line.replace("$EMAILCONTENTS$", mail_txt)
        if (line.find("$EMAIL$") >= 0):
            line = line.replace("$EMAIL$", toemail)
        sendmail_html.append(line)
    fp.close()

    body_html = "".join(sendmail_html)

    message = create_message('Memlingo <memlingo.service@gmail.com>', toemail, subject, body_html)
    print(send_message(service=service, user_id='me', message=message))

if __name__=="__main__":
    if len(sys.argv) < 4:
        print("USAGE: %s email ./sendmail.txt ./pages/sendmail.html" % (sys.argv[0]))
        sys.exit()
    to_email = sys.argv[1]
    sendmail_txt = sys.argv[2]
    sendmail_html = sys.argv[3]
    sendmail(to_email, sendmail_txt, sendmail_html)

