import json
from pprint import pprint

population = json.load(open("docs/population.json"))
population_dict = {}
for p in population:
    population_dict[p[1]] = p
    print(p)

patients = json.load(open("docs/confirmed_data.js"))

cities = []

w_p_name = "全国平均"
w_name = "-"
w_area = 0
w_population = 0
w_count = 0

for p in patients:
    content = patients[p]
    name = content["cityName"]
    count = content["confirmedCount"]
    if name in population_dict:
        p_name = population_dict[name][0]
        area = population_dict[name][2]
        population = population_dict[name][3]
        w_area = w_area + area
        w_population = w_population + population
        w_count = w_count + count
        res = [p_name, name, count, area, population, round(count / area * 100,1), round(count / population * 100000,1)]
        cities.append(res)
#        print(res)
#    else:
#        print("=================ERROR================")
#        print("                 ",name)
#        print("=================ERROR================")

#add whole country stat
res = [w_p_name, w_name, w_count, w_area, w_population, round(w_count / w_area * 100, 1), round(w_count / w_population * 100000, 1)]
cities.append(res)

cities.sort(key=lambda cities: cities[6],reverse=True)

print(len(cities))
print("population", len(population_dict))
print("patients", len(patients))

#pprint(cities)
city_dict={}
for city in cities:
    city_dict[city[1]] = city

with open("docs/city_dict.js", "w+") as f:
    f.write("city_dict = "+json.dumps(city_dict))


for city in cities:
    city[0] = city[0].replace("省","").replace("市","")
    city[1] = city[1].replace("市","")
    city[3] = round(city[3])
    city[4] = round(city[4] / 10000)
    print("|" + "|".join(map(str,city)) + "|")



