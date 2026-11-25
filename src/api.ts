import type { Ratt, Vader, FetchFn } from "./typer";

// Dag 8: riktiga nätanrop med fetch.
// Alla funktioner tar emot fetchFn (som standard den riktiga fetch). I testerna skickar vi in en
// falsk fetch, så att testerna inte behöver internet.

// 1. Hämta JSON från en url.
//    - Anropa fetchFn(url).
//    - Går själva anropet fel (inget nät): kasta new Error("Kunde inte nå servern. Kontrollera din anslutning.")
//    - Svarar servern med fel (svar.ok är false): kasta new Error(`Servern svarade ${svar.status}`)
//    - Annars: returnera await svar.json().
//    Tips: fetch kastar INTE fel för 404 eller 500. Du måste själv kolla svar.ok.
export async function hamtaJson(url: string, fetchFn: FetchFn = fetch): Promise<unknown> {
  let svar;

  try {
    svar = await fetchFn(url);
  } catch (fel) {
    throw new Error("Kunde inte nå servern. Kontrollera din anslutning.");
  }
  if (!svar.ok) {
    throw new Error(`Servern svarade ${svar.status}`);
  }

  return await svar.json();
}

// 2. Hämta menyn från "data/meny.json" med hamtaJson.
//    Är svaret inte en array: kasta new Error("Menyn hade ett oväntat format").
export async function hamtaMeny(fetchFn: FetchFn = fetch): Promise<Ratt[]> {
  const meny = await hamtaJson("data/meny.json", fetchFn);
  if (!Array.isArray(meny)) {
    throw new Error("Menyn hade ett oväntat format");
  }
  return meny as Ratt[];
}

// 3. Hämta aktuellt väder från Open-Meteo.
//    Url: https://api.open-meteo.com/v1/forecast?latitude=LAT&longitude=LON&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto
//    Svaret har data.current med temperature_2m, wind_speed_10m och weather_code.
//    Returnera { temperatur, vindhastighet, kod }.
//    Saknas data.current: kasta new Error("Oväntat svar från väder-API:et").
export async function hamtaVader(lat: number, lon: number, fetchFn: FetchFn = fetch): Promise<Vader> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`;
  const data = await hamtaJson(url, fetchFn);
  if (typeof data !== "object" || data === null) {
    throw new Error("Oväntat svar från väder-API:et");
  }
  if (!("current" in data)) {
    throw new Error("Oväntat svar från väder-API:et");
  }

  const current = data.current;
  if (typeof current !== "object" || current === null) {
    throw new Error("Oväntat svar från väder-API:et");
  }
  // current är ett objekt med strängar som nycklar och alla värden är unknown
  const weather = current as Record<string, unknown>;
  // Vi förväntar oss att dessa värden är numbers
  if (typeof weather.temperature_2m !== "number" || typeof weather.wind_speed_10m !== "number" || typeof weather.weather_code !== "number") {
    throw new Error("Oväntat svar från väder-API:et");
  }

  return { temperatur: weather.temperature_2m, vindhastighet: weather.wind_speed_10m, kod: weather.weather_code };
}

// 4. Översätt en väderkod (WMO) till svensk text:
//    0 "klart", 1-3 "mest klart eller molnigt", 45 och 48 "dimma", 51-57 "duggregn",
//    61-67 "regn", 71-77 "snö", 80-82 "regnskurar", 85-86 "snöbyar", 95-99 "åska".
//    Allt annat: "okänt väder".
export function tolkaVaderkod(kod: number): string {
  
}
