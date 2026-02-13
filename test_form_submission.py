#!/usr/bin/env python3
"""
Test submitting a form to a Google Apps Script web app.
Tries multiple approaches to find one that works.
"""

import requests
import urllib.request
import urllib.parse
import ssl
import json

URL = "https://script.google.com/macros/s/AKfycby-EqL9ijmYC3UVeMd6gNTb5uSqLGb7WNJgIAVWQaJNtEVEONiXcO_cq2qDm7n6HwEa/exec"

FORM_DATA = {
    "name": "Mario Rossi",
    "email": "test.volontario@gmail.com",
    "phone": "+39 333 9876543",
    "affiliation": "University of Bologna",
    "preferred_role": "session",
    "availability": "June 3, June 5",
    "notes": "Test submission from Python agent",
}

SEPARATOR = "=" * 70

def print_response_details(resp_status, resp_url, resp_body, redirect_history=None):
    print(f"  Status code: {resp_status}")
    if redirect_history:
        print(f"  Redirect chain ({len(redirect_history)} redirects):")
        for i, r in enumerate(redirect_history):
            print(f"    [{i+1}] {r.status_code} -> {r.headers.get('Location', 'N/A')}")
    if resp_url:
        print(f"  Final URL: {resp_url}")
    print(f"  Response body (first 500 chars):")
    print(f"  {resp_body[:500]}")
    print()


# ---------------------------------------------------------------
# APPROACH 1: POST with data= (form-urlencoded), session, redirects
# ---------------------------------------------------------------
print(SEPARATOR)
print("APPROACH 1: POST with requests session, data= (form-urlencoded)")
print(SEPARATOR)
try:
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    })
    resp = session.post(URL, data=FORM_DATA, allow_redirects=True, timeout=30)
    body = resp.text
    print_response_details(resp.status_code, resp.url, body, resp.history)

    # Check for success indicators
    if resp.status_code == 200 and ("success" in body.lower() or "thank" in body.lower() or "recorded" in body.lower() or "submitted" in body.lower()):
        print("  >>> APPROACH 1 SUCCEEDED <<<")
        approach1_ok = True
    else:
        print("  >>> APPROACH 1: Response received but unclear if submission succeeded.")
        approach1_ok = False
except Exception as e:
    print(f"  ERROR: {e}")
    approach1_ok = False

print()

# ---------------------------------------------------------------
# APPROACH 2: GET with query parameters
# ---------------------------------------------------------------
print(SEPARATOR)
print("APPROACH 2: GET with query parameters")
print(SEPARATOR)
try:
    session2 = requests.Session()
    session2.headers.update({
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    })
    resp2 = session2.get(URL, params=FORM_DATA, allow_redirects=True, timeout=30)
    body2 = resp2.text
    print_response_details(resp2.status_code, resp2.url, body2, resp2.history)

    if resp2.status_code == 200 and ("success" in body2.lower() or "thank" in body2.lower() or "recorded" in body2.lower() or "submitted" in body2.lower()):
        print("  >>> APPROACH 2 SUCCEEDED <<<")
        approach2_ok = True
    else:
        print("  >>> APPROACH 2: Response received but unclear if submission succeeded.")
        approach2_ok = False
except Exception as e:
    print(f"  ERROR: {e}")
    approach2_ok = False

print()

# ---------------------------------------------------------------
# APPROACH 3: urllib with proper opener and redirect handling
# ---------------------------------------------------------------
print(SEPARATOR)
print("APPROACH 3: urllib with opener and redirect handling")
print(SEPARATOR)
try:
    encoded_data = urllib.parse.urlencode(FORM_DATA).encode("utf-8")

    # Create an SSL context that works on macOS
    ctx = ssl.create_default_context()

    # Build an opener that follows redirects automatically
    opener = urllib.request.build_opener(
        urllib.request.HTTPSHandler(context=ctx),
        urllib.request.HTTPRedirectHandler(),
    )
    opener.addheaders = [
        ("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"),
        ("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
        ("Content-Type", "application/x-www-form-urlencoded"),
    ]

    req = urllib.request.Request(URL, data=encoded_data, method="POST")
    # urllib doesn't follow redirects for POST by default, so we handle it
    try:
        response3 = opener.open(req, timeout=30)
        body3 = response3.read().decode("utf-8", errors="replace")
        status3 = response3.getcode()
        final_url3 = response3.geturl()
    except urllib.error.HTTPError as he:
        # Google Apps Script often returns a 302 redirect; if POST redirect fails,
        # follow the redirect manually with GET
        if he.code in (301, 302, 303, 307, 308):
            redirect_url = he.headers.get("Location", "")
            print(f"  Got redirect ({he.code}) to: {redirect_url}")
            print(f"  Following redirect with GET...")
            req2 = urllib.request.Request(redirect_url, method="GET")
            response3 = opener.open(req2, timeout=30)
            body3 = response3.read().decode("utf-8", errors="replace")
            status3 = response3.getcode()
            final_url3 = response3.geturl()
        else:
            raise

    print_response_details(status3, final_url3, body3)

    if status3 == 200 and ("success" in body3.lower() or "thank" in body3.lower() or "recorded" in body3.lower() or "submitted" in body3.lower()):
        print("  >>> APPROACH 3 SUCCEEDED <<<")
        approach3_ok = True
    else:
        print("  >>> APPROACH 3: Response received but unclear if submission succeeded.")
        approach3_ok = False
except Exception as e:
    print(f"  ERROR: {type(e).__name__}: {e}")
    approach3_ok = False

print()

# ---------------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------------
print(SEPARATOR)
print("SUMMARY")
print(SEPARATOR)
results = {
    "Approach 1 (POST form-urlencoded)": approach1_ok,
    "Approach 2 (GET query params)": approach2_ok,
    "Approach 3 (urllib POST)": approach3_ok,
}
for name, ok in results.items():
    status = "SUCCEEDED" if ok else "UNCLEAR / FAILED"
    print(f"  {name}: {status}")

if any(results.values()):
    print("\nAt least one approach appeared to succeed.")
else:
    print("\nNo approach produced a clear success indicator.")
    print("Check the Google Sheet to see if any data was actually recorded.")
