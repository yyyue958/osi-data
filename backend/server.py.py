from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import os
import uuid

app = FastAPI()

# Allow your React app to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

US_STATES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
    "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia",
    "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa",
    "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire",
    "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York", "NC": "North Carolina",
    "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania",
    "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee",
    "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington",
    "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming", "DC": "District of Columbia",
}

@app.post("/api/clean-installed-base")
async def clean_installed_base(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        # Read the Excel file directly into Pandas
        df = pd.read_excel(io.BytesIO(contents), sheet_name=0)
        df.columns = df.columns.astype(str).str.strip()

        state_col = "Location State"
        year_col = "IB_Shipped_Year"

        if state_col not in df.columns or year_col not in df.columns:
            raise HTTPException(status_code=400, detail=f"Missing columns: {state_col} or {year_col}")

        lookup = {abbr: full for abbr, full in US_STATES.items()}
        lookup.update({full.upper(): full for full in US_STATES.values()})

        clean_state = df[state_col].astype(str).str.strip().str.upper()
        df["State_Standardized"] = clean_state.map(lookup)

        is_valid_state = df["State_Standardized"].notna()
        matched_states = df[is_valid_state].copy()
        not_matched = df[~is_valid_state].copy()

        year_mask = matched_states[year_col].astype(str).str.strip() != "-"
        final_clean_df = matched_states[year_mask].copy()

        # Save the result to a temporary file
        output_filename = f"cleaned_output_{uuid.uuid4().hex[:6]}.xlsx"
        with pd.ExcelWriter(output_filename, engine="xlsxwriter") as writer:
            final_clean_df.to_excel(writer, sheet_name="Cleaned_Matched", index=False)
            not_matched.to_excel(writer, sheet_name="Excluded_States", index=False)

        return {
            "total_rows": len(df),
            "matched_rows": len(final_clean_df),
            "excluded_rows": len(not_matched),
            "download_url": f"/api/download/{output_filename}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    if os.path.exists(filename):
        return FileResponse(filename, filename="Processed_Installed_Base.xlsx")
    raise HTTPException(status_code=404, detail="File not found")