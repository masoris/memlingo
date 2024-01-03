import sys

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
    


#python3 course_update.py A_course_data.tsv A_course_klarigo.tsv course_name

#klarigo tsv open
#data tsv open 오픈 해서 읽어드린 lines를 다음과 같은 데이터 스트럭쳐로 변환한다. 
#data tsv파일을 오픈해서 라인 구분과 탭 구분을 해서 2차원 어레이로 만든다.
for lang in langs:
    #읽어들인 데이터를 이용해서 각 언어별로 courses/lang/course_name/content.tsv파일을 생성한다. 
    pass

json_data = {
    "eo": [
        "esp_string1", 
        "esp_string2",
        "esp_string3",
    ],
    "ko-kr": [
        "kor_string1", 
        "kor_string2",
        "kor_string3",
    ],
    "en-us": [
        "eng_string1", 
        "eng_string2",
        "eng_string3",
    ],
}