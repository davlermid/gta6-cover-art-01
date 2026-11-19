#!/usr/bin/env python3
"""Generate screenshots/ from shots.json with the local Playwright Chromium + smoke-test the editor."""
import json, os, sys

from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.abspath(__file__))
shots = json.load(open(os.path.join(ROOT, "shots.json")))
exe_root = os.path.join(os.environ["HOME"], ".cache/ms-playwright")
exe = None
for d in sorted(os.listdir(exe_root)):
    for sub in ("chrome-linux/chrome", "chrome-headless-shell-linux64/chrome-headless-shell"):
        cand = os.path.join(exe_root, d, sub)
        if os.path.exists(cand):
            exe = cand
if not exe:
    sys.exit("no chromium found")

errors = []

def make_page(browser, w, h):
    page = browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append("pageerror: %s" % e))
    return page

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=exe, args=["--no-sandbox", "--force-color-profile=srgb"])
    for s in shots:
        page = make_page(browser, s["w"], s["h"])
        page.goto("http://localhost:8080/" + s["query"], wait_until="networkidle")
        page.wait_for_function("window.__shotReady === true", timeout=15000)
        page.wait_for_timeout(300)
        page.screenshot(path=os.path.join(ROOT, "screenshots", s["name"]), type="jpeg", quality=82)
        page.close()
        print("shot", s["name"], os.path.getsize(os.path.join(ROOT, "screenshots", s["name"])), "bytes")

    # smoke test the editor
    page = make_page(browser, 1280, 800)
    page.goto("http://localhost:8080/", wait_until="networkidle")
    page.wait_for_timeout(1000)
    painted = page.evaluate(
        "(() => { const c = document.getElementById('cover'); const d = c.getContext('2d')"
        ".getImageData(0,0,c.width,c.height).data; let s=0; for (let i=0;i<d.length;i+=40) s+=d[i]+d[i+1]+d[i+2];"
        " return s; })()"
    )
    # exercise interactions: click a panel, wheel zoom, randomize, undo
    page.mouse.move(640, 380)
    page.mouse.wheel(0, -240)
    page.wait_for_timeout(200)
    page.click("#randomize")
    page.wait_for_timeout(300)
    page.click("#undo")
    page.wait_for_timeout(300)
    page.click("#redo")
    page.wait_for_timeout(300)
    # export one PNG offscreen
    page.evaluate(
        "(() => { const b=document.querySelector('.exports button'); b.click(); return true; })()"
    )
    page.wait_for_timeout(500)
    print("editor canvas paint sample:", painted)
    page.close()
    browser.close()

print("console errors:", errors if errors else "none")
