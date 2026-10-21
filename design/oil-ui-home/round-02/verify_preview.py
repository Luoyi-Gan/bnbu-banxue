"""Exercise the authenticated local preview with existing isolated acceptance fixtures."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
import uuid
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
ORIGIN = 'http://127.0.0.1:4174'
PREVIEW = ORIGIN + '/v2/design/campus-window'


def run(homepage: bool = False) -> None:
    target = ORIGIN + '/v2' if homepage else PREVIEW
    out = OUT.parent / 'round-03' if homepage else OUT
    out.mkdir(parents=True, exist_ok=True)
    fixtures = json.loads((ROOT / 'data' / 'browser-acceptance-accounts.json').read_text(encoding='utf-8'))['accounts']
    actor = next(item for item in fixtures if item['email'] == 'student-a@example.test')
    report = {'preview': target, 'scope': 'Local acceptance fixtures only; homepage promotion.' if homepage else 'Local acceptance fixtures only; existing homepage retained.', 'checks': [], 'screenshots': []}
    with sync_playwright() as engine:
        browser = engine.chromium.launch()
        context = browser.new_context(viewport={'width': 390, 'height': 844})
        login = context.request.post(ORIGIN + '/api/auth/sign-in', data={'identifier': actor['email'], 'password': actor['password']})
        assert login.ok, 'Local acceptance login failed'
        page = context.new_page()
        page_errors = []
        page.on('pageerror', lambda error: page_errors.append(str(error)))

        def ready() -> None:
            page.goto(target)
            expect(page.locator('.cw-home')).to_be_visible()
            expect(page.locator('.cw-next')).to_have_attribute('href', re.compile(r'^/v2/'))
            page.evaluate('document.fonts.ready')
            page.wait_for_function('Array.from(document.querySelectorAll(".cw-home img")).every(i=>i.complete && i.naturalWidth>0)')

        if not homepage:
            page.goto(ORIGIN + '/v2')
            expect(page.locator('.ref-home')).to_be_visible()
            page.evaluate('document.fonts.ready')
            page.screenshot(path=str(out / 'baseline-mobile.png'), full_page=True)
        ready()
        primary = page.locator('.cw-next').get_attribute('href')
        page.locator('.cw-next').click()
        expect(page).to_have_url(ORIGIN + primary)
        page.go_back()
        expect(page.locator('.cw-home')).to_be_visible()
        report['checks'].append('Next arrangement opens its real object route and browser Back returns to preview.')

        search = page.locator('.cw-header').get_by_role('button', name='搜索校园', exact=True)
        search.click()
        expect(page.locator('.cw-header').get_by_role('textbox', name='搜索校园内容', exact=True)).to_be_focused()
        page.keyboard.press('Escape')
        expect(search).to_be_focused()
        page.get_by_role('button', name='打开课表窗口', exact=True).click()
        expect(page.get_by_role('dialog', name='我的课表', exact=True)).to_be_visible()
        page.get_by_role('button', name='关闭课表窗口', exact=True).click()
        report['checks'].append('Existing search focus/Escape and global timetable remain operable.')

        # Use only one fixture activity; restore its original relation even if an assertion fails.
        ready()
        save = page.locator('.cw-event-list .ref-save').first
        original = save.get_attribute('aria-pressed') == 'true'
        event_url = page.locator('.cw-event-list .ref-event-photo').first.get_attribute('href')
        event_id = event_url.rsplit('/', 1)[-1]
        try:
            save.click()
            expect(save).to_have_attribute('aria-pressed', str(not original).lower())
            page.reload()
            expect(page.locator('.cw-event-list .ref-save').first).to_have_attribute('aria-pressed', str(not original).lower())
            page.route('**/api/commands', lambda route: route.fulfill(status=503, content_type='application/json', body=json.dumps({'message': '本地检查：模拟保存失败，请重试。'})))
            page.locator('.cw-event-list .ref-save').first.click()
            expect(page.get_by_role('alert').filter(has_text='模拟保存失败')).to_be_visible()
            expect(page.locator('.cw-event-list .ref-save').first).to_have_attribute('aria-pressed', str(not original).lower())
            page.unroute('**/api/commands')
        finally:
            restored = context.request.post(ORIGIN + '/api/commands', data={'action': 'relation.set', 'input': {'id': event_id, 'kind': 'save', 'enabled': original}, 'requestId': str(uuid.uuid4())})
            assert restored.ok, 'Failed to restore the acceptance fixture relation'
        report['checks'].append('Save is read back after reload; simulated failure preserves state; original fixture relation restored.')

        ready()
        page.get_by_role('button', name='显示第 2 张校园照片', exact=True).click()
        expect(page.get_by_role('button', name='显示第 2 张校园照片', exact=True)).to_have_attribute('aria-pressed', 'true')
        expect(page.get_by_role('button', name='播放校园照片轮播', exact=True)).to_be_visible()
        page.emulate_media(reduced_motion='reduce')
        expect(page.get_by_role('button', name='播放校园照片轮播', exact=True)).to_have_count(0)
        durations = page.locator('.cw-scene>img').first.evaluate('(node)=>getComputedStyle(node).transitionDuration')
        assert all(float(value.strip().removesuffix('s')) <= .0001 for value in durations.split(',')), durations
        assert page.locator('.cw-next').evaluate('(node)=>getComputedStyle(node).animationName') == 'none'
        report['checks'].append('Manual photo selection pauses autoplay; runtime reduced-motion disables animation and autoplay controls.')

        for width, height, label in [(390, 844, 'mobile'), (320, 780, 'narrow'), (1440, 900, 'desktop'), (720, 450, 'zoom-layout')]:
            page.set_viewport_size({'width': width, 'height': height})
            assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'), f'Horizontal overflow: {label}'
            assert page.locator('.cw-next').is_visible()
            if width <= 640:
                timetable = page.locator('.v2-floating-timetable-trigger').bounding_box()
                toolbar = page.locator('.cw-header nav').bounding_box()
                assert timetable['x'] + timetable['width'] <= toolbar['x'] + 1, 'Timetable overlaps header tools'
            if label in {'mobile', 'desktop'}:
                page.get_by_role('button', name='显示第 1 张校园照片', exact=True).click()
                page.screenshot(path=str(out / f'{label}.png'), full_page=True)
                page.screenshot(path=str(out / f'{label}-first.png'))
                report['screenshots'].extend([f'{label}.png', f'{label}-first.png'])
            report['checks'].append(f'{label}: {width}x{height}, no horizontal overflow; primary arrangement visible.')

        # Error and empty states are browser-only responses, never seeded into business data.
        workspace = context.request.get(ORIGIN + '/api/workspace').json()
        empty = {**workspace, 'entities': [], 'notifications': [], 'sports': None, 'sportsStatus': 'unavailable', 'sportsDashboard': None,
                 'alumni': {**workspace['alumni'], 'bookings': []}}
        page.route('**/api/workspace', lambda route: route.fulfill(status=200, content_type='application/json', body=json.dumps(empty)))
        page.goto(target)
        expect(page.locator('.cw-next-empty')).to_contain_text('留一点时间')
        expect(page.locator('.cw-summary a').nth(2)).to_contain_text('—')
        expect(page.locator('.cw-summary a').nth(2)).not_to_contain_text('0%')
        page.unroute('**/api/workspace')
        page.route('**/api/workspace', lambda route: route.fulfill(status=503, content_type='application/json', body=json.dumps({'message': '本地检查：模拟读取失败。'})))
        page.goto(target)
        expect(page.locator('.cw-next-empty')).to_contain_text('暂时无法读取')
        expect(page.get_by_role('button', name='重新读取')).to_be_visible()
        page.unroute('**/api/workspace')
        page.get_by_role('button', name='重新读取').click()
        expect(page.locator('a.cw-next')).to_be_visible()
        report['checks'].append('Browser-only empty/error/retry states; unknown sports remains unknown, with no fake zero progress.')

        if homepage:
            page.goto(ORIGIN + '/v2/design/campus-window')
            expect(page).to_have_url(ORIGIN + '/v2')
            expect(page.locator('.cw-home')).to_be_visible()
            assert page.locator('.cw-preview-note').count() == 0
            for path in ['/v2/activities', '/v2/campus', '/v2/sports', '/v2/me', '/v2/messages']:
                page.goto(ORIGIN + path)
                expect(page).to_have_url(ORIGIN + path)
                expect(page.locator('.v2-main')).to_be_visible()
                expect(page.locator('.cw-home')).to_have_count(0)
            report['checks'].append('Preview bookmark redirects to new homepage; prototype controls removed; five existing student pages remain reachable.')
        else:
            page.goto(ORIGIN + '/v2')
            expect(page.locator('.ref-home')).to_be_visible()
            assert page.locator('.cw-home').count() == 0
        anonymous = browser.new_context()
        other = anonymous.new_page()
        other.goto(target)
        expect(other).to_have_url(ORIGIN + '/v2/login')
        anonymous.close()
        report['checks'].append('Anonymous access requires the existing login.')
        assert not page_errors, page_errors
        report['page_errors'] = page_errors
        report['result'] = 'passed'
        context.close()
        browser.close()
    (out / 'browser-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'result': report['result'], 'checks': len(report['checks']), 'screenshots': report['screenshots']}, ensure_ascii=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--homepage', action='store_true', help='Verify the promoted /v2 homepage and save round-03 evidence.')
    run(parser.parse_args().homepage)
