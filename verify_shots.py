#!/usr/bin/env python3
"""Full verification: load app, exercise interactions, export PNG at all sizes, count console errors."""
import os
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.abspath(__file__))
exe_root = os.path.join(os.environ["HOME"], ".cache/ms-playwright")
exe = None
for d in sorted(os.listdir(exe_root)):
    for sub in ("chrome-linux/chrome", "chrome-headless-shell-linux64/chrome-headless-shell"):
        cand = os.path.join(exe_root, d, sub)
        if os.path.exists(cand):
            exe = cand
assert exe, "no chromium"

errors = []
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=exe, args=["--no-sandbox"])
    page = browser.new_page(viewport={"width": 1280, "height": 800}, device_scale_factor=1, accept_downloads=True)
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append("pageerror: %s" % e))
    page.goto("http://localhost:8080/", wait_until="networkidle")
    page.wait_for_timeout(1200)

    # fonts really loaded?
    loaded = page.evaluate("(() => [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family))()")
    print("loaded fonts:", sorted(set(loaded)))
    assert any("Archivo Black" in f for f in loaded), "Archivo Black not loaded"

    # default state uses the new lettering
    dflt = page.evaluate("(() => { const i=[...document.fonts].findIndex(f=>f.family==='Archivo Black'); return i })()")
    sel = page.eval_on_selector("#titleStyle", "el => el.value")
    font_sel = page.eval_on_selector("#titleFont", "el => el.value")
    print("default titleStyle:", sel, "| default titleFont:", font_sel)
    assert sel == "gta" and font_sel == "Archivo Black"

    # interactions: panel pick, wheel zoom, randomize, undo/redo, reset, style/font/stroke changes
    page.mouse.move(640, 380); page.mouse.wheel(0, -240); page.wait_for_timeout(150)
    page.click("#randomize"); page.wait_for_timeout(250)
    page.click("#undo"); page.wait_for_timeout(150)
    page.click("#redo"); page.wait_for_timeout(150)
    page.select_option("#titleStyle", "sunset"); page.wait_for_timeout(100)
    page.select_option("#titleStyle", "gta"); page.wait_for_timeout(100)
    page.select_option("#titleFont", "Anton"); page.wait_for_timeout(100)
    page.select_option("#titleFont", "Archivo Black"); page.wait_for_timeout(100)
    page.eval_on_selector("#titleStroke", "el => { el.value = 16; el.dispatchEvent(new Event('input')); }")
    page.wait_for_timeout(150)
    page.fill("#title", "NIGHT SHIFT"); page.wait_for_timeout(150)
    page.fill("#subtitle", "streets after midnight"); page.wait_for_timeout(150)
    page.click("#reset"); page.wait_for_timeout(600)
    stroke_ui = page.eval_on_selector("#titleStrokeVal", "el => el.textContent")
    print("stroke UI after reset:", stroke_ui)
    assert stroke_ui == "14%", stroke_ui

    # PNG export at all sizes: intercept the real downloads and verify each file is a real PNG
    n_btns = page.eval_on_selector_all(".exports button", "els => els.length")
    exports = []
    for i in range(n_btns):
        with page.expect_download(timeout=10000) as dl_info:
            page.eval_on_selector_all(".exports button", f"els => els[{i}].click()")
        dl = dl_info.value
        path = "/tmp/export-%d.png" % i
        dl.save_as(path)
        head = open(path, "rb").read(8)
        size = os.path.getsize(path)
        exports.append({"name": dl.suggested_filename, "png_magic": head == b"\x89PNG\r\n\x1a\n", "size": size})
    print("exports:", exports)
    assert len(exports) == 4 and all(e["png_magic"] and e["size"] > 50000 for e in exports), exports

    browser.close()

print("console errors:", errors if errors else "none")
assert not errors, errors
print("ALL CHECKS PASSED")
