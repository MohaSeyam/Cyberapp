#!/usr/bin/env python3
import json
import sys

def remove_friday_from_plan():
    """Remove Friday from all weeks in PlanData.json"""
    
    # Read the JSON file
    try:
        with open('src/data/PlanData.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading PlanData.json: {e}")
        return False
    
    # Count total days before removal
    total_days_before = sum(len(week.get('days', [])) for week in data)
    friday_count = 0
    
    # Remove Friday from each week
    for week in data:
        if 'days' in week:
            # Filter out Friday
            original_days = week['days']
            week['days'] = [day for day in original_days if day.get('key') != 'fri']
            friday_count += len(original_days) - len(week['days'])
    
    # Count total days after removal
    total_days_after = sum(len(week.get('days', [])) for week in data)
    
    # Write back to file
    try:
        with open('src/data/PlanData.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error writing PlanData.json: {e}")
        return False
    
    print(f"Successfully removed {friday_count} Friday entries")
    print(f"Total days before: {total_days_before}")
    print(f"Total days after: {total_days_after}")
    return True

if __name__ == "__main__":
    success = remove_friday_from_plan()
    sys.exit(0 if success else 1)