// Tester för dag 8. Ändra inte den här filen.
// Vi testar med en FALSK fetch. Inga riktiga nätanrop görs, så testerna är snabba och stabila.
import { testAsync, test, assertEqual, assertTrue, visaResultat } from "./testlib";
import { hamtaJson, hamtaMeny, hamtaVader, tolkaVaderkod } from "./api";
import { visaTillstand, visaVader } from "./tillstand-ui";
import { laddaData } from "./tillstand";

// En falsk fetch som svarar med ett JSON-värde och en statuskod.
function falskFetch(data: unknown, status = 200) {
  const anrop: string[] = [];
  const fn = async (url: string) => {
    anrop.push(url);
    return { ok: status >= 200 && status < 300, status, json: async () => data };
  };
  fn.anrop = anrop;
  return fn;
}
// En falsk fetch som kastar fel, som när nätet ligger nere.
const fetchUtanNat = async () => { throw new TypeError("Failed to fetch"); };

async function fangaFel(promise: Promise<unknown>): Promise<Error | null> {
  try { await promise; } catch (fel) { return fel instanceof Error ? fel : new Error(String(fel)); }
  return null;
}

// ---- hamtaJson ----
testAsync("hamtaJson: ger tillbaka JSON-svaret", async () => {
  assertEqual(await hamtaJson("x.json", falskFetch({ a: 1 })), { a: 1 });
});
testAsync("hamtaJson: anropar fetch med rätt url", async () => {
  const f = falskFetch({});
  await hamtaJson("data/hej.json", f);
  assertEqual(f.anrop, ["data/hej.json"]);
});
testAsync("hamtaJson: status 404 ger ett fel", async () => {
  const fel = await fangaFel(hamtaJson("x.json", falskFetch({}, 404)));
  assertTrue(fel !== null, "förväntade ett fel eftersom svar.ok är false");
  assertEqual(fel?.message, "Servern svarade 404");
});
testAsync("hamtaJson: status 500 ger ett fel", async () => {
  const fel = await fangaFel(hamtaJson("x.json", falskFetch({}, 500)));
  assertEqual(fel?.message, "Servern svarade 500");
});
testAsync("hamtaJson: inget nät ger ett begripligt fel", async () => {
  const fel = await fangaFel(hamtaJson("x.json", fetchUtanNat));
  assertTrue(fel !== null, "förväntade ett fel");
  assertEqual(fel?.message, "Kunde inte nå servern. Kontrollera din anslutning.");
});

// ---- hamtaMeny ----
testAsync("hamtaMeny: hämtar data/meny.json", async () => {
  const f = falskFetch([{ id: 1 }]);
  const meny = await hamtaMeny(f);
  assertEqual(f.anrop, ["data/meny.json"]);
  assertEqual(meny, [{ id: 1 }]);
});
testAsync("hamtaMeny: svar som inte är en lista ger fel", async () => {
  const fel = await fangaFel(hamtaMeny(falskFetch({ ratter: [] })));
  assertTrue(fel !== null, "förväntade ett fel");
  assertEqual(fel?.message, "Menyn hade ett oväntat format");
});
testAsync("hamtaMeny: serverfel följer med", async () => {
  const fel = await fangaFel(hamtaMeny(falskFetch([], 503)));
  assertEqual(fel?.message, "Servern svarade 503");
});

// ---- hamtaVader ----
const vaderSvar = { current: { temperature_2m: 8.4, weather_code: 3, wind_speed_10m: 14.2 } };
testAsync("hamtaVader: plockar ut temperatur, vind och kod", async () => {
  assertEqual(await hamtaVader(59.33, 18.07, falskFetch(vaderSvar)), { temperatur: 8.4, vindhastighet: 14.2, kod: 3 });
});
testAsync("hamtaVader: url innehåller koordinaterna", async () => {
  const f = falskFetch(vaderSvar);
  await hamtaVader(59.33, 18.07, f);
  assertTrue(f.anrop[0].startsWith("https://api.open-meteo.com/v1/forecast?"), "fel adress: " + f.anrop[0]);
  assertTrue(f.anrop[0].includes("latitude=59.33"), "latitude saknas i " + f.anrop[0]);
  assertTrue(f.anrop[0].includes("longitude=18.07"), "longitude saknas i " + f.anrop[0]);
  assertTrue(f.anrop[0].includes("current=temperature_2m,weather_code,wind_speed_10m"), "current saknas i " + f.anrop[0]);
});
testAsync("hamtaVader: svar utan current ger fel", async () => {
  const fel = await fangaFel(hamtaVader(1, 2, falskFetch({ fel: true })));
  assertEqual(fel?.message, "Oväntat svar från väder-API:et");
});

