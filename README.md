# Dag 8 · fetch och tre tillstånd

*Modul 5, UI/UX & Frontendutveckling (TypeScript), Lexicon IT-Proffs*

## Vad du ska göra idag

Du hämtar **riktig data** med `fetch`: menyn från en JSON-fil och vädret från ett öppet API. Du kontrollerar svaret (`ok`, `status`), hanterar fel och visar tre tillstånd för användaren: *laddar*, *fel* (med en knapp för att försöka igen) och *tomt*. Du testar utan internet genom att skicka in en falsk `fetch`.

## Bakgrund

Igår övade du på en låtsasserver. Idag byter vi ut den mot `fetch`. Det svåra är inte att hämta data, det är allt som kan gå fel: nätet ligger nere, servern svarar med fel, svaret har ett annat format än du trodde. En sida som bara fungerar när allt går bra är inte färdig. Du bygger på samma café-sida som i förra veckans övningar: menyn kommer nu från `data/meny.json`, och ett väderkort visar vädret i vald stad.

## TypeScript idag: svar från servern är okända

- **`Response.json()` ger `any`** i TypeScript, vilket stänger av kontrollen. Därför tar `hamtaJson` emot svaret som `unknown` och du måste kontrollera det (`Array.isArray`, `if (!data.current)`) innan du använder det. En server kan skicka vad som helst.
- **Beskriv det du läser.** `interface VaderSvar { current?: { temperature_2m: number; ... } }` beskriver bara de fält vi använder. Det är ett löfte från dig, TypeScript kan inte kontrollera vad servern verkligen skickar.
- **`typeof fetch`/`FetchFn`:** funktionen som hämtar data är en parameter, så testerna kan skicka in en falsk. Typen `FetchFn` säger att den måste ta en url och ge tillbaka något med `ok`, `status` och `json`.
- **Generics:** `laddaData<T>` fungerar för vilken sorts data som helst. TypeScript listar ut `T` från funktionen du skickar in.
- **Tre tillstånd som typer:** `laddar`, `fel` (med `meddelande`) och `klar` (med data). Du kan inte läsa `data` i ett `fel`-tillstånd utan att TypeScript säger ifrån.
- **`Partial<T>`** gör alla fält valfria. `visaTillstand` använder det för alternativen, så att ett laddningstillstånd inte behöver en "försök igen"-funktion.

## Så arbetar du (samma som alltid)

1. **Forka** dagens repo på GitHub (*Fork → Create fork*).
2. **Klona din fork:** *Code → HTTPS → kopiera adressen*. I terminalen (Ctrl+ö i VS Code): `git clone <adressen>`. Öppna den nya mappen i VS Code.
3. **Installera verktygen, en gång per repo:** `npm install` i terminalen.
4. **Starta servern:** `npm run dev`. Öppna adressen den skriver ut (oftast `http://localhost:5173/`). Tryck F12 och välj fliken *Console*. Stoppa med Ctrl+C. Testsidan öppnar du på samma server: `http://localhost:5173/tests.html` (lägg till `/tests.html` efter adressen).
5. **Gör uppgiften.** Spara och kontrollera i webbläsaren och Console efter varje steg. Gör en commit efter varje avslutat steg: `git add .` och `git commit -m "Beskriv vad du gjorde"`.
6. **Kontrollera typerna:** `npm run typecheck`. Tyst betyder att alla typer stämmer. Röda understrykningar i VS Code är TypeScript som varnar.
7. **Skicka upp** när du är klar: `git push`.
8. **Lämna in i Microsoft Forms.**

Fastnar du: skriv ner exakt var och vad du försökt (och vilket felmeddelande du fick), och ta det först i nästa handledda pass. Problem med `npm` eller Node? Läs *Elevguide: Node, Vite och TypeScript*.

> Vite tar bara bort typerna och kör koden. Den kontrollerar dem inte. Sidan kan alltså köras trots röda understrykningar.

## Uppgiften steg för steg

### Steg 1. Klona, starta och titta på sidan

Forka repot, kör `git clone`, öppna mappen i VS Code och starta Vite-servern på `index.html`. Sidan startar men visar bara "Laddar..." eller ingenting, eftersom `src/api.ts` inte är skriven än. Öppna `data/meny.json` direkt i webbläsaren. Titta på hur JSON ser ut. Skillnader mot ett JavaScript-objekt?

### Steg 2. Läs tests.html och kör testerna

Öppna `tests.html` på servern (`http://localhost:5173/tests.html`). De flesta tester är röda. Läs `src/tests.ts` uppifrån: hur fungerar `falskFetch`? Varför ska vi testa med en falsk fetch istället för den riktiga? Skriv svaret i `docs/async-anteckningar.md` eller som kommentar.

**Kommentar:** `falskFetch` tar emot data och statuskod (JSON-innehåll och HTTP-statuskod). Alla URL:r som anropas sparas i en tom array. Sedan skapas en falsk fetch-funktion (fn) som sparar varje anropad URL i arrayen. `ok` blir true om satuskoden är mellan 200 och 299. statuskoden returneras och json() returnerar datan som skickades in. Till sist kopplas arrayen till funktionen med fn.anrop = anrop, så att man kan komma åt och kontrollera vilka URL:er som har anropats via fn.anrop.

