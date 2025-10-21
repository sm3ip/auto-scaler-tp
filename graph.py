#lecture du .json
import json
import matplotlib.pyplot as plt

#dataForGraphwithoutAusclaling

def parseNumberOfPod5(pods : str):
    return pods.count("Running")



with open("dataForGraph.json", "r") as f:
 doc = json.loads(f.read())
f.close()
print(doc)


print(doc[0]["TotalDelay:"])

print(len(doc))

#traitement du json
Ltimer = []
Lreplica = []
LTotalDelay = []
totalDelay = 0
i=0
while i < len(doc):
    timer = doc[i]["timer"]
    if timer not in Ltimer:
        Ltimer.append(timer/1000)
        podsParsing = parseNumberOfPod5(doc[i]["nbReplica"])
        Lreplica.append(podsParsing)
        j=0
        while i < len(doc) and timer == doc[i]["timer"] :
            totalDelay += doc[i]["TotalDelay:"]
            j+=1
            i+=1
        LTotalDelay.append(totalDelay/j)
        totalDelay = 0
    else:
        i+=1
    print(i)


print(Lreplica)
print(Ltimer)
print(LTotalDelay)

print(len(Lreplica))
print(len(Ltimer))
print(len(LTotalDelay))

plt.subplots(figsize=(7, 6))
plt.grid()
plt.title("Évolution du totalDelay d'exécution au cours du temps avec\n requestInterval = 10ms et TaretDelay = 25ms\n Jobid = 292241")
plt.xlabel("temps en Seconde")
plt.ylabel("totalDelay en milliSeconds")
plt.plot(Ltimer, LTotalDelay)
plt.savefig("graphTotalDelayEconome.png")
plt.show()
plt.close()

plt.subplots(figsize=(7, 6))
plt.grid()
plt.title("Évolution du nombre réplica au cours du temps avec\n requestInterval = 10ms et TaretDelay = 25ms\n Jobid = 292241")
plt.xlabel("temps en Seconde")
plt.ylabel("nombre de réplica")

plt.plot(Ltimer, Lreplica)
plt.savefig("graphreplicaEconome.png")
plt.show()

