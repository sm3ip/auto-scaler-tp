#lecture du .json
import json
import matplotlib.pyplot as plt
import subprocess

#dataForGraphwithoutAusclaling

def parseNumberOfPod5(pods : str):
    return pods.count("Running")



with open("dataForGraph.json", "r") as f:
 doc = json.loads(f.read())
f.close()


with open("dataForGraphwithoutAutoSclaling.json", "r") as f:
 doc2 = json.loads(f.read())
f.close()

result = subprocess.run(["echo", "Hello, World!"], capture_output=True, text=True)
print(result.stdout)
#traitement du json avec autoscaling
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

#traitement du json avec sans autoscaling
#traitement du json avec autoscaling
Ltimer2 = []
Lreplica2 = []
LTotalDelay2 = []
totalDelay2 = 0
i=0
while i < len(doc2):
    timer = doc2[i]["timer"]
    if timer not in Ltimer2:
        Ltimer2.append(timer/1000)
        podsParsing = parseNumberOfPod5(doc2[i]["nbReplica"])
        Lreplica2.append(podsParsing)
        j=0
        while i < len(doc2) and timer == doc2[i]["timer"] :
            totalDelay += doc2[i]["TotalDelay:"]
            j+=1
            i+=1
        LTotalDelay2.append(totalDelay/j)
        totalDelay = 0
    else:
        i+=1

print(Lreplica)
print(Ltimer)
print(LTotalDelay)

print(Lreplica2)
print(Ltimer2)
print(LTotalDelay2)


print(len(Lreplica))
print(len(Ltimer))
print(len(LTotalDelay))

plt.figure(figsize=(7, 6))
plt.grid()
plt.title("Évolution du totalDelay d'exécution au cours du temps avec\n requestInterval = 10ms et TargetDelay = 25ms")
plt.xlabel("temps en Seconde")
plt.ylabel("totalDelay en milliSeconds")
plt.plot(Ltimer, LTotalDelay)
plt.savefig("graphTotalDelaytroll.png")
plt.show()
#plt.close()

plt.figure(figsize=(7, 6))
plt.grid()
plt.title("Évolution du totalDelay d'exécution au cours du temps\n requestInterval = 10ms et TargetDelay = 25ms")
plt.xlabel("temps en Seconde")
plt.ylabel("totalDelay en milliSeconds")
plt.plot(Ltimer, LTotalDelay, label= "avec autoscaling")
plt.plot(Ltimer2, LTotalDelay2,label= "sans autoscaling")
plt.legend()
plt.savefig("graphTotalDelayCamparaisontroll.png")
plt.show()
#plt.close()


plt.figure(figsize=(7, 6))
plt.grid()
plt.title("Évolution du nombre réplica au cours du temps avec\n requestInterval = 10ms et TargetDelay = 25ms")
plt.xlabel("temps en Seconde")
plt.ylabel("nombre de réplica")
plt.plot(Ltimer, Lreplica)
plt.savefig("graphreplicatroll.png")
plt.show()
#plt.close()