**Varför falsk fetch?** - För att kunna testa koden under kontrollerade förhållanden. Inga riktiga nätanrop görs, så testerna är snabba och stabila. Vi är alltså inte beroende av internet eller ecterna servrar. Vi kan själva bestämma vilket svar som ska returneras, testa både lyckade anrop och felhantering samt kontrollera vilka URL:er som anropats.
Kortfattat: det gör testerna snabbare, mer förutsägbara och enklare att felsöka!

### Steg 3. hamtaJson

Skriv `hamtaJson(url, fetchFn)` i `src/api.ts`. Tre saker kan hända: nätet är nere (fetch kastar), servern svarar med fel (`ok` är `false`) eller allt går bra. Kom ihåg: `fetch` kastar inte fel för 404 eller 500, du måste själv kolla `svar.ok`. Kör testerna.

### Steg 4. hamtaMeny och hamtaVader

Skriv `hamtaMeny` (hämtar `data/meny.json`, kontrollerar att svaret är en lista) och `hamtaVader` (bygger url:en med koordinater, plockar ut `temperatur`, `vindhastighet` och `kod` ur `data.current`). Öppna Open-Meteo-url:en från README i webbläsaren och titta på det riktiga svaret först.

### Steg 5. tolkaVaderkod

Skriv `tolkaVaderkod` som översätter väderkoden (WMO) till svensk text. Tabellen finns i kommentaren i `src/api.ts`. Det här är en vanlig ren funktion, enkel att testa.

### Steg 6. visaTillstand och visaVader

Öppna `src/tillstand-ui.ts`. Skriv `visaTillstand` för de fyra tillstånden och `visaVader`. Använd `textContent`, aldrig `innerHTML`: felmeddelanden kan innehålla text du inte kontrollerar. Felrutan ska ha `role="alert"` och en knapp *Försök igen* som anropar `vidForsokIgen`.

### Steg 7. Koppla ihop i main.js

Gör TODO 1 till 3 i `src/main.ts`. När de är klara ska menyn laddas med tillstånd, filtret fungera på den hämtade menyn och vädret hämtas när du väljer stad och trycker *Hämta väder*.

### Steg 8. Utsätt sidan för fel

Öppna DevTools, fliken *Network*. Prova: (1) *Offline* i listan *No throttling*, ladda om och se felet. (2) *Slow 3G*, ladda om och se *Laddar...*. (3) Ändra `"data/meny.json"` till `"data/finns-inte.json"` och se vad som händer. (4) Töm `meny.json` till `[]` och se *tomt*. Skriv i `docs/async-anteckningar.md` vad du såg i varje fall. Ändra tillbaka efteråt.

### Steg 9. Fördjupning (frivillig): reservdata

Sätt `ANVAND_RESERVDATA = true` i `src/main.ts` och se att vädret fungerar utan internet (det läser `data/vader-stockholm.json`). Förklara varför det går att byta ut `fetch` på det sättet utan att ändra `hamtaVader`.

## Kontrollista: så vet du att du är klar

- [ ] Alla tester på `tests.html` är gröna.
- [ ] `index.html` visar menyn hämtad från `data/meny.json` (tio rätter) och vädret för vald stad.
- [ ] Du har sett alla tre tillstånden (laddar, fel, tomt) i webbläsaren med hjälp av DevTools.
- [ ] Knappen *Försök igen* fungerar när du simulerat ett fel.
- [ ] Du använder `textContent` och inte `innerHTML` i `src/tillstand-ui.ts`.
- [ ] Du kan förklara varför `fetch` inte kastar fel för 404.
- [ ] Du har gjort minst fem commits.

## Tips om du fastnar

- Glömmer du `await` före `svar.json()` får du en promise istället för data.
- Sidan visar ingenting alls? Öppna Console. Ett rött fel som börjar med *Uncaught (in promise)* betyder att ett fel inte fångats.
- `fetch` fungerar bara via Vite-servern (`http://127.0.0.1`), inte om du dubbelklickar på `index.html` (`file://`).
- Vill du se hela svaret från Open-Meteo: öppna url:en direkt i webbläsaren, eller skriv `console.log(data)` i `hamtaVader`.
- Fastnar du på ett test: läs felmeddelandet. Det står vad testet förväntade sig och vad du returnerade.
- Fungerar inte Open-Meteo hemma eller på skolan? Sätt `ANVAND_RESERVDATA = true`. Då är det fortfarande en riktig övning i tillstånd.

## Inlämning

**Deadline: imorgon klockan 09.00.** Allt lämnas in i Microsoft Forms. Du behöver inte redovisa något muntligt.

I formuläret fyller du i:

1. Länk till din fork av det här repot.
2. Reflektion: Varför kastar `fetch` inte ett fel när servern svarar 404 eller 500? Vilka tre sorters fel kan uppstå när du hämtar data, och hur ser de olika ut för användaren? Varför är `svar.json()` något du måste hantera försiktigt i TypeScript?

## Vill du mer? (frivilligt)

- Lägg till en felhantering som skiljer på "nätet nere" och "servern svarade fel" i texten användaren ser.
- Lägg till en knapp som uppdaterar vädret var 30:e sekund (`setInterval`) och rensa timern korrekt.
- Använd `Promise.all` för att hämta menyn och vädret samtidigt vid sidstart, och visa tillstånd för varje för sig.
