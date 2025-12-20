# prediction.py
import sys
import json
import joblib
import numpy as np
import pandas as pd

# Load your trained model and encoders
model = joblib.load("crime_model.pkl")
state_enc = joblib.load("state_encoder.pkl")
dist_enc = joblib.load("district_encoder.pkl")
crime_enc = joblib.load("crime_encoder.pkl")

# Load total IPC crimes
df = pd.read_csv("crime dataset.csv")
total_ipc_df = df[['STATE/UT','DISTRICT','TOTAL IPC CRIMES']]

def predict_crime(state, district, crime_type):
    try:
        s = state_enc.transform([state])[0]
    except:
        return f"State '{state}' not found."

    try:
        d = dist_enc.transform([district])[0]
    except:
        return f"District '{district}' not found."

    try:
        c = crime_enc.transform([crime_type])[0]
    except:
        return f"Crime type '{crime_type}' not found."

    X = np.array([[s, d, c]])
    pred = model.predict(X)[0]

    return round(pred)

def predict_crime_percentage(state, district, crime_type):
    pred_count = predict_crime(state, district, crime_type)
    
    if isinstance(pred_count, str):
        return {"error": pred_count}

    row = total_ipc_df[
        (total_ipc_df["STATE/UT"].str.upper() == state.upper()) &
        (total_ipc_df["DISTRICT"].str.upper() == district.upper())
    ]
    if row.empty:
        return {"error": f"Total IPC crimes not found for {state}, {district}."}
    
    total_crimes = int(row["TOTAL IPC CRIMES"].values[0])
    perc = (pred_count / total_crimes) * 100

    return {
        "state": state,
        "district": district,
        "crime_type": crime_type,
        "predicted_count": pred_count,
        "percentage_of_total": round(perc, 2)
    }

# Read input JSON from stdin
input_str = sys.stdin.read()
try:
    input_data = json.loads(input_str)
    state = input_data.get("state")
    district = input_data.get("district")
    crime_type = input_data.get("crime")
    output = predict_crime_percentage(state, district, crime_type)
except Exception as e:
    output = {"error": str(e)}

# Write JSON output to stdout
print(json.dumps(output))
