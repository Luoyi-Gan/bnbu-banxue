"""Local acceptance screenshots and existing read-only paths for the companion pages."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
ORIGIN = 'http://127.0.0.1:4174'
PAGES = {'discover': '/v2/activities', 'campus': '/v2/campus', 'me': '/v2/me'}

def run(baseline=False):
    accounts = json.loads((ROOT / 'data/browser-acceptance-accounts.json').read_text(encoding='utf-8'))['accounts']
    actor = next(a for a in accounts if a['email'] == 'student-a@example.test')
    report = {'scope': 'Local acceptance fixtures, visual styling and existing read-only interactions.', 'checks': [], 'page_errors': []}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={'width':390, 'height':844}, reduced_motion='reduce')
        assert context.request.post(ORIGIN+'/api/auth/sign-in', data={'identifier':actor['email'], 'password':actor['password']}).ok
        page = context.new_page()
        page.on('pageerror', lambda e: report['page_errors'].append(str(e)))
        for name, path in PAGES.items():
            page.goto(ORIGIN+path)
            expect(page.locator('.ref-'+name)).to_be_visible()
            page.wait_for_function("!document.querySelector('.ref-page').innerText.includes('正在读取')")
            page.evaluate('document.fonts.ready')
            for label, width, height in [('mobile',390,844), ('desktop',1440,900), ('narrow',320,780), ('zoom',720,450)]:
                page.set_viewport_size({'width':width,'height':height})
                assert not page.evaluate('document.documentElement.scrollWidth > innerWidth'), (name,label)
                if label in ('mobile','desktop'):
                    page.screenshot(path=str(OUT/f'{"baseline-" if baseline else ""}{name}-{label}.png'), full_page=True)
                    if not baseline and label == 'mobile':
                        page.screenshot(path=str(OUT/f'{name}-first.png'))
                report['checks'].append(f'{name}: {label} has no horizontal overflow')
        if not baseline:
            page.set_viewport_size({'width':390,'height':844})
            page.goto(ORIGIN+PAGES['discover'])
            search=page.get_by_role('searchbox',name='搜索校园活动')
            search.fill('no-matching-acceptance-activity')
            expect(page.get_by_text('没有符合条件的活动，试试其他筛选。',exact=True)).to_be_visible()
            page.get_by_role('button',name='清除筛选',exact=True).click()
            expect(search).to_have_value('')
            expect(page.locator('.ref-event').first).to_be_visible()
            page.get_by_role('combobox',name='活动排序').select_option('推荐顺序')
            page.locator('.ref-event-photo').first.click()
            expect(page).to_have_url(__import__('re').compile('/v2/activities/[^?]+'))
            page.go_back()
            report['checks'].append('Discover search, empty state, clear filters, sorting and actual activity detail work')
            page.goto(ORIGIN+PAGES['campus'])
            days=page.get_by_role('navigation',name='选择课程星期').get_by_role('button')
            days.nth(2).click()
            expect(days.nth(2)).to_have_attribute('aria-pressed','true')
            page.get_by_role('link',name='完整课表').click()
            expect(page).to_have_url(ORIGIN+'/v2/me?tab=timetable')
            expect(page.get_by_role('region',name='我的课表',exact=True)).to_be_visible()
            report['checks'].append('Campus weekday selection and full personal timetable work')
            page.goto(ORIGIN+PAGES['me'])
            page.get_by_role('button',name='更换封面',exact=True).click()
            dialog=page.get_by_role('dialog')
            expect(dialog).to_be_visible()
            expect(dialog.locator('.ref-cover-options button')).to_have_count(4)
            page.keyboard.press('Escape')
            expect(dialog).to_have_count(0)
            page.locator('.ref-menu').get_by_role('link',name='我的收藏',exact=False).click()
            expect(page).to_have_url(ORIGIN+'/v2/me?tab=saved')
            expect(page.locator('.ref-subpage')).to_be_visible()
            report['checks'].append('Profile cover chooser opens/cancels; saved-items route works without writing preferences')
            for name,path in PAGES.items():
                page.goto(ORIGIN+path)
                page.get_by_role('button',name='打开课表窗口',exact=True).click()
                expect(page.get_by_role('dialog',name='我的课表',exact=True)).to_be_visible()
                page.get_by_role('button',name='关闭课表窗口',exact=True).click()
            report['checks'].append('Global timetable remains reachable from all three pages')
            page.goto(ORIGIN+'/v2')
            expect(page.locator('.cw-home')).to_be_visible()
            page.goto(ORIGIN+'/v2/sports')
            expect(page.locator('.cw-pages')).to_have_count(0)
            report['checks'].append('Existing campus-window home and sports route remain separate')
        assert not report['page_errors'], report['page_errors']
        browser.close()
    report['result']='passed'
    (OUT/('baseline-report.json' if baseline else 'browser-report.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'result':'passed','checks':len(report['checks'])}))

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--baseline',action='store_true')
    run(parser.parse_args().baseline)
