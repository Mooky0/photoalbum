# Stressztest dokumentáció

## Fájlok:
```
.
├── delete.sh   # Egy egyszerű parancs az összes kép törlésére az adatbázisból
├── hpa.yaml    # A backend horizontális skálázója
├── img         # Mappa a képekhez
├── job.yaml    # A kubernetes Job a stressztest futtatására
├── k6.log      # Egy futásnak a log-ja
├── README.md   # Ez a dokumentáció
└── script.js   # A k6 script amit a Job futtat a terheléstesztre
```

## Megvalósítás

Az OKD webes felületén hoztam létre a HPA-t, amelynek a targetje a `photoalbum-backend` Deployment. Mindig legalább egy replica létezik belőle és maximum 5. Skálázás akkor történik, amikor a CPU kihasználtsága eléri az 50%-t. A `behavior` beállításokkal beállítottam, hogy ha kell azonnal induljon az új pod, de ne szűnjön meg olyan gyorsan, így elkerülve, hogy túl hamar leálljon, ha az átlag kihasználtság az új podok miatt hamar visszaesni 50% alá. Ez látható a `hpa.yaml` file-ban.

## Futtatás
```bash
kubectl create configmap k6-script --from-file=script.js
kubectl apply -f job.yaml
kubectl logs -f job/k6-load-test -n photoalbum-f041om
```

Ezzel futtathatjuk és ellenőrizhetjük a Job futását.

Monitorozásra a 
`kubectl get hpa photoalbum-backend-hpa -w`
és a 
`k get pods --watch`
parancsot használtam, valamint az OKD vebes felületét.

## Eredmények

```
% kubectl get hpa photoalbum-backend-hpa -w
NAME                     REFERENCE                       TARGETS        MINPODS   MAXPODS   REPLICAS   AGE
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 45%/50%   1         5         1          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 63%/50%   1         5         1          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 78%/50%   1         5         2          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 83%/50%   1         5         2          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 80%/50%   1         5         2          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 75%/50%   1         5         2          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 79%/50%   1         5         3          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 80%/50%   1         5         3          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 76%/50%   1         5         3          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 76%/50%   1         5         5          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 73%/50%   1         5         5          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 72%/50%   1         5         5          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 71%/50%   1         5         5          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 72%/50%   1         5         5          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 60%/50%   1         5         5          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 43%/50%   1         5         5          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 11%/50%   1         5         5          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 3%/50%    1         5         5          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 0%/50%    1         5         5          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 0%/50%    1         5         5          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 0%/50%    1         5         2          47h
photoalbum-backend-hpa   Deployment/photoalbum-backend   cpu: 0%/50%    1         5         1          47h
```

Itt látható a felskálázás és a visszaskálázás 5 podra, ami a maximum miközben k6 futott.
A CPU terlhelését mutatja az OKD webes felülete is:

![alt text](img/image.png)

A CPU terhelésén látszik, hogy még így is túl van terhelve, hiába a skálázódás, bár `cpu.limit: 500m` ennek valamiért az OKD felületén a közelébe sem ér. Ezt finomhangolással lehetne módosítani, de nem szántam rá időt.

## Eredmények

```
  █ TOTAL RESULTS 

    checks_total.......: 3643   15.087659/s
    checks_succeeded...: 99.97% 3642 out of 3643
    checks_failed......: 0.02%  1 out of 3643

    ✗ is status 201
      ↳  99% — ✓ 3642 / ✗ 1

    HTTP
    http_req_duration..............: avg=727.89ms min=4.81ms   med=676.81ms max=2s    p(90)=1.32s p(95)=1.46s
      { expected_response:true }...: avg=728.09ms min=160.19ms med=676.91ms max=2s    p(90)=1.32s p(95)=1.46s
    http_req_failed................: 0.02%  1 out of 3644
    http_reqs......................: 3644   15.091801/s

    EXECUTION
    iteration_duration.............: avg=1.73s    min=1s       med=1.67s    max=3.01s p(90)=2.32s p(95)=2.46s
    iterations.....................: 3643   15.087659/s
    vus............................: 2      min=0         max=50
    vus_max........................: 50     min=50        max=50

    NETWORK
    data_received..................: 3.5 MB 14 kB/s
    data_sent......................: 6.2 MB 26 kB/s
```

A teszt 4 percig futott, egy request nem sikerült a 3644-ből, ez körülbelül 15 request / second. Egy kérés átlagosan 727 milisec volt, a legygyorsabb kérés 4.81 ms volt, a leglassabb 2 másodperc volt. A futás teljes logja a [k6.log](k6.log)-ban található