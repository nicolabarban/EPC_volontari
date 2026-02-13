import requests
import time

ENDPOINT = "https://script.google.com/macros/s/AKfycby-EqL9ijmYC3UVeMd6gNTb5uSqLGb7WNJgIAVWQaJNtEVEONiXcO_cq2qDm7n6HwEa/exec"

entries = [
    {
        "name": "Elena Bianchi",
        "email": "elena.bianchi.test@gmail.com",
        "phone": "+39 345 1111111",
        "affiliation": "Sapienza University of Rome",
        "role": "registration",
        "availability": "June 3, June 4",
        "notes": "Test agent 1",
        "gdpr": "yes",
    },
    {
        "name": "Marco Verdi",
        "email": "marco.verdi.test@gmail.com",
        "phone": "+39 345 2222222",
        "affiliation": "University of Milan",
        "role": "session",
        "availability": "June 4, June 5",
        "notes": "Test agent 2",
        "gdpr": "yes",
    },
    {
        "name": "Sofia Romano",
        "email": "sofia.romano.test@gmail.com",
        "phone": "+39 345 3333333",
        "affiliation": "University of Padova",
        "role": "info",
        "availability": "June 3, June 5, June 6",
        "notes": "Test agent 3",
        "gdpr": "yes",
    },
    {
        "name": "Luca Ferrari",
        "email": "luca.ferrari.test@gmail.com",
        "phone": "+39 345 4444444",
        "affiliation": "University of Florence",
        "role": "any",
        "availability": "June 3, June 4, June 5, June 6",
        "notes": "Test agent 4",
        "gdpr": "yes",
    },
    {
        "name": "Giulia Costa",
        "email": "giulia.costa.test@gmail.com",
        "phone": "+39 345 5555555",
        "affiliation": "University of Turin",
        "role": "registration",
        "availability": "June 6",
        "notes": "Test agent 5",
        "gdpr": "yes",
    },
]

results = []

print("=" * 60)
print("VOLUNTEER REGISTRATION - MULTI-SUBMIT TEST")
print("=" * 60)

for i, entry in enumerate(entries, start=1):
    print(f"\n--- Submission {i}/5: {entry['name']} ---")

    try:
        resp = requests.post(ENDPOINT, data=entry, allow_redirects=True, timeout=30)

        had_redirects = len(resp.history) > 0
        body_preview = resp.text[:300]

        print(f"  HTTP status code : {resp.status_code}")
        print(f"  Redirects        : {'Yes (' + str(len(resp.history)) + ')' if had_redirects else 'No'}")
        print(f"  Response body    : {body_preview}")

        # Check for success
        success = False
        try:
            json_resp = resp.json()
            if json_resp.get("result") == "success" or "success" in str(json_resp).lower():
                success = True
        except Exception:
            if "success" in resp.text.lower():
                success = True

        status_label = "SUCCESS" if success else "FAILED"
        print(f"  Result           : {status_label}")
        results.append((entry["name"], success))

    except Exception as exc:
        print(f"  ERROR: {exc}")
        results.append((entry["name"], False))

    # Small delay between requests to be polite
    if i < len(entries):
        time.sleep(1)

# Summary
print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
succeeded = [name for name, ok in results if ok]
failed = [name for name, ok in results if not ok]

for name, ok in results:
    print(f"  {'[OK]  ' if ok else '[FAIL]'} {name}")

print(f"\nTotal: {len(succeeded)} succeeded, {len(failed)} failed out of {len(results)}")
print("=" * 60)
