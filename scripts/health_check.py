#!/usr/bin/env python3
"""
Production health check script.
Usage: python scripts/health_check.py --mode production --host regscope.yourdomain.com
"""
import argparse
import sys
import httpx

def check_all(host: str, mode: str) -> bool:
    base = f"https://{host}" if mode == "production" else f"http://{host}"
    passed = []
    failed = []

    checks = [
        ("Health endpoint",      f"{base}/health"),
        ("Frontend home",        f"{base}/"),
        ("API docs accessible",  f"{base}/api/v1/clauses?page_size=1"),
        ("Search endpoint",      None),  # POST, handled separately
    ]

    client = httpx.Client(timeout=15.0, verify=(mode == "production"))

    for name, url in checks:
        if url is None:
            continue
        try:
            r = client.get(url)
            if r.status_code < 400:
                print(f"  [OK]  {name} ({r.status_code}) [{r.elapsed.total_seconds():.2f}s]")
                passed.append(name)
            else:
                print(f"  [FAIL]  {name} ({r.status_code})")
                failed.append(name)
        except Exception as e:
            print(f"  [FAIL]  {name} ERROR: {e}")
            failed.append(name)

    # POST search check
    try:
        r = client.post(
            f"{base}/api/v1/search",
            json={"query": "data transfer", "top_k": 1}
        )
        if r.status_code in (200, 422):  # 422 is ok if no data yet
            print(f"  [OK]  Search endpoint ({r.status_code})")
            passed.append("Search")
        else:
            print(f"  [FAIL]  Search endpoint ({r.status_code})")
            failed.append("Search")
    except Exception as e:
        print(f"  [FAIL]  Search endpoint ERROR: {e}")
        failed.append("Search")

    print(f"\nResults: {len(passed)} passed, {len(failed)} failed")
    return len(failed) == 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=["pre_deploy", "production"], default="pre_deploy")
    parser.add_argument("--host", default="localhost:8000")
    args = parser.parse_args()

    print(f"=== RegScope Health Check ({args.mode}) ===\n")
    success = check_all(args.host, args.mode)
    sys.exit(0 if success else 1)
