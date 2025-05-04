import pandas as pd, pathlib

# 1. lees ALLE sheets als dict: {sheet_name: DataFrame}
sheets = pd.read_excel("verb_conjugations.xlsx", sheet_name=None)

frames = []
for name, df in sheets.items():
    df["serie"] = name.strip()       # bv. "Série 2"  ← nieuwe kolom
    frames.append(df)

df_all = pd.concat(frames, ignore_index=True)

# 2. kolomnaam met juiste vorm hernoemen (indien nodig)
df_all.rename(columns=lambda c: c.strip(), inplace=True)  # witruimtes weg
if "correct antwoord" in df_all.columns:
    df_all.rename(columns={"correct antwoord": "correcte"}, inplace=True)

# 3. wegschrijven
pathlib.Path("public").mkdir(exist_ok=True)
df_all.to_json(
    "public/verb_conjugations.json",
    orient="records",
    force_ascii=False,
    indent=2,
)

print(f"✅  {len(df_all)} records uit {len(sheets)} series geëxporteerd.")