// ---- tolkaVaderkod ----
test("tolkaVaderkod: klart", () => assertEqual(tolkaVaderkod(0), "klart"));
test("tolkaVaderkod: molnigt", () => assertEqual(tolkaVaderkod(3), "mest klart eller molnigt"));
test("tolkaVaderkod: dimma", () => assertEqual(tolkaVaderkod(45), "dimma"));
test("tolkaVaderkod: regn", () => assertEqual(tolkaVaderkod(63), "regn"));
test("tolkaVaderkod: snö", () => assertEqual(tolkaVaderkod(73), "snö"));
test("tolkaVaderkod: åska", () => assertEqual(tolkaVaderkod(95), "åska"));
test("tolkaVaderkod: okänd kod", () => assertEqual(tolkaVaderkod(1234), "okänt väder"));

// ---- visaTillstand ----
function ny(): HTMLElement { const c = document.createElement("div"); c.innerHTML = "<p>gammalt</p>"; return c; }
test("visaTillstand: laddar visar status", () => {
  const c = ny();
  visaTillstand(c, { typ: "laddar" }, {});
  const p = c.querySelector("p.laddar");
  assertTrue(p !== null, "förväntade ett p.laddar");
  assertEqual(p?.getAttribute("role"), "status");
  assertEqual(c.textContent, "Laddar...");
});
test("visaTillstand: tomt", () => {
  const c = ny();
  visaTillstand(c, { typ: "tomt" }, {});
  assertEqual(c.querySelector("p.tom")?.textContent, "Inga rätter hittades.");
  assertEqual(c.children.length, 1);
});
test("visaTillstand: fel visar meddelande med role alert", () => {
  const c = ny();
  visaTillstand(c, { typ: "fel", meddelande: "Servern svarade 500" }, { vidForsokIgen() {} });
  const ruta = c.querySelector(".fel");
  assertTrue(ruta !== null, "förväntade ett element med klassen fel");
  assertEqual(ruta?.getAttribute("role"), "alert");
  assertTrue(ruta?.textContent.includes("Något gick fel: Servern svarade 500"), "meddelandet saknas");
});
test("visaTillstand: fel har en Försök igen-knapp som fungerar", () => {
  const c = ny();
  let antal = 0;
  visaTillstand(c, { typ: "fel", meddelande: "x" }, { vidForsokIgen: () => { antal++; } });
  const knapp = c.querySelector<HTMLButtonElement>("button.forsok-igen");
  assertTrue(knapp !== null, "förväntade en knapp.forsok-igen");
  assertEqual(knapp?.textContent, "Försök igen");
  assertEqual(knapp?.type, "button");
  knapp?.click();
  assertEqual(antal, 1);
});
test("visaTillstand: fel skriver text, inte HTML (säkert)", () => {
  const c = ny();
  visaTillstand(c, { typ: "fel", meddelande: "<img src=x onerror=alert(1)>" }, { vidForsokIgen() {} });
  assertEqual(c.querySelector("img"), null);
});
test("visaTillstand: klar anropar visaKlar med container och tillstånd", () => {
  const c = ny();
  let fick = undefined as [HTMLElement, unknown] | undefined;
  const t = { typ: "klar" as const, ratter: [1, 2] };
  visaTillstand(c, t, { visaKlar: (cont: HTMLElement, tillstand: unknown) => { fick = [cont, tillstand]; } });
  assertEqual(fick?.[0] === c, true);
  assertEqual(fick?.[1], t);
  assertEqual(c.textContent, "");
});
test("visaTillstand: tömmer alltid containern först", () => {
  const c = ny();
  visaTillstand(c, { typ: "laddar" }, {});
  assertEqual(c.children.length, 1);
});

// ---- visaVader ----
test("visaVader: skriver stad, temperatur, väder och vind", () => {
  const c = ny();
  visaVader(c, "Stockholm", { temperatur: 8.4, vindhastighet: 14.2, kod: 3 });
  assertEqual(c.querySelector("p.vader-rad")?.textContent, "Stockholm: 8.4 °C, mest klart eller molnigt, vind 14.2 km/h");
  assertEqual(c.children.length, 1);
});

// ---- laddaData (given, men bra att veta att den fungerar) ----
testAsync("laddaData: laddar sedan klar med data", async () => {
  const steg: unknown[] = [];
  await laddaData(async () => ({ a: 1 }), (t) => steg.push(t));
  assertEqual(steg, [{ typ: "laddar" }, { typ: "klar", data: { a: 1 } }]);
});

visaResultat();
