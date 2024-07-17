import smtplib, sys
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def read_app_password():
    fp = open("app_password.txt", "r")
    app_password = fp.read()
    fp.close()
    return app_password.strip()

def send_email(sender_email, receiver_email, subject, html):
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = receiver_email

    part1 = MIMEText("plain text is not available", "plain")
    part2 = MIMEText(html, "html")

    message.attach(part1)
    message.attach(part2)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login("memlingo.service@gmail.com", read_app_password())
        server.sendmail(sender_email, receiver_email, message.as_string())

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

    send_email('Memlingo <memlingo.service@gmail.com>', toemail, subject, body_html)


if __name__=="__main__":
    if len(sys.argv) < 4:
        print("USAGE: %s email ./sendmail.txt ./pages/sendmail.html" % (sys.argv[0]))
        sys.exit()
    to_email = sys.argv[1]
    sendmail_txt = sys.argv[2]
    sendmail_html = sys.argv[3]
    sendmail(to_email, sendmail_txt, sendmail_html)

