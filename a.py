f = open("dic.tsv", "r")
print("esp_stems={")
for line in f:
    row = line.split("\t")
    if "-" in row[0]:
        print("\""+row[0].split("-")[0]+"\" : True,")
print("}")
f.close()