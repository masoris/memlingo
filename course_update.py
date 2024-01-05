import sys, os, json, time

def update_data(data_array, course_name):
    # courses/lang/course_name/content.tsv
    # 0.Level 1.Esperanto 2.English 3.French 4.Grupo 5.Alternativoj 6.Prononco
    # 0.Level 1.Esperanto 2.Japanese 3.English 4.Grupo 5.Alternativoj 6.Prononco
    # eo	en-us	ko-kr	fr	ja-jp	zh-cn	zh-tw	vi-vn
    langs = {}
    for i, lang in enumerate(data_array[0]):
        langs[lang] = i

    for lang in langs:
        filename = "./courses/"+lang+"/"+course_name+"/content.tsv"
        if not os.path.exists("./courses/"+lang):
            os.mkdir("./courses/"+lang)
        if not os.path.exists("./courses/"+lang+"/"+course_name):
            os.mkdir("./courses/"+lang+"/"+course_name)
        print(filename)

        fp = open(filename, "w")
        fp.write("%s.%s content.tsv\n" % (course_name, lang))
        if lang == "en-us":
            lang1 = "en-us"
            lang2 = "fr"
        else:
            lang1 = lang
            lang2 = "en-us"
        fp.write("Level\tEsperanto\t%s\t%s\tGrupo\tAlternativoj\tPronoco\n" % (lang1, lang2))
        for i in range(1, len(data_array)):
            fp.write("level\t%s\t%s\t%s\tgrupo\talternativoj\tprononco\n" % (data_array[i][langs["eo"]], data_array[i][langs[lang1]], data_array[i][langs[lang2]]))
        fp.close()

def update_klarigo(klarigo_array, course_name):
    #language_name	ko-kr	en-us	ja-jp	vi-vn	zh-cn	zh-tw
    #name description short_description tags

    langs = {}
    for i, lang in enumerate(klarigo_array[0]):
        langs[lang] = i

    for lang in langs:
        if lang == "#language_name":
            continue
        filename = "./courses/"+lang+"/"+course_name+"/course_info.json"
        if not os.path.exists("./courses/"+lang):
            os.mkdir("./courses/"+lang)
        if not os.path.exists("./courses/"+lang+"/"+course_name):
            os.mkdir("./courses/"+lang+"/"+course_name)
        print(filename)

        # if not os.path.exists(filename):
        #     course_info = {}
        # else:
        #     fp = open(filename, "r")
        #     jsonstr = fp.read()
        #     course_info1 = json.loads(jsonstr)
        #     course_info = {}
        #     for key in course_info1:
        #         if key in ["name", "description", "short_description", "tags"]:
        #             course_info[key] = course_info1[key]
        #     fp.close()

        course_info = {}

        for row in klarigo_array:
            key = row[0]
            val = row[langs[lang]]
            if key in ["name", "description", "short_description", "tags"]:
                course_info[key] = val
        
        course_info["modified"] = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time.time()))
        fp = open(filename, "w", -1, "utf-8")
        jsonstr = json.dumps(course_info, ensure_ascii=False, indent=2)
        fp.write(jsonstr)
        fp.close()



if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("USAGE: python3 course_update.py A_course_data.tsv A_course_klarigo.tsv course_name")
        sys.exit(0)
    data_tsv = sys.argv[1]
    klarigo_tsv = sys.argv[2]
    course_name = sys.argv[3]

    data_array = []
    klarigo_array = []
    f_data = open(data_tsv, "r")
    f_klarigo = open(klarigo_tsv, "r")
    for line in f_data:
        row = line.replace("\n","").split("\t")
        data_array.append(row)
    for line in f_klarigo:
        row = line.replace("\n","").split("\t")
        klarigo_array.append(row)
    f_klarigo.close()
    f_data.close()
    
    update_data(data_array, course_name)
    update_klarigo(klarigo_array, course_name)


#python3 course_update.py A_course_data.tsv A_course_klarigo.tsv course_name

#klarigo tsv open
#data tsv open 오픈 해서 읽어드린 lines를 다음과 같은 데이터 스트럭쳐로 변환한다. 
#data tsv파일을 오픈해서 라인 구분과 탭 구분을 해서 2차원 어레이로 만든다.
# for lang in langs:
#     #읽어들인 데이터를 이용해서 각 언어별로 courses/lang/course_name/content.tsv파일을 생성한다. 
#     pass

# json_data = {
#     "eo": [
#         "esp_string1", 
#         "esp_string2",
#         "esp_string3",
#     ],
#     "ko-kr": [
#         "kor_string1", 
#         "kor_string2",
#         "kor_string3",
#     ],
#     "en-us": [
#         "eng_string1", 
#         "eng_string2",
#         "eng_string3",
#     ],
# }