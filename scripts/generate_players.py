import requests
from bs4 import BeautifulSoup
import json
import random
import re
import os

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def fetch_statsguru_table(url):
    print(f"Fetching {url}")
    try:
        res = requests.get(url, headers=HEADERS, timeout=15)
        res.raise_for_status()
        soup = BeautifulSoup(res.text, 'lxml')
        
        tables = soup.find_all('table', class_='engineTable')
        data_table = None
        for table in tables:
            if table.find('th') and 'Player' in table.find('th').text:
                data_table = table
                break
                
        if not data_table:
            print("Could not find data table on page.")
            return []
            
        rows = data_table.find('tbody').find_all('tr')
        parsed_data = []
        for row in rows:
            cols = row.find_all('td')
            if len(cols) > 5:
                player_text = cols[0].text.strip()
                match = re.match(r'(.+?)\s*\((.+?)\)', player_text)
                if match:
                    name = match.group(1).strip()
                    team = match.group(2).strip()
                else:
                    name = player_text
                    team = "Unknown"
                    
                parsed_data.append({
                    "name": name,
                    "team": team,
                    "cols": [c.text.strip() for c in cols]
                })
        return parsed_data
    except Exception as e:
        print(f"Error fetching data: {e}")
        return []

def generate_medical_matrices():
    workload_data = []
    base_workload = random.randint(30, 60)
    
    peak_risk = 0
    for i in range(1, 7):
        base_workload = max(10, min(100, base_workload + random.randint(-15, 20)))
        
        if base_workload > 75:
            risk = random.randint(60, 95)
        elif base_workload > 55:
            risk = random.randint(30, 59)
        else:
            risk = random.randint(5, 29)
            
        if risk > peak_risk:
            peak_risk = risk
            
        workload_data.append({
            "month": f"W{i}",
            "risk": risk,
            "workload": base_workload
        })
        
    return workload_data, peak_risk

def generate_radar_data(role):
    if role == "BAT" or role == "WK-BAT":
        return [random.randint(70, 95), random.randint(70, 95), random.randint(60, 95), random.randint(5, 30), random.randint(5, 20), random.randint(60, 90)]
    elif role == "PACE" or role == "SPIN":
        return [random.randint(10, 40), random.randint(10, 50), random.randint(10, 40), random.randint(70, 95), random.randint(70, 95), random.randint(50, 85)]
    else:
        return [random.randint(60, 85), random.randint(60, 90), random.randint(60, 85), random.randint(60, 85), random.randint(60, 85), random.randint(70, 95)]

def get_fallback_players():
    return [
        {"id": "CRK-8472", "name": "V. Kohli", "team": "IND", "role": "BAT", "age": 35, "avg": 52.7, "sr": 138.2, "rating": 9.4},
        {"id": "CRK-1934", "name": "J. Bumrah", "team": "IND", "role": "PACE", "age": 30, "avg": 20.4, "sr": 14.5, "rating": 9.8},
        {"id": "CRK-5521", "name": "H. Pandya", "team": "IND", "role": "ALL", "age": 30, "avg": 31.2, "sr": 145.6, "rating": 8.6},
        {"id": "CRK-3310", "name": "R. Khan", "team": "AFG", "role": "SPIN", "age": 25, "avg": 15.3, "sr": 12.1, "rating": 9.2},
        {"id": "CRK-9122", "name": "T. Head", "team": "AUS", "role": "BAT", "age": 30, "avg": 40.1, "sr": 165.4, "rating": 9.0},
    ]

def main():
    print("Scraping T20I Batting Records (Top 50)...")
    batting_url = "https://stats.espncricinfo.com/ci/engine/stats/index.html?class=3;template=results;type=batting"
    batting_raw = fetch_statsguru_table(batting_url)
    
    print("Scraping T20I Bowling Records (Top 50)...")
    bowling_url = "https://stats.espncricinfo.com/ci/engine/stats/index.html?class=3;template=results;type=bowling"
    bowling_raw = fetch_statsguru_table(bowling_url)
    
    players_dict = {}
    
    for p in batting_raw:
        avg = p['cols'][7]
        sr = p['cols'][9]
        if avg == '-' or sr == '-': continue
        
        pid = f"CRK-{random.randint(1000, 9999)}"
        role = "WK-BAT" if random.random() < 0.1 else "BAT"
        players_dict[p['name']] = {
            "id": pid,
            "name": p['name'],
            "team": p['team'],
            "role": role,
            "age": random.randint(22, 38),
            "avg": float(avg) if avg != '-' else 0.0,
            "sr": float(sr) if sr != '-' else 0.0,
            "rating": round(random.uniform(7.0, 9.9), 1)
        }
        
    for p in bowling_raw:
        avg = p['cols'][9]
        econ = p['cols'][10]
        if avg == '-' or econ == '-': continue
        
        if p['name'] in players_dict:
            players_dict[p['name']]['role'] = "ALL"
            players_dict[p['name']]['bowl_avg'] = float(avg)
            players_dict[p['name']]['econ'] = float(econ)
        else:
            pid = f"CRK-{random.randint(1000, 9999)}"
            players_dict[p['name']] = {
                "id": pid,
                "name": p['name'],
                "team": p['team'],
                "role": "PACE" if random.choice([True, False]) else "SPIN",
                "age": random.randint(20, 38),
                "avg": float(avg),
                "sr": float(econ), 
                "rating": round(random.uniform(7.0, 9.9), 1)
            }
            
    players_list = list(players_dict.values())
    
    if not players_list:
        print("Warning: Scraping returned 0 players. Network block detected. Using realistic fallback data.")
        players_list = get_fallback_players()

    print("Generating ACWR Workload Timelines and Matchup Radar Data...")
    for player in players_list:
        workload, peak_risk = generate_medical_matrices()
        player['injuryRisk'] = peak_risk
        player['workloadData'] = workload
        player['radarProfile'] = generate_radar_data(player['role'])

    os.makedirs('data/raw', exist_ok=True)
    out_path = 'data/raw/players_database.json'
    with open(out_path, 'w') as f:
        json.dump(players_list, f, indent=2)
        
    print(f"Success! Exported {len(players_list)} player profiles to {out_path}")

if __name__ == "__main__":
    main()
