import pandas as pd
import io
from typing import Dict, Any, Optional
import requests

class StatsNZScout:
    """
    Data Explorer for the Stats NZ Aotearoa Data Explorer (ADE) API.
    Provides essential metadata (ranges, counts) and download access for students.
    """

    def __init__(self, subscription_key: Optional[str] = None):
        self.base_url = "https://apis.stats.govt.nz/ade-api"
        self.headers = {
            "Ocp-Apim-Subscription-Key": subscription_key,
            "User-Agent": "DatumExMachina/1.0 Language=Python/3.13",
            "Accept": "application/vnd.sdmx.data+csv;version=2;labels=name"
        } if subscription_key else {}

    def fetch_odata(self, flow_ref: str) -> pd.DataFrame:
        """
        Fetches CSV data from ADE and returns a Clean DataFrame.
        """
        try:
            url = flow_ref
            if not url.startswith("http"):
                url = f"{self.base_url}/rest/data/{flow_ref}/ALL"

            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 403:
                raise Exception("403 Forbidden: API key missing product access.")
            
            if response.status_code == 404:
                 raise Exception(f"404 Not Found for {url}. Verify Flow ID.")

            response.raise_for_status()
            return pd.read_csv(io.StringIO(response.text))
        except Exception as e:
            print(f"StatsNZ Explorer Fetch Error: {e}")
            raise

    def get_metadata(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Extracts essential aspects of the dataset for student research:
        1. Date Range (Earliest to Latest).
        2. Observation Count.
        3. Frequency Identification.
        """
        # Identify Time Column
        time_targets = ["time_period", "time", "period", "year", "quarter"]
        time_col = next((c for c in df.columns if c.lower() in time_targets), df.columns[0])

        # Identify Value Column
        val_targets = ["obs_value", "data_value", "value"]
        val_col = next((c for c in df.columns if c.lower() in val_targets), df.columns[-1])

        # Clean/Sort
        df = df.dropna(subset=[time_col]).copy()
        df = df.sort_values(time_col)

        # Extract Aspects
        start_date = str(df[time_col].iloc[0])
        end_date = str(df[time_col].iloc[-1])
        obs_count = len(df)
        
        # Frequency Guess
        freq = "Annual"
        if 'Q' in start_date:
            freq = "Quarterly"
        elif 'M' in start_date or '-' in start_date:
            freq = "Monthly"

        return {
            "range": f"{start_date} – {end_date}",
            "observation_count": obs_count,
            "frequency": freq,
            "columns": list(df.columns),
            "sample_value": float(df[val_col].iloc[-1]) if val_col in df and not pd.isna(df[val_col].iloc[-1]) else 0.0
        }
