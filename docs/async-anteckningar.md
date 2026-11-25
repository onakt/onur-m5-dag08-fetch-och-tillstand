1. *Offline* i listan *No throttling*, ladda om och se felet.   
*Nedkopplat läge  
*Firefox kan inte ansluta till servern på localhost:5173

2. *Slow 3G*, ladda om och se *Laddar...*.  
*Jag ser texten Laddar... innan vädret visas upp!

3. Ändra `"data/meny.json"` till `"data/finns-inte.json"` och se vad som händer.  
*Text i menyn: Något gick fel: JSON.parse: unexpected character at line 1 column 1 of the JSON data.  
*Knapp "Försök igen".

4. Töm `meny.json` till `[]` och se *tomt*.  
*Text i menyn: Inga rätter hittades.