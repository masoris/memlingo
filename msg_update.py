import sys, os, json, time

def update_msg(data_array, js_file):
    # var lang_msgs = {
    #   "ko-kr": {
    #     "type_e-mail": "이메일 주소를 입력해 주세요.", 
    #   }
    # }
    langs = {}
    for i, lang in enumerate(data_array[0]):
        langs[lang] = i

    output = "var lang_msgs = {\n"

    for lang in langs:
        output += "  \"%s\": {\n" % (lang)
        for j in range(1, len(data_array)):
            output += "    \"%s\": \"%s\",\n" % (data_array[j][0], data_array[j][langs[lang]])
        output += "  },\n"
    output += "}\n"

    # print(output)
    fp = open(js_file, "w")
    fp.write(output)
    fp.close()
        

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("USAGE: python3 msg_update.py lang_msgs.tsv ./pages/lang_msgs.js")
        sys.exit(0)
    tsv_file = sys.argv[1]
    js_file = sys.argv[2]

    data_array = []
    f_data = open(tsv_file, "r")
    for line in f_data:
        row = line.replace("\n","").split("\t")
        data_array.append(row)
    f_data.close()
    
    update_msg(data_array, js_file)