# New Zealand Data Sources Registry

This document maintains the official record of New Zealand statistical data sources integrated into the **Datum Ex Machina** platform.

## The Data Pipeline (Source)

To ensure our stories remain accurate and fresh, we are transitioning from static collection to a machine-readable **Data Pipeline**. This allows the platform to index, discover, and eventually pull live statistical updates.

### Primary Source: Stats NZ Open Data API (OData)
- **Tool:** Aotearoa Data Explorer (ADE)
- **Access Protocol:** OData / REST
- **Index Method:** Metadata harvesting of table titles and variable names via the [ADE User Guide](https://www.stats.govt.nz/tools/aotearoa-data-explorer/ade-user-guide/) specifications.
- **API Portal:** [https://api.stats.govt.nz/](https://api.stats.govt.nz/)

### Secondary Source: Data.govt.nz (CKAN)
- **Protocol:** CKAN API
- **Direct Resource:** [https://catalogue.data.govt.nz/api/3/action/package_search](https://catalogue.data.govt.nz/api/3/action/package_search)
- **Role:** Central catalog for indexing wide-ranging datasets from the Ministry of Health, MSD, and MBIE.

---

## Technical Implementation
The platform now includes an automated indexer:
- **Script Location:** `backend/pipeline/indexing.py`
- **Output:** `backend/data/index/metadata_index.json`
- **Function:** Periodically crawls NZ government APIs to update our narrative candidate list without downloading large raw datasets prematurely.

---

## Active Data Stories (NZ)

### 1. Homeschooling Trends
- **Story ID:** `nz-homeschooling`
- **Topic:** Annual total of homeschooled students in NZ (2010–2025).
- **Source:** Ministry of Education NZ (Education Counts)
- **Direct Resource:** [Homeschooling Students (Time Series)](https://www.educationcounts.govt.nz/statistics/homeschooling)

### 2. Income Inequality Arc
- **Story ID:** `nz-gini`
- **Topic:** Wealth distribution (Gini Coefficient) in NZ from 1985–2023.
- **Source:** OECD Income Distribution Database / Stats NZ
- **Direct Resource:** [Household Incomes Report (MSD)](https://www.msd.govt.nz/about-msd-and-our-work/publications-resources/monitoring/household-incomes/)

### 3. Youth Unemployment (15-24 Years)
- **Story ID:** `nz-youth-unemployment`
- **Topic:** Labour market participation and jobless trends for young New Zealanders.
- **Source:** Stats NZ / Household Labour Force Survey (HLFS)
- **Direct Resource:** [Labour Market Statistics (Stats NZ)](https://www.stats.govt.nz/information-releases/labour-market-statistics-march-2024-quarter/)

### 4. Teen Screen Time vs. Sleep
- **Story ID:** `nz-screen-time`
- **Topic:** Daily digital habits vs. rest hours for secondary school students.
- **Source:** Census at School NZ
- **Direct Resource:** [Census at School NZ Portal](https://new.censusatschool.org.nz/)

### 5. Super Rugby Performance (Highlanders 2024)
- **Story ID:** `nz-sports-season`
- **Topic:** Match-by-match scoring margins for the 2024 campaign.
- **Source:** SANZAAR / Super Rugby Pacific Official Match Data
- **Direct Resource:** [Super Rugby Pacific Match Centre](https://super.rugby/superrugby/match-centre/)

---

## General NZ Data Portals
- **Stats NZ (Tatauranga Aotearoa):** [https://www.stats.govt.nz/](https://www.stats.govt.nz/)
- **Education Counts:** [https://www.educationcounts.govt.nz/](https://www.educationcounts.govt.nz/)
- **Figure.NZ:** [https://figure.nz/](https://figure.nz/) (Provides structured CSV versions of public sector data).
- **Ministry of Health (Manatu Hauora):** [https://www.health.govt.nz/nz-health-statistics](https://www.health.govt.nz/nz-health-statistics)
- **Waitangi Tribunal (Database):** [https://waitangitribunal.govt.nz/publications-and-resources/](https://waitangitribunal.govt.nz/publications-and-resources/)
