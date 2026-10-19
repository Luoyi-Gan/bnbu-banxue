"""Exercise the optional standalone demo; no app accounts or business writes."""
from pathlib import Path
import unittest
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]


class MotionLab(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.driver = sync_playwright().start()
        cls.browser = cls.driver.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.driver.stop()

    def setUp(self):
        self.page = self.browser.new_page(viewport={'width': 390, 'height': 844})
        self.page.goto((ROOT / 'assets' / 'motion-lab.html').as_uri())

    def tearDown(self):
        self.page.close()

    def test_dialog_focus_and_escape(self):
        self.page.get_by_role('button', name='查看安排').click()
        expect(self.page.get_by_role('dialog')).to_be_visible()
        expect(self.page.get_by_role('button', name='返回首页')).to_be_focused()
        self.page.keyboard.press('Escape')
        expect(self.page.get_by_role('dialog')).not_to_be_visible()
        expect(self.page.get_by_role('button', name='查看安排')).to_be_focused()

    def test_failure_preserves_input_and_retry_can_succeed(self):
        self.page.get_by_label('安排名称', exact=True).fill('测试摄影安排')
        self.page.get_by_label('让本次模拟请求失败').check()
        self.page.get_by_role('button', name='模拟保存').click()
        expect(self.page.get_by_role('button', name='模拟保存')).to_be_disabled()
        expect(self.page.get_by_role('status')).to_contain_text('模拟请求失败')
        expect(self.page.get_by_label('安排名称', exact=True)).to_have_value('测试摄影安排')
        self.page.get_by_label('让本次模拟请求失败').uncheck()
        self.page.get_by_role('button', name='模拟保存').click()
        expect(self.page.get_by_role('status')).to_contain_text('模拟保存完成：测试摄影安排')

    def test_cancel_prevents_late_result(self):
        self.page.get_by_role('button', name='模拟保存').click()
        self.page.get_by_role('button', name='取消请求').click()
        # Wait past the deliberately simulated 900ms network boundary to detect a late write.
        self.page.wait_for_timeout(1100)
        expect(self.page.get_by_role('status')).to_have_text('已取消模拟请求，输入已保留。')
        expect(self.page.get_by_role('button', name='模拟保存')).to_be_enabled()

    def test_reduced_motion_runtime_change(self):
        self.page.emulate_media(reduced_motion='reduce')
        expect(self.page.locator('body')).to_have_class('reduced')
        self.page.get_by_role('button', name='展开更多').click()
        self.assertEqual(self.page.locator('.ui-motion-enter').evaluate('(el)=>getComputedStyle(el).animationName'), 'none')
        self.page.emulate_media(reduced_motion='no-preference')
        expect(self.page.locator('body')).not_to_have_class('reduced')
        self.page.get_by_label('在本页减少动态').check()
        expect(self.page.locator('body')).to_have_class('reduced')

    def test_mobile_layout_and_screenshot(self):
        self.assertFalse(self.page.evaluate('document.documentElement.scrollWidth>innerWidth'))
        self.page.set_viewport_size({'width': 1440, 'height': 1000})
        self.page.screenshot(path=str(ROOT / 'research' / 'motion-lab-desktop.png'), full_page=True)


if __name__ == '__main__':
    unittest.main()
